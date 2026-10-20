import express, { Request, Response } from 'express';
import {
  PipelineInput,
  runTaskPlannerAgent,
  runResearchDiscoveryAgent,
  runKnowledgeGraphAgent,
  runVerificationAgent,
  runAnalysisAndReasoningAgent,
  runDecisionPlanningAgent,
  runVamyaOrchestrator,
  runHarnessBenchmark,
  runFastAgentAnalysis,
} from './geminiService';

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '10mb' }));

// Healthcheck
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'VAMYA Autonomous Multi-Agent Runtime',
    version: '2.5.0',
    agents: [
      'Task Planner Agent',
      'Research Discovery Agent',
      'Knowledge Graph Agent',
      'Verification Agent (gemini-4-argon with High Thinking)',
      'Analysis & Reasoning Agent (gemini-4-argon with High Thinking)',
      'Decision Planning Agent',
      'VAMYA Master Orchestrator',
    ],
  });
});

// Run single step in pipeline
apiRouter.post('/step', async (req: Request, res: Response) => {
  try {
    const { step, input, context } = req.body;
    if (!step || !input) {
      return res.status(400).json({ error: 'Missing step or input parameters' });
    }

    let result;
    switch (step) {
      case 'taskPlanner':
        result = await runTaskPlannerAgent(input);
        break;
      case 'researchDiscovery':
        result = await runResearchDiscoveryAgent(input, context?.taskPlanner?.data || {});
        break;
      case 'knowledgeGraph':
        result = await runKnowledgeGraphAgent(input, {
          taskPlanner: context?.taskPlanner?.data || {},
          research: context?.researchDiscovery?.data || {},
        });
        break;
      case 'verification':
        result = await runVerificationAgent(input, {
          knowledgeGraph: context?.knowledgeGraph?.data || {},
          research: context?.researchDiscovery?.data || {},
        });
        break;
      case 'analysisReasoning':
        result = await runAnalysisAndReasoningAgent(input, {
          verification: context?.verification?.data || {},
          knowledgeGraph: context?.knowledgeGraph?.data || {},
        });
        break;
      case 'decisionPlanning':
        result = await runDecisionPlanningAgent(input, {
          analysisReasoning: context?.analysisReasoning?.data || {},
          verification: context?.verification?.data || {},
        });
        break;
      case 'vamyaOrchestrator':
        result = await runVamyaOrchestrator(input, context || {});
        break;
      default:
        return res.status(400).json({ error: `Unknown pipeline step: ${step}` });
    }

    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Pipeline step error:', error);
    res.status(500).json({
      error: error.message || 'Failed executing pipeline step',
      details: String(error),
    });
  }
});

// Run full pipeline sequentially
apiRouter.post('/pipeline', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const input: PipelineInput = req.body;
    if (!input.projectName || !input.goal) {
      return res.status(400).json({ error: 'projectName and goal are required' });
    }

    const stageResults: Record<string, any> = {};

    // 1. Task Planner
    stageResults.taskPlanner = await runTaskPlannerAgent(input);

    // 2. Research Discovery
    stageResults.researchDiscovery = await runResearchDiscoveryAgent(input, stageResults.taskPlanner.data);

    // 3. Knowledge Graph
    stageResults.knowledgeGraph = await runKnowledgeGraphAgent(input, {
      taskPlanner: stageResults.taskPlanner.data,
      research: stageResults.researchDiscovery.data,
    });

    // 4. Verification (gemini-4-argon with ThinkingLevel.HIGH)
    stageResults.verification = await runVerificationAgent(input, {
      knowledgeGraph: stageResults.knowledgeGraph.data,
      research: stageResults.researchDiscovery.data,
    });

    // 5. Analysis & Reasoning (gemini-4-argon with ThinkingLevel.HIGH)
    stageResults.analysisReasoning = await runAnalysisAndReasoningAgent(input, {
      verification: stageResults.verification.data,
      knowledgeGraph: stageResults.knowledgeGraph.data,
    });

    // 6. Decision Planning
    stageResults.decisionPlanning = await runDecisionPlanningAgent(input, {
      analysisReasoning: stageResults.analysisReasoning.data,
      verification: stageResults.verification.data,
    });

    // 7. VAMYA Orchestrator
    stageResults.vamyaOrchestrator = await runVamyaOrchestrator(input, stageResults);

    res.json({
      success: true,
      totalDurationMs: Date.now() - startTime,
      input,
      stages: stageResults,
    });
  } catch (error: any) {
    console.error('Full pipeline error:', error);
    res.status(500).json({
      error: error.message || 'Failed executing VAMYA pipeline',
      details: String(error),
    });
  }
});

// Run Benchmark Harness
apiRouter.post('/harness', async (req: Request, res: Response) => {
  try {
    const { testCase } = req.body;
    if (!testCase || !testCase.prompt) {
      return res.status(400).json({ error: 'Invalid testCase payload' });
    }
    const result = await runHarnessBenchmark(testCase);
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Harness error:', error);
    res.status(500).json({ error: error.message || 'Harness benchmark failed' });
  }
});

// Fast analysis with gemini-3.1-flash-lite
apiRouter.post('/fast-ask', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const answer = await runFastAgentAnalysis(prompt);
    res.json({ success: true, answer });
  } catch (error: any) {
    console.error('Fast ask error:', error);
    res.status(500).json({ error: error.message || 'Fast ask failed' });
  }
});
