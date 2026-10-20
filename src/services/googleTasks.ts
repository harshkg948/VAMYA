import { GoogleTaskList, GoogleTaskItem } from '../types/agent';
import { getAccessToken } from './firebase';

const TASKS_API_BASE = 'https://tasks.googleapis.com/tasks/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Tasks access token is missing or expired. Please sign in with Google.');
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Tasks API error: ${response.status} ${response.statusText}`);
  }

  // 204 No Content for DELETE
  if (response.status === 204) {
    return true;
  }

  return response.json();
}

// Fetch all task lists
export async function getGoogleTaskLists(): Promise<GoogleTaskList[]> {
  const data = await fetchWithAuth(`${TASKS_API_BASE}/users/@me/lists`);
  return data.items || [];
}

// Create a new task list (e.g. for VAMYA projects)
export async function createGoogleTaskList(title: string): Promise<GoogleTaskList> {
  return await fetchWithAuth(`${TASKS_API_BASE}/users/@me/lists`, {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

// Fetch tasks for a list
export async function getGoogleTasks(taskListId: string): Promise<GoogleTaskItem[]> {
  const data = await fetchWithAuth(`${TASKS_API_BASE}/lists/${taskListId}/tasks?showCompleted=true&showHidden=true`);
  return data.items || [];
}

// Create a single task
export async function createGoogleTask(
  taskListId: string,
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTaskItem> {
  return await fetchWithAuth(`${TASKS_API_BASE}/lists/${taskListId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({
      title: task.title,
      notes: task.notes || '',
      due: task.due,
      status: 'needsAction',
    }),
  });
}

// Mark task as completed or toggle
export async function updateGoogleTaskStatus(
  taskListId: string,
  taskId: string,
  status: 'needsAction' | 'completed'
): Promise<GoogleTaskItem> {
  return await fetchWithAuth(`${TASKS_API_BASE}/lists/${taskListId}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Delete task
export async function deleteGoogleTask(taskListId: string, taskId: string): Promise<boolean> {
  return await fetchWithAuth(`${TASKS_API_BASE}/lists/${taskListId}/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

// Batch sync agent action items to Google Tasks
export async function syncAgentTasksToGoogleTasks(
  taskListTitle: string,
  items: { title: string; notes?: string; priority?: string }[]
): Promise<{ listId: string; createdCount: number }> {
  // 1. Get or create list
  const existingLists = await getGoogleTaskLists();
  let targetList = existingLists.find((l) => l.title.toLowerCase() === taskListTitle.toLowerCase());

  if (!targetList) {
    targetList = await createGoogleTaskList(taskListTitle);
  }

  let createdCount = 0;
  for (const item of items) {
    const formattedNotes = `Priority: ${item.priority || 'P1'}\nSource: VAMYA Multi-Agent Decision Engine\n\n${item.notes || ''}`;
    await createGoogleTask(targetList.id, {
      title: item.title,
      notes: formattedNotes,
    });
    createdCount++;
  }

  return { listId: targetList.id, createdCount };
}
