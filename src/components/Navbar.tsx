import React from 'react';
import { User } from 'firebase/auth';
import {
  Cpu,
  Layers,
  Network,
  Container,
  CheckSquare,
  Sparkles,
  LogOut,
  FolderGit2,
  FileText,
  Leaf,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'pipeline' | 'visualization' | 'docker' | 'harness' | 'tasks';
  onSelectTab: (tab: 'pipeline' | 'visualization' | 'docker' | 'harness' | 'tasks') => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isAuthenticating: boolean;
  selectedProjectName: string;
  onOpenExport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onSignIn,
  onSignOut,
  isAuthenticating,
  selectedProjectName,
  onOpenExport,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/35 bg-[#070e0a]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand with Botanical Nature Accent */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-lime-400 p-[1px] shadow-lg shadow-emerald-900/30">
              <div className="w-full h-full bg-[#070e0a] rounded-[11px] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-stone-100 font-mono">
                  VAMYA
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  v2.5 Runtime
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                AI Tech & Product Design Multi-Agent System
              </p>
            </div>
          </div>

          {/* Navigation Links with Forest Moss Styling */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#0b1711]/80 p-1 rounded-xl border border-emerald-900/40">
            <button
              onClick={() => onSelectTab('pipeline')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'pipeline'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-stone-300 hover:text-emerald-200 hover:bg-emerald-950/40'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Pipeline Studio</span>
            </button>

            <button
              onClick={() => onSelectTab('visualization')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'visualization'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-stone-300 hover:text-emerald-200 hover:bg-emerald-950/40'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Agent Visualization</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            <button
              onClick={() => onSelectTab('docker')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'docker'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-stone-300 hover:text-emerald-200 hover:bg-emerald-950/40'
              }`}
            >
              <Container className="w-4 h-4" />
              <span>Docker & Runtime</span>
            </button>

            <button
              onClick={() => onSelectTab('harness')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'harness'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-stone-300 hover:text-emerald-200 hover:bg-emerald-950/40'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Eval Harness</span>
            </button>

            <button
              onClick={() => onSelectTab('tasks')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'tasks'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-stone-300 hover:text-emerald-200 hover:bg-emerald-950/40'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Google Tasks</span>
            </button>
          </nav>

          {/* Right Action / Auth Button */}
          <div className="flex items-center gap-2.5">
            {/* Project Indicator */}
            {selectedProjectName && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-[#0b1711] rounded-lg border border-emerald-900/40 text-xs text-stone-300">
                <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[130px] truncate">{selectedProjectName}</span>
              </div>
            )}

            {/* Export Architecture Button */}
            {onOpenExport && (
              <button
                onClick={onOpenExport}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1711] hover:bg-[#12241b] text-emerald-300 hover:text-emerald-200 rounded-lg border border-emerald-900/50 text-xs font-mono transition"
                title="Export current pipeline architecture as JSON or PDF report"
              >
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                <span>Export</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2 bg-[#0b1711] border border-emerald-900/40 py-1 px-2.5 rounded-xl">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-emerald-800/40"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-xs flex items-center justify-center font-bold text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-stone-300 font-medium hidden sm:inline max-w-[100px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1 text-stone-400 hover:text-rose-400 rounded-md transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Official Google Sign-In Material Button */
              <button
                onClick={onSignIn}
                disabled={isAuthenticating}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-white text-stone-900 text-xs font-semibold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-4 h-4"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                </svg>
                <span>{isAuthenticating ? 'Connecting...' : 'Sign in'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-emerald-950 overflow-x-auto space-x-2 scrollbar-none">
          <button
            onClick={() => onSelectTab('pipeline')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
              currentTab === 'pipeline' ? 'bg-emerald-600 text-white' : 'text-stone-400'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => onSelectTab('visualization')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
              currentTab === 'visualization' ? 'bg-emerald-600 text-white' : 'text-stone-400'
            }`}
          >
            Visualization
          </button>
          <button
            onClick={() => onSelectTab('docker')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
              currentTab === 'docker' ? 'bg-emerald-600 text-white' : 'text-stone-400'
            }`}
          >
            Docker
          </button>
          <button
            onClick={() => onSelectTab('harness')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
              currentTab === 'harness' ? 'bg-emerald-600 text-white' : 'text-stone-400'
            }`}
          >
            Harness
          </button>
          <button
            onClick={() => onSelectTab('tasks')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
              currentTab === 'tasks' ? 'bg-emerald-600 text-white' : 'text-stone-400'
            }`}
          >
            Google Tasks
          </button>
        </div>
      </div>
    </header>
  );
};
