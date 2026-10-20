import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  CheckSquare,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Sparkles,
  Leaf,
} from 'lucide-react';
import { GoogleTaskList, GoogleTaskItem, ActionableTask } from '../types/agent';
import {
  getGoogleTaskLists,
  getGoogleTasks,
  createGoogleTask,
  updateGoogleTaskStatus,
  deleteGoogleTask,
  createGoogleTaskList,
} from '../services/googleTasks';
import { getAccessToken } from '../services/firebase';
import { ConfirmationModal } from './ConfirmationModal';

interface GoogleTasksViewProps {
  user: User | null;
  onSignIn: () => void;
  pendingAgentTasks?: ActionableTask[];
  onTasksSynced?: () => void;
}

export const GoogleTasksView: React.FC<GoogleTasksViewProps> = ({
  user,
  onSignIn,
  pendingAgentTasks = [],
  onTasksSynced,
}) => {
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // New List form state
  const [newListTitle, setNewListTitle] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);

  // Confirmation modal states for destructive/mutating actions (per workspace skill)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  const loadTaskLists = async () => {
    const token = await getAccessToken();
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const lists = await getGoogleTaskLists();
      setTaskLists(lists);
      if (lists.length > 0 && !selectedListId) {
        setSelectedListId(lists[0].id);
      }
    } catch (err: any) {
      console.error('Failed fetching task lists:', err);
      setError(err.message || 'Failed connecting to Google Tasks.');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (listId: string) => {
    if (!listId) return;
    setLoading(true);
    setError(null);
    try {
      const items = await getGoogleTasks(listId);
      setTasks(items);
    } catch (err: any) {
      console.error('Failed fetching tasks:', err);
      setError(err.message || 'Failed retrieving tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadTaskLists();
    }
  }, [user]);

  useEffect(() => {
    if (selectedListId) {
      loadTasks(selectedListId);
    }
  }, [selectedListId]);

  // Handle Add Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedListId) return;

    setIsCreatingTask(true);
    try {
      await createGoogleTask(selectedListId, {
        title: newTaskTitle.trim(),
        notes: newTaskNotes.trim(),
      });
      setNewTaskTitle('');
      setNewTaskNotes('');
      await loadTasks(selectedListId);
    } catch (err: any) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Handle Create List
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    setIsCreatingList(true);
    try {
      const newList = await createGoogleTaskList(newListTitle.trim());
      setNewListTitle('');
      await loadTaskLists();
      setSelectedListId(newList.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create task list.');
    } finally {
      setIsCreatingList(false);
    }
  };

  // Toggle Task Completion with confirmation per workspace skill
  const triggerToggleTask = (task: GoogleTaskItem) => {
    const willComplete = task.status !== 'completed';
    setConfirmModal({
      isOpen: true,
      title: willComplete ? 'Mark Task as Completed?' : 'Mark Task as Incomplete?',
      message: `Do you want to update the status of "${task.title}" in Google Tasks?`,
      confirmLabel: willComplete ? 'Mark Complete' : 'Mark Incomplete',
      isDestructive: false,
      action: async () => {
        try {
          await updateGoogleTaskStatus(
            selectedListId,
            task.id,
            willComplete ? 'completed' : 'needsAction'
          );
          await loadTasks(selectedListId);
        } catch (err: any) {
          setError(err.message || 'Failed to update task.');
        }
      },
    });
  };

  // Delete Task with explicit confirmation dialog per workspace skill
  const triggerDeleteTask = (task: GoogleTaskItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Task from Google Tasks?',
      message: `Are you sure you want to permanently delete "${task.title}"? This cannot be undone.`,
      confirmLabel: 'Delete Task',
      isDestructive: true,
      action: async () => {
        try {
          await deleteGoogleTask(selectedListId, task.id);
          await loadTasks(selectedListId);
        } catch (err: any) {
          setError(err.message || 'Failed to delete task.');
        }
      },
    });
  };

  // Batch Sync Agent Action Items with confirmation
  const triggerBatchSyncAgentTasks = () => {
    if (!pendingAgentTasks.length || !selectedListId) return;

    setConfirmModal({
      isOpen: true,
      title: 'Sync Sprint Tasks to Google Tasks?',
      message: `This will create ${pendingAgentTasks.length} design sprint action items in your selected Google Tasks list ("${
        taskLists.find((l) => l.id === selectedListId)?.title || 'Selected List'
      }").`,
      confirmLabel: `Sync ${pendingAgentTasks.length} Tasks`,
      isDestructive: false,
      action: async () => {
        setLoading(true);
        try {
          for (const item of pendingAgentTasks) {
            await createGoogleTask(selectedListId, {
              title: item.title,
              notes: `Priority: ${item.priority} | Category: ${item.category}\nEst: ${item.estimatedHours}h\n\n${item.notes || ''}\n\nGenerated by VAMYA Autonomous Multi-Agent Runtime`,
            });
          }
          await loadTasks(selectedListId);
          if (onTasksSynced) onTasksSynced();
        } catch (err: any) {
          setError(err.message || 'Failed batch syncing tasks.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // If user is not authenticated, show official Sign In card in nature theme
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-[#0b1711]/85 rounded-2xl border border-emerald-900/40 text-center space-y-6 shadow-xl shadow-emerald-950/30">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckSquare className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-stone-100 font-mono">
            Google Tasks Workspace Integration
          </h2>
          <p className="mt-2 text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
            Connect your Google account to automatically sync design sprint roadmaps, architecture verification checklists, and agent deliverables into your Google Tasks lists.
          </p>
        </div>

        <div className="pt-2">
          {/* Official Google Sign In button */}
          <button
            onClick={onSignIn}
            className="inline-flex items-center gap-3 px-6 py-3 bg-stone-100 hover:bg-white text-stone-900 text-sm font-semibold rounded-xl shadow-lg transition-all active:scale-[0.98]"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>

        <p className="text-xs text-stone-500 font-mono">
          OAuth Scopes: https://www.googleapis.com/auth/tasks
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-[#0b1711]/85 rounded-2xl border border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Leaf className="w-3 h-3 text-emerald-400" />
              <span>Google Workspace Live Sync</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Authenticated as {user.email}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-stone-100 tracking-tight font-mono">
            Google Tasks Synchronization
          </h1>
          <p className="mt-1 text-sm text-stone-300 max-w-2xl leading-relaxed">
            Direct two-way synchronization with your Google Tasks account. Create, inspect, complete, or batch-import deliverables synthesized by VAMYA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingAgentTasks.length > 0 && (
            <button
              onClick={triggerBatchSyncAgentTasks}
              disabled={loading || !selectedListId}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Sync {pendingAgentTasks.length} Pipeline Tasks</span>
            </button>
          )}

          <button
            onClick={() => loadTasks(selectedListId)}
            disabled={loading || !selectedListId}
            className="p-2 bg-[#11241a] hover:bg-[#183626] text-stone-200 rounded-xl border border-emerald-800/40 transition"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Lists & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Task Lists */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-[#0b1711]/60 rounded-2xl border border-emerald-900/40 space-y-4">
            <h3 className="font-bold text-stone-100 text-sm font-mono flex items-center justify-between">
              <span>Your Task Lists</span>
              <span className="text-xs text-stone-400 font-normal">{taskLists.length} lists</span>
            </h3>

            {/* List picker */}
            <div className="space-y-1.5">
              {taskLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                    selectedListId === list.id
                      ? 'bg-emerald-900/30 text-emerald-200 border border-emerald-500/50'
                      : 'bg-[#070e0a] text-stone-400 hover:text-stone-200 border border-emerald-900/30 hover:border-emerald-700'
                  }`}
                >
                  <span className="truncate">{list.title}</span>
                  {selectedListId === list.id && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Create List Form */}
            <form onSubmit={handleCreateList} className="pt-3 border-t border-emerald-900/30 space-y-2">
              <label className="text-[11px] font-mono text-stone-400 block">
                Create New Google Task List
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. VAMYA Product Sprints"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="w-full bg-[#070e0a] border border-emerald-900/50 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isCreatingList || !newListTitle.trim()}
                  className="px-3 py-1.5 bg-[#11241a] hover:bg-[#183626] disabled:opacity-50 text-stone-200 text-xs font-medium rounded-lg border border-emerald-800/40 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Tasks in Selected List */}
        <div className="lg:col-span-8 space-y-4">
          {/* New Task Form */}
          <form
            onSubmit={handleCreateTask}
            className="p-4 bg-[#0b1711]/60 rounded-2xl border border-emerald-900/40 space-y-3"
          >
            <h3 className="font-bold text-stone-100 text-sm font-mono flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Task to Selected List</span>
            </h3>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Task title (e.g. Finalize STRIDE mitigation rules)"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-[#070e0a] border border-emerald-900/50 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
              />
              <textarea
                placeholder="Optional notes, acceptance criteria, or architectural context..."
                rows={2}
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                className="w-full bg-[#070e0a] border border-emerald-900/50 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isCreatingTask || !newTaskTitle.trim() || !selectedListId}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium rounded-xl shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isCreatingTask ? 'Creating...' : 'Add to Google Tasks'}</span>
              </button>
            </div>
          </form>

          {/* Tasks List */}
          <div className="p-4 bg-[#0b1711]/60 rounded-2xl border border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
              <h3 className="font-bold text-stone-100 text-sm font-mono">
                {taskLists.find((l) => l.id === selectedListId)?.title || 'Tasks'}
              </h3>
              <span className="text-xs text-stone-400 font-mono">
                {tasks.filter((t) => t.status === 'completed').length} / {tasks.length} Completed
              </span>
            </div>

            {loading && tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400 font-mono flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Loading Google Tasks...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400 font-mono">
                No tasks found in this list. Create one or sync from the pipeline!
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => {
                  const isCompleted = task.status === 'completed';

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                        isCompleted
                          ? 'bg-[#070e0a]/40 border-emerald-950 opacity-60'
                          : 'bg-[#070e0a] border-emerald-900/40 hover:border-emerald-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => triggerToggleTask(task)}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'border-stone-600 hover:border-emerald-500'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div>
                          <p
                            className={`text-xs font-medium text-stone-200 ${
                              isCompleted ? 'line-through text-stone-500' : ''
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.notes && (
                            <p className="mt-1 text-[11px] text-stone-400 whitespace-pre-line leading-relaxed font-mono">
                              {task.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => triggerDeleteTask(task)}
                        className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-[#11241a] rounded-lg transition flex-shrink-0"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
        onConfirm={async () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await confirmModal.action();
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
