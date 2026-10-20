import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Save Project
export async function saveProject(project: {
  id: string;
  title: string;
  description: string;
  domain: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
}) {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be signed in to save project');
  const path = `projects/${project.id}`;

  try {
    await setDoc(doc(db, 'projects', project.id), {
      ...project,
      ownerId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch Projects
export async function getProjects() {
  const user = auth.currentUser;
  if (!user) return [];
  const path = 'projects';

  try {
    const q = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Save Agent Run
export async function saveAgentRun(projectId: string, run: {
  id: string;
  prompt: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  currentAgent: string;
  data: any;
}) {
  const user = auth.currentUser;
  if (!user) return;
  const path = `projects/${projectId}/agent_runs/${run.id}`;

  try {
    await setDoc(doc(db, 'projects', projectId, 'agent_runs', run.id), {
      ...run,
      projectId,
      ownerId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Get Agent Runs
export async function getAgentRuns(projectId: string) {
  const user = auth.currentUser;
  if (!user) return [];
  const path = `projects/${projectId}/agent_runs`;

  try {
    const snap = await getDocs(collection(db, 'projects', projectId, 'agent_runs'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Save Knowledge Nodes
export async function saveKnowledgeNodes(projectId: string, nodes: any[]) {
  const user = auth.currentUser;
  if (!user || !nodes.length) return;

  for (const node of nodes) {
    const nodeId = node.id || `node-${Math.random().toString(36).substring(2, 9)}`;
    const path = `projects/${projectId}/knowledge_nodes/${nodeId}`;
    try {
      await setDoc(doc(db, 'projects', projectId, 'knowledge_nodes', nodeId), {
        ...node,
        projectId,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

// Save Benchmark Harness Result
export async function saveHarnessResult(projectId: string, result: any) {
  const user = auth.currentUser;
  if (!user) return;
  const resultId = `harness-${Date.now()}`;
  const path = `projects/${projectId}/harness_results/${resultId}`;

  try {
    await setDoc(doc(db, 'projects', projectId, 'harness_results', resultId), {
      ...result,
      ownerId: user.uid,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
