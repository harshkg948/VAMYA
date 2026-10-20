import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Search,
  Network,
  Shield,
  BrainCircuit,
  Workflow,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Container,
  CheckSquare,
  Cpu,
  Database,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck,
  ShieldAlert,
  FileText,
  Download,
  Leaf,
} from 'lucide-react';
import {
  PipelineExecutionResult,
  PipelineInput,
  ActionableTask,
} from '../types/agent';
import { saveAgentRun, saveKnowledgeNodes } from '../services/firestoreService';
import { ExportReportModal } from './ExportReportModal';

interface PresetIdea {
  title: string;
  domain: string;
  goal: string;
  techConstraints: string;
}

const PRESETS: PresetIdea[] = [
  {
    title: 'FinTech Realtime Payment Gateway & Distributed Ledger',
    domain: 'Financial Technology / Payments',
    goal: 'Build an ultra-low-latency financial ledger processing 50,000 tx/sec with idempotency, double-entry bookkeeping, and real-time fraud mitigation.',
    techConstraints: 'Zero-trust ABAC, PCI-DSS compliance, PostgreSQL with read-replicas, Redis distributed locks, Docker multi-stage.',
  },
  {
    title: 'Collaborative Spatial 3D Design Canvas & Realtime Studio',
    domain: 'Creative Tools / Spatial Computing',
    goal: 'Develop a web-based collaborative 3D scene builder with real-time multi-user cursor sync, WebGL/Three.js rendering, and asset versioning.',
    techConstraints: 'CRDT state reconciliation, WebSockets, sub-16ms render loop, indexedDB offline caching, containerized microservices.',
  },
  {
    title: 'HIPAA-Compliant Telehealth & Vital Telemetry Hub',
    domain: 'Digital Health / Telemedicine',
    goal: 'Architect an end-to-end encrypted remote patient monitoring platform capturing wearable vitals, clinical notes, and WebRTC consultations.',
    techConstraints: 'Strict HIPAA PII isolation, WebRTC SRTP encryption, auditable change logs, Firebase Firestore with security rules.',
  },
  {
    title: 'Autonomous Edge IoT Fleet Manager & Telemetry Pipeline',
    domain: 'Industrial IoT / Edge Computing',
    goal: 'Design a high-throughput edge telemetry ingester managing 100,000 field IoT devices with intermittent connectivity and OTA firmware rollouts.',
    techConstraints: 'MQTT message broker, Protobuf binary serialization, time-series storage, Docker edge runtime with healthcheck probes.',
  },
];

interface PipelineStudioProps {
  pipelineResult: PipelineExecutionResult | null;
  onPipelineCompleted: (result: PipelineExecutionResult) => void;
  onNavigateToDocker: () => void;
  onNavigateToVisualization: () => void;
  onNavigateToTasks: () => void;
  currentProjectId?: string;
}

export const PipelineStudio: React.FC<PipelineStudioProps> = ({
  pipelineResult,
  onPipelineCompleted,
  onNavigateToDocker,
  onNavigateToVisualization,
  onNavigateToTasks,
  currentProjectId = 'default-project',
}) => {
  const [projectName, setProjectName] = useState(
    pipelineResult?.projectName || 'FinTech Realtime Payment Gateway & Distributed Ledger'
  );
  const [domain, setDomain] = useState(
    pipelineResult?.domain || 'Financial Technology / Payments'
  );
  const [goal, setGoal] = useState(
    pipelineResult?.goal ||
      'Build an ultra-low-latency financial ledger processing 50,000 tx/sec with idempotency, double-entry bookkeeping, and real-time fraud mitigation.'
  );
  const [techConstraints, setTechConstraints] = useState(
    'Zero-trust ABAC, PCI-DSS compliance, PostgreSQL with read-replicas, Redis distributed locks, Docker multi-stage.'
  );

  const [isRunning, setIsRunning] = useState(false);
  const [currentRunningStage, setCurrentRunningStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<string>('vamyaOrchestrator');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleSelectPreset = (preset: PresetIdea) => {
    setProjectName(preset.title);
    setDomain(preset.domain);
    setGoal(preset.goal);
    setTechConstraints(preset.techConstraints);
  };

  const executePipeline = async () => {
    if (!projectName.trim() || !goal.trim()) return;

    setIsRunning(true);
    setError(null);

    const input: PipelineInput = {
      projectName: projectName.trim(),
      domain: domain.trim(),
      goal: goal.trim(),
      techConstraints: techConstraints.trim(),
    };

    try {
      // 1. Task Planner
      setCurrentRunningStage('taskPlanner');
      const step1Res = await fetch('/api/agent/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'taskPlanner', input }),
      }).then((r) => r.json());

      if (!step1Res.success) throw new Error(step1Res.error || 'Task Planner failed');

      // 2. Research Discovery
      setCurrentRunningStage('researchDiscovery');
      const step2Res = await fetch('/api/agent/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'researchDiscovery',
          input,
          context: { taskPlanner: step1Res.result },
        }),
      }).then((r) => r.json());

      if (!step2Res.success) throw new Error(step2Res.error || 'Research Discovery failed');

      // 3. Knowledge Graph
      setCurrentRunningStage('knowledgeGraph');
      const step3Res = await fetch('/api/agent/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'knowledgeGraph',
          input,
          context: {
            taskPlanner: step1Res.result,
            researchDiscovery: step2Res.result,
          },
        }),
      }).then((r) => r.json());

      if (!step3Res.success) throw new Error(step3Res.error || 'Knowledge Graph failed');

      // 4. Verification (gemini-4-argon with ThinkingLevel.HIGH)
      setCurrentRunningStage('verification');
      const step4Res = await fetch('/api/agent/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'verification',
          input,
          context: {
            knowledgeGraph: step3Res.result,
            researchDiscovery: step2Res.result,
          },
        }),
      }).then((r) => r.json());

      if (!step4Res.success) throw new Error(step4Res.error || 'Verification failed');

      // 5. Analysis & Reasoning (gemini-4-argon with ThinkingLevel.HIGH)
      setCurrentRunningStage('analysisReasoning');
      const step5Res = await fetch('/api/agent/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'analysisReasoning',
          input,
          context: {
            verification: step4Res.result,
            knowledgeGraph: step3Res.result,
          },
        }),
      }).then((r) => r.json());

      if (!step5Res.success) throw new Error(step5Res.error || 'Analysis & Reasoning failed');

      // 6. Decision Planning
      setCurrentRunningStage('decisionPlanning');
      const step6Res = await fetch('/api/agent/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'decisionPlanning',
          input,
          context: {
            analysisReasoning: step5Res.result,
            verification: step4Res.result,
          },
        }),
      }).then((r) => r.json());

      if (!step6Res.success) throw new Error(step6Res.error || 'Decision Planning failed');

      // 7. VAMYA Master Orchestrator
      setCurrentRunningStage('vamyaOrchestrator');
      const fullContext = {
        taskPlanner: step1Res.result,
        researchDiscovery: step2Res.result,
        knowledgeGraph: step3Res.result,
        verification: step4Res.result,
        analysisReasoning: step5Res.result,
        decisionPlanning: step6Res.result,
      };

      const step7Res = await fetch('/api/agent/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'vamyaOrchestrator',
          input,
          context: fullContext,
        }),
      }).then((r) => r.json());

      if (!step7Res.success) throw new Error(step7Res.error || 'VAMYA Orchestrator failed');

      const fullResult: PipelineExecutionResult = {
        projectName: input.projectName,
        domain: input.domain,
        goal: input.goal,
        totalDurationMs:
          step1Res.result.durationMs +
          step2Res.result.durationMs +
          step3Res.result.durationMs +
          step4Res.result.durationMs +
          step5Res.result.durationMs +
          step6Res.result.durationMs +
          step7Res.result.durationMs,
        stages: {
          taskPlanner: step1Res.result,
          researchDiscovery: step2Res.result,
          knowledgeGraph: step3Res.result,
          verification: step4Res.result,
          analysisReasoning: step5Res.result,
          decisionPlanning: step6Res.result,
          vamyaOrchestrator: step7Res.result,
        },
      };

      onPipelineCompleted(fullResult);
      setActiveOutputTab('vamyaOrchestrator');

      // Save run to Google Cloud Firestore database
      saveAgentRun(currentProjectId, {
        id: `run-${Date.now()}`,
        prompt: input.goal,
        status: 'completed',
        currentAgent: 'vamyaOrchestrator',
        data: fullResult,
      }).catch(console.error);

      // Save knowledge nodes
      if (step3Res.result?.data?.entities) {
        saveKnowledgeNodes(currentProjectId, step3Res.result.data.entities).catch(console.error);
      }
    } catch (err: any) {
      console.error('Pipeline execution error:', err);
      setError(err.message || 'Pipeline execution failed.');
    } finally {
      setIsRunning(false);
      setCurrentRunningStage(null);
    }
  };

  const stagesList = [
    { id: 'taskPlanner', label: '1. Task Planner', model: 'gemini-3.8-flash', icon: Layers, thinking: false },
    { id: 'researchDiscovery', label: '2. Research Discovery', model: 'gemini-3.8-flash', icon: Search, thinking: false },
    { id: 'knowledgeGraph', label: '3. Knowledge Graph', model: 'gemini-3.8-flash', icon: Network, thinking: false },
    { id: 'verification', label: '4. Verification', model: 'gemini-4-argon', icon: Shield, thinking: true },
    { id: 'analysisReasoning', label: '5. Analysis & Reasoning', model: 'gemini-4-argon', icon: BrainCircuit, thinking: true },
    { id: 'decisionPlanning', label: '6. Decision Planning', model: 'gemini-3.8-flash', icon: Workflow, thinking: false },
    { id: 'vamyaOrchestrator', label: '7. VAMYA Orchestrator', model: 'gemini-3.8-flash', icon: Sparkles, thinking: false },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Configuration Card with Nature Botanical Palette */}
      <div className="p-6 bg-[#0b1711]/85 rounded-2xl border border-emerald-900/40 space-y-6 shadow-xl shadow-emerald-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Leaf className="w-3 h-3 text-emerald-400" />
                <span>Autonomous AI Runtime</span>
              </span>
              <span className="text-xs font-mono text-teal-300">
                Gemini 4 Argon (High Thinking) + Gemini 3.8 Flash
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-stone-100 tracking-tight font-mono">
              VAMYA Multi-Agent Pipeline Studio
            </h1>
            <p className="mt-1 text-sm text-stone-300 max-w-2xl leading-relaxed">
              Deconstruct, research, model, verify, reason, and orchestrate production-grade technology and product designs through an autonomous 7-agent pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              disabled={!pipelineResult}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#11241a] hover:bg-[#183626] disabled:opacity-40 text-emerald-200 font-semibold text-xs rounded-xl border border-emerald-800/40 transition-all active:scale-[0.98] shadow-sm"
              title="Export architecture as JSON file or executive PDF presentation report"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Export Design (JSON / PDF)</span>
            </button>

            <button
              onClick={executePipeline}
              disabled={isRunning || !goal.trim()}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
            >
              {isRunning ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isRunning ? 'Orchestrating Agents...' : 'Execute Agent Pipeline'}</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-[11px] font-mono uppercase text-stone-400 tracking-wider block mb-2">
            Load Architectural Blueprint Presets:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                  projectName === preset.title
                    ? 'bg-emerald-900/30 border-emerald-500/70 text-emerald-200 shadow-sm'
                    : 'bg-[#070e0a]/80 border-emerald-900/40 text-stone-300 hover:border-emerald-700 hover:text-stone-100'
                }`}
              >
                <span className="font-semibold text-stone-100 truncate block">
                  {preset.title}
                </span>
                <span className="text-[10px] text-emerald-400/80 mt-1 font-mono">{preset.domain}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-stone-300 block mb-1">
              Project Title
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-[#070e0a] border border-emerald-900/50 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-stone-300 block mb-1">
              Domain / Vertical
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-[#070e0a] border border-emerald-900/50 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-mono text-stone-300 block mb-1">
              Product Goal & Mission-Critical Requirements
            </label>
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-[#070e0a] border border-emerald-900/50 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-mono text-stone-300 block mb-1">
              Architectural Constraints & Target Infrastructure (Docker, Google Database, SOTA stacks)
            </label>
            <input
              type="text"
              value={techConstraints}
              onChange={(e) => setTechConstraints(e.target.value)}
              className="w-full bg-[#070e0a] border border-emerald-900/50 rounded-xl px-3.5 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Live Pipeline Execution Sequence Bar */}
      <div className="p-4 bg-[#0b1711]/70 rounded-2xl border border-emerald-900/40">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40 text-xs font-mono text-stone-400">
          <span>Specialized Agent Execution Pipeline</span>
          <span className="text-emerald-400">
            {isRunning
              ? `Currently Executing: ${stagesList.find((s) => s.id === currentRunningStage)?.label || ''}`
              : pipelineResult
              ? `All 7 Agents Completed in ${(pipelineResult.totalDurationMs / 1000).toFixed(1)}s`
              : 'Pipeline Idle - Ready for Execution'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-3">
          {stagesList.map((stage) => {
            const isCurrent = currentRunningStage === stage.id;
            const isCompleted = pipelineResult && pipelineResult.stages[stage.id as keyof typeof pipelineResult.stages];

            return (
              <div
                key={stage.id}
                onClick={() => isCompleted && setActiveOutputTab(stage.id)}
                className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-emerald-900/40 border-emerald-400 animate-pulse text-white'
                    : isCompleted
                    ? 'bg-[#070e0a]/90 border-emerald-900/40 hover:border-emerald-700 cursor-pointer text-stone-200'
                    : 'bg-[#070e0a]/30 border-emerald-950/40 text-stone-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <stage.icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-teal-400' : isCompleted ? 'text-emerald-400' : 'text-stone-600'}`} />
                  {stage.thinking && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950/60 text-amber-300 font-bold border border-amber-600/40">
                      THINKING
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-semibold block truncate text-[11px]">{stage.label}</span>
                  <span className="text-[9px] font-mono text-stone-400 block truncate">{stage.model}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Output Artifacts Inspector */}
      {pipelineResult && (
        <div className="bg-[#0b1711]/70 rounded-2xl border border-emerald-900/40 overflow-hidden space-y-4">
          {/* Artifact Nav Tabs */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#070e0a] border-b border-emerald-900/40 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5">
              {stagesList.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setActiveOutputTab(stage.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition ${
                    activeOutputTab === stage.id
                      ? 'bg-emerald-600 text-white shadow font-semibold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-[#0f2319]'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToVisualization}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-400 hover:text-emerald-300 font-mono"
              >
                <span>Topology View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tab 7: VAMYA Master Blueprint */}
          {activeOutputTab === 'vamyaOrchestrator' && (
            <div className="p-6 space-y-6">
              {/* Verdict Banner with Forest Glow */}
              <div className="p-5 bg-gradient-to-r from-emerald-950/60 via-teal-950/50 to-[#070e0a] rounded-2xl border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                        VAMYA Supreme Executive Verdict
                      </span>
                      <h3 className="text-lg font-bold text-stone-100 font-mono">
                        {pipelineResult.stages.vamyaOrchestrator.data.vamyaVerdict || 'READY FOR PRODUCTION'}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-stone-400 block">System Health</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {pipelineResult.stages.vamyaOrchestrator.data.systemHealthIndex || 96}/100
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsExportModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono rounded-xl shadow transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Export Report</span>
                    </button>
                    <button
                      onClick={onNavigateToDocker}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#12241b] hover:bg-[#193627] text-stone-200 text-xs font-mono rounded-xl border border-emerald-800/40 transition"
                    >
                      <Container className="w-3.5 h-3.5 text-teal-400" />
                      <span>Docker Manifest</span>
                    </button>
                    <button
                      onClick={onNavigateToTasks}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono rounded-xl shadow transition"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Google Tasks</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Master Blueprint Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#070e0a] rounded-xl border border-emerald-900/40 space-y-2">
                  <h4 className="font-bold text-stone-200 font-mono text-sm flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>Architecture Overview</span>
                  </h4>
                  <p className="text-stone-300 leading-relaxed">
                    {pipelineResult.stages.vamyaOrchestrator.data.masterBlueprint?.architectureOverview}
                  </p>
                </div>

                <div className="p-4 bg-[#070e0a] rounded-xl border border-emerald-900/40 space-y-2">
                  <h4 className="font-bold text-stone-200 font-mono text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    <span>Data Flow & State Model</span>
                  </h4>
                  <p className="text-stone-300 leading-relaxed">
                    {pipelineResult.stages.vamyaOrchestrator.data.masterBlueprint?.dataFlowModel}
                  </p>
                </div>

                <div className="p-4 bg-[#070e0a] rounded-xl border border-emerald-900/40 space-y-2">
                  <h4 className="font-bold text-stone-200 font-mono text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-lime-400" />
                    <span>UX Design System Overview</span>
                  </h4>
                  <p className="text-stone-300 leading-relaxed">
                    {pipelineResult.stages.vamyaOrchestrator.data.masterBlueprint?.uxDesignSystemOverview}
                  </p>
                </div>

                <div className="p-4 bg-[#070e0a] rounded-xl border border-emerald-900/40 space-y-2">
                  <h4 className="font-bold text-stone-200 font-mono text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Security Guardrails</span>
                  </h4>
                  <ul className="space-y-1 text-stone-300 list-disc list-inside">
                    {pipelineResult.stages.vamyaOrchestrator.data.masterBlueprint?.securityGuardrails?.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 bg-[#070e0a]/80 rounded-xl border border-emerald-900/40">
                <span className="text-[11px] font-mono uppercase text-stone-400 tracking-wider block mb-1">
                  Executive Orchestrator Synthesis
                </span>
                <p className="text-xs text-stone-300 leading-relaxed font-mono">
                  {pipelineResult.stages.vamyaOrchestrator.data.vamyaExecutiveSummary}
                </p>
              </div>
            </div>
          )}

          {/* Tab 1: Task Planner */}
          {activeOutputTab === 'taskPlanner' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-white text-base font-mono">
                  Product Vision & Milestones DAG
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  {pipelineResult.stages.taskPlanner.data.projectVision}
                </p>
              </div>

              {/* Architectural Pillars */}
              <div>
                <h4 className="text-xs font-mono uppercase text-stone-400 tracking-wider mb-2">
                  Architectural Pillars
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {pipelineResult.stages.taskPlanner.data.architecturalPillars?.map((p, i) => (
                    <div key={i} className="p-3 bg-[#070e0a] rounded-xl border border-emerald-900/40 text-xs text-stone-200 font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Phases */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-stone-400 tracking-wider">
                  Milestone Execution Phases
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pipelineResult.stages.taskPlanner.data.milestones?.map((m, i) => (
                    <div key={i} className="p-4 bg-[#070e0a] rounded-xl border border-emerald-900/40 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                          {m.phase}
                        </span>
                        <span className="text-stone-500 text-[10px] font-mono">Phase {i + 1}</span>
                      </div>
                      <h5 className="font-semibold text-stone-200 font-mono">{m.name}</h5>
                      <ul className="space-y-1 text-stone-400 list-disc list-inside">
                        {m.deliverables?.map((d, di) => (
                          <li key={di}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Research Discovery */}
          {activeOutputTab === 'researchDiscovery' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-white text-base font-mono">
                  State-of-the-Art (SOTA) Tech & Ergonomics
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  {pipelineResult.stages.researchDiscovery.data.researchSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {pipelineResult.stages.researchDiscovery.data.stateOfTheArt?.map((item, i) => (
                  <div key={i} className="p-4 bg-[#070e0a] rounded-xl border border-emerald-900/40 space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300">
                      {item.area}
                    </span>
                    <h5 className="font-semibold text-stone-100 font-mono text-sm">{item.recommendedTech}</h5>
                    <p className="text-stone-300 leading-relaxed">{item.benchmarkAdvantages}</p>
                    <div className="text-[11px] text-stone-400 font-mono">
                      Alternatives: {item.alternativesConsidered?.join(', ')}
                    </div>
                  </div>
                ))}
              </div>

              {/* UX Paradigms */}
              <div>
                <h4 className="text-xs font-mono uppercase text-stone-400 tracking-wider mb-2">
                  UX Paradigms & Ergonomics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {pipelineResult.stages.researchDiscovery.data.uxDesignParadigms?.map((ux, i) => (
                    <div key={i} className="p-3 bg-[#070e0a] rounded-xl border border-emerald-900/40 space-y-1">
                      <h6 className="font-semibold text-emerald-300 font-mono">{ux.patternName}</h6>
                      <p className="text-stone-400 text-[11px]">{ux.problemSolved}</p>
                      <p className="text-teal-400 text-[11px] font-mono">Impact: {ux.userImpact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Knowledge Graph */}
          {activeOutputTab === 'knowledgeGraph' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base font-mono">
                    System Ontology Entities & Relations
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    {pipelineResult.stages.knowledgeGraph.data.ontologySummary}
                  </p>
                </div>
                <button
                  onClick={onNavigateToVisualization}
                  className="px-3 py-1.5 bg-[#12241b] hover:bg-[#1a3828] text-emerald-300 text-xs font-mono rounded-lg border border-emerald-800/40 transition"
                >
                  View Canvas
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {pipelineResult.stages.knowledgeGraph.data.entities?.map((e, i) => (
                  <div key={i} className="p-3.5 bg-[#070e0a] rounded-xl border border-emerald-900/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                        {e.category}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">{e.criticality}</span>
                    </div>
                    <h5 className="font-semibold text-stone-200 font-mono">{e.label}</h5>
                    <p className="text-stone-400 text-xs">{e.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Verification Agent (gemini-4-argon with High Thinking) */}
          {activeOutputTab === 'verification' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-amber-950/25 border border-amber-500/40 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      GEMINI 4 ARGON • HIGH THINKING AUDIT
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-100 font-mono mt-1">
                    STRIDE Security & Scalability Verification
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-stone-400 block">Verification Score</span>
                  <span className="text-3xl font-extrabold text-amber-400 font-mono">
                    {pipelineResult.stages.verification.data.verificationScore}/100
                  </span>
                </div>
              </div>

              {/* STRIDE Threats */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-stone-400 tracking-wider">
                  STRIDE Threat Modeling Findings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {pipelineResult.stages.verification.data.securityAudits?.map((threat, i) => (
                    <div key={i} className="p-4 bg-[#070e0a] rounded-xl border border-emerald-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#11241a] text-stone-300">
                          {threat.threatCategory}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            threat.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {threat.severity}
                        </span>
                      </div>
                      <p className="text-stone-200 font-semibold">{threat.vulnerability}</p>
                      <p className="text-stone-400 text-[11px] leading-relaxed">
                        <strong className="text-emerald-400">Mitigation:</strong> {threat.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Analysis & Reasoning (gemini-4-argon with High Thinking) */}
          {activeOutputTab === 'analysisReasoning' && (
            <div className="p-6 space-y-6">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  GEMINI 4 ARGON • DEEP REASONING
                </span>
                <h3 className="text-lg font-bold text-stone-100 font-mono mt-1">
                  Multi-Dimensional Trade-off Matrix & Debt Forecast
                </h3>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  {pipelineResult.stages.analysisReasoning.data.reasoningSynthesis}
                </p>
              </div>

              {/* Trade-off Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-stone-400 tracking-wider">
                  Evaluated Trade-off Decisions
                </h4>
                <div className="space-y-3">
                  {pipelineResult.stages.analysisReasoning.data.tradeOffMatrices?.map((matrix, i) => (
                    <div key={i} className="p-4 bg-[#070e0a] rounded-xl border border-emerald-900/40 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-200 font-mono text-sm">{matrix.dimension}</span>
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                          Selected: {matrix.recommendedChoice}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-stone-400 text-[11px]">
                        <div>Option A: {matrix.optionA}</div>
                        <div>Option B: {matrix.optionB}</div>
                      </div>
                      <p className="text-stone-300 text-xs leading-relaxed pt-1 border-t border-emerald-950">
                        {matrix.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Decision Planning */}
          {activeOutputTab === 'decisionPlanning' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-white text-base font-mono">
                  Architectural Decision Records (ADRs) & Action Backlog
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  {pipelineResult.stages.decisionPlanning.data.executiveSummary}
                </p>
              </div>

              {/* ADRs */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-stone-400 tracking-wider">
                  Codified ADRs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {pipelineResult.stages.decisionPlanning.data.adrs?.map((adr, i) => (
                    <div key={i} className="p-4 bg-[#070e0a] rounded-xl border border-emerald-900/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-emerald-400 font-bold">{adr.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400">
                          {adr.status}
                        </span>
                      </div>
                      <h5 className="font-semibold text-stone-200 font-mono">{adr.title}</h5>
                      <p className="text-stone-300 leading-relaxed"><strong className="text-stone-400">Decision:</strong> {adr.decision}</p>
                      <p className="text-stone-400 text-[11px] leading-relaxed"><strong className="text-stone-500">Consequences:</strong> {adr.consequences}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Backlog ready for Google Tasks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-stone-400 tracking-wider">
                    Sprint Action Backlog ({pipelineResult.stages.decisionPlanning.data.actionableTasks?.length || 0} tickets)
                  </h4>
                  <button
                    onClick={onNavigateToTasks}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono rounded-lg transition"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Sync to Google Tasks</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {pipelineResult.stages.decisionPlanning.data.actionableTasks?.map((task, i) => (
                    <div key={i} className="p-3 bg-[#070e0a] rounded-xl border border-emerald-900/40 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            task.priority === 'P0' ? 'bg-rose-500/20 text-rose-300' : 'bg-[#11241a] text-stone-300'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="font-medium text-stone-200">{task.title}</span>
                        </div>
                        <span className="text-[11px] text-stone-400 font-mono mt-0.5 block">
                          Category: {task.category} • Est: {task.estimatedHours}h
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Report & Presentation Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        pipelineResult={pipelineResult}
      />
    </div>
  );
};
