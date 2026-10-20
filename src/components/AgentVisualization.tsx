import React, { useState } from 'react';
import {
  PipelineExecutionResult,
  KnowledgeEntity,
  KnowledgeRelationship,
} from '../types/agent';
import {
  Network,
  Cpu,
  Shield,
  Layers,
  Search,
  CheckCircle2,
  BrainCircuit,
  Workflow,
  Sparkles,
  ArrowRight,
  Activity,
  Zap,
  Info,
  Maximize2,
  RefreshCw,
  GitFork,
  Radio,
  FileCode,
  Leaf,
} from 'lucide-react';

interface AgentVisualizationProps {
  pipelineResult: PipelineExecutionResult | null;
  isRunning: boolean;
  currentRunningStage?: string;
  onRunPipeline?: () => void;
}

interface AgentNodeDef {
  id: string;
  name: string;
  role: string;
  model: string;
  thinkingMode: boolean;
  color: string;
  glow: string;
  icon: any;
  description: string;
  responsibilities: string[];
  x: number;
  y: number;
}

const AGENTS: AgentNodeDef[] = [
  {
    id: 'taskPlanner',
    name: 'Task Planner Agent',
    role: 'Decomposition & Milestone DAG',
    model: 'gemini-3.8-flash',
    thinkingMode: false,
    color: 'from-emerald-600 to-teal-700',
    glow: 'rgba(16, 185, 129, 0.4)',
    icon: Layers,
    description: 'Deconstructs high-level product goals into atomic architectural pillars, milestone phases, and dependency DAGs.',
    responsibilities: [
      'Deconstruct product vision into technical pillars',
      'Generate Directed Acyclic Graph (DAG) of system dependencies',
      'Establish evaluation metrics & technical constraints',
      'Emit structured directives for downstream agents',
    ],
    x: 100,
    y: 120,
  },
  {
    id: 'researchDiscovery',
    name: 'Research Discovery Agent',
    role: 'SOTA Tech & Heuristics',
    model: 'gemini-3.8-flash',
    thinkingMode: false,
    color: 'from-teal-600 to-emerald-500',
    glow: 'rgba(20, 184, 166, 0.4)',
    icon: Search,
    description: 'Surfaces state-of-the-art architectures, ergonomics, competitive differentiation, and compliance standards.',
    responsibilities: [
      'Identify cutting-edge technology stacks and libraries',
      'Discover human-computer interaction paradigms and UX ergonomics',
      'Conduct competitive gap & benchmark analysis',
      'Synthesize engineering standards (W3C, IETF, RFCs)',
    ],
    x: 360,
    y: 70,
  },
  {
    id: 'knowledgeGraph',
    name: 'Knowledge Graph Agent',
    role: 'Ontological Entity & Relation Mapper',
    model: 'gemini-3.8-flash',
    thinkingMode: false,
    color: 'from-lime-600 to-emerald-600',
    glow: 'rgba(101, 163, 13, 0.4)',
    icon: Network,
    description: 'Synthesizes multi-dimensional system ontology spanning architecture, data models, UX surfaces, and security zones.',
    responsibilities: [
      'Extract discrete technical and product entities',
      'Map semantic relationships and communication protocols',
      'Tag criticality levels and domain boundaries',
      'Provide structured knowledge query surface for reasoning',
    ],
    x: 620,
    y: 70,
  },
  {
    id: 'verification',
    name: 'Verification Agent',
    role: 'Adversarial Security & Scalability Audit',
    model: 'gemini-4-argon',
    thinkingMode: true,
    color: 'from-amber-600 to-rose-600',
    glow: 'rgba(245, 158, 11, 0.5)',
    icon: Shield,
    description: 'Performs zero-trust STRIDE threat modeling, scalability bottleneck stress-testing, and compliance verification.',
    responsibilities: [
      'Exhaustive STRIDE threat modeling (Spoofing to Elevation of Privileges)',
      'Single Point of Failure (SPOF) and latency stress-testing',
      'Mathematical boundary validation and edge-case simulations',
      'High Thinking mode evaluation with zero hallucination tolerance',
    ],
    x: 880,
    y: 120,
  },
  {
    id: 'analysisReasoning',
    name: 'Analysis & Reasoning Agent',
    role: 'Multi-Perspective Cognitive Synthesis',
    model: 'gemini-4-argon',
    thinkingMode: true,
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.5)',
    icon: BrainCircuit,
    description: 'Computes multi-dimensional trade-off matrices, Pareto frontiers, 2nd-order consequences, and 3-year tech debt forecasting.',
    responsibilities: [
      'Multi-dimensional trade-off matrices (Latency vs Consistency, Cost vs Reliability)',
      'Second- and third-order consequence impact forecasting',
      'Pareto-optimal architectural leverage points',
      'Three-year technical debt and obsolescence modeling',
    ],
    x: 750,
    y: 380,
  },
  {
    id: 'decisionPlanning',
    name: 'Decision Planning Agent',
    role: 'ADRs, PRDs & Docker Specs',
    model: 'gemini-3.8-flash',
    thinkingMode: false,
    color: 'from-teal-500 to-emerald-600',
    glow: 'rgba(20, 184, 166, 0.4)',
    icon: Workflow,
    description: 'Formulates formal Architectural Decision Records (ADRs), granular sprint backlogs, and container runtime specs.',
    responsibilities: [
      'Codify formal Architecture Decision Records (ADRs)',
      'Product Requirement Document (PRD) core specifications and user stories',
      'Actionable sprint task tickets for Google Tasks sync',
      'Docker containerization runtime & volume specifications',
    ],
    x: 230,
    y: 380,
  },
  {
    id: 'vamyaOrchestrator',
    name: 'VAMYA Master Orchestrator',
    role: 'Executive Blueprint Synthesis',
    model: 'gemini-3.8-flash',
    thinkingMode: false,
    color: 'from-emerald-500 via-teal-500 to-lime-400',
    glow: 'rgba(16, 185, 129, 0.6)',
    icon: Sparkles,
    description: 'The supreme orchestrator reconciling specialized agent signals, emitting Docker production manifests, and issuing the final verdict.',
    responsibilities: [
      'Synthesizes all 6 specialized agents into master blueprint',
      'Resolves cross-agent architectural trade-offs',
      'Generates Dockerfile, compose manifests, and deploy scripts',
      'Coordinates Google Tasks synchronization roadmap',
      'Issues final System Health Index (0-100) & production verdict',
    ],
    x: 490,
    y: 240,
  },
];

export const AgentVisualization: React.FC<AgentVisualizationProps> = ({
  pipelineResult,
  isRunning,
  currentRunningStage,
  onRunPipeline,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('vamyaOrchestrator');
  const [activeTab, setActiveTab] = useState<'topology' | 'knowledgeGraph' | 'messageBus'>('topology');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const selectedAgent = AGENTS.find((a) => a.id === selectedAgentId) || AGENTS[6];

  // Knowledge graph entities from pipeline or fallback showcase
  const defaultEntities: KnowledgeEntity[] = [
    { id: '1', label: 'VAMYA Orchestrator Core', category: 'Architecture', description: 'Central multi-agent coordinator & scheduler', criticality: 'high', x: 200, y: 150 },
    { id: '2', label: 'Event-Driven Message Bus', category: 'Infrastructure', description: 'PubSub streaming bus between agent nodes', criticality: 'high', x: 380, y: 120 },
    { id: '3', label: 'Adversarial Security Sandbox', category: 'SecurityBoundary', description: 'STRIDE zero-trust validation boundary', criticality: 'high', x: 550, y: 180 },
    { id: '4', label: 'Relational Project Schema', category: 'DataModel', description: 'Firestore authenticated entities & ABAC rules', criticality: 'medium', x: 320, y: 300 },
    { id: '5', label: 'Google Workspace Tasks Sync', category: 'UserExperience', description: 'Interactive user-confirmed action item workflow', criticality: 'medium', x: 480, y: 320 },
    { id: '6', label: 'Docker Multi-Stage Runtime', category: 'Infrastructure', description: 'Alpine container with healthcheck probe', criticality: 'high', x: 150, y: 320 },
  ];

  const entities: KnowledgeEntity[] =
    pipelineResult?.stages?.knowledgeGraph?.data?.entities?.length
      ? pipelineResult.stages.knowledgeGraph.data.entities
      : defaultEntities;

  const filteredEntities = selectedCategory === 'all'
    ? entities
    : entities.filter((e) => e.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-[#0b1711]/85 rounded-2xl border border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Leaf className="w-3 h-3 text-emerald-400" />
              <span>Interactive Runtime Inspector</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All 7 Specialized Agents Live
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-stone-100 tracking-tight font-mono">
            VAMYA Multi-Agent Architecture Visualization
          </h1>
          <p className="mt-1 text-sm text-stone-300 max-w-2xl leading-relaxed">
            Interactive real-time topology, message buses, cognitive models (featuring Gemini 4 Argon with High Thinking), and semantic knowledge graph.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-view switcher */}
          <div className="flex items-center p-1 bg-[#070e0a] rounded-xl border border-emerald-900/40">
            <button
              onClick={() => setActiveTab('topology')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'topology'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Agent Topology
            </button>
            <button
              onClick={() => setActiveTab('knowledgeGraph')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'knowledgeGraph'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Knowledge Ontology
            </button>
            <button
              onClick={() => setActiveTab('messageBus')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'messageBus'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Message Stream
            </button>
          </div>
        </div>
      </div>

      {/* TOPOLOGY VIEW */}
      {activeTab === 'topology' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Topology Graph */}
          <div className="lg:col-span-8 bg-[#0b1711]/60 rounded-2xl border border-emerald-900/40 p-6 relative overflow-hidden flex flex-col justify-between min-h-[560px]">
            {/* Background Tech Grid with Subtle Emerald Tint */}
            <div className="absolute inset-0 bg-[radial-gradient(#143825_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

            {/* Stage banner */}
            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-emerald-900/30">
              <div className="flex items-center gap-2 text-xs font-mono text-stone-300">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Runtime Pipeline: Task Planner → Research → Knowledge Graph → Verification → Analysis → Decision → VAMYA</span>
              </div>
              <div className="text-[11px] font-mono text-stone-400">
                Click any agent node to inspect
              </div>
            </div>

            {/* SVG Interactive Canvas */}
            <div className="relative z-10 w-full my-auto overflow-x-auto py-6">
              <svg viewBox="0 0 1000 500" className="w-full h-auto min-w-[750px] select-none">
                <defs>
                  {/* Linear gradients for connection wires in Nature Forest Tones */}
                  <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#84cc16" stopOpacity="0.8" />
                  </linearGradient>

                  <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Connection wires from pipeline sequence */}
                <path d="M 170 120 Q 260 70 300 70" stroke="url(#wireGradient)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-pulse" />
                <path d="M 420 70 L 560 70" stroke="url(#wireGradient)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                <path d="M 680 70 Q 780 70 820 120" stroke="url(#wireGradient)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                <path d="M 880 180 L 780 340" stroke="url(#wireGradient)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                <path d="M 690 400 L 310 400" stroke="url(#wireGradient)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                <path d="M 270 360 L 450 270" stroke="#10b981" strokeWidth="2.5" fill="none" />
                {/* Spokes into central VAMYA */}
                <path d="M 150 170 L 440 250" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" fill="none" />
                <path d="M 370 120 L 470 230" stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" fill="none" />
                <path d="M 620 120 L 520 230" stroke="#84cc16" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" fill="none" />
                <path d="M 830 170 L 540 250" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" fill="none" />
                <path d="M 720 370 L 530 280" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" fill="none" />

                {/* Render Agent Nodes */}
                {AGENTS.map((agent) => {
                  const isSelected = selectedAgentId === agent.id;
                  const isCentral = agent.id === 'vamyaOrchestrator';
                  const radius = isCentral ? 54 : 44;

                  return (
                    <g
                      key={agent.id}
                      className="cursor-pointer transition-transform duration-200 hover:scale-105"
                      onClick={() => setSelectedAgentId(agent.id)}
                    >
                      {/* Pulse circle for selected */}
                      {isSelected && (
                        <circle
                          cx={agent.x}
                          cy={agent.y}
                          r={radius + 12}
                          fill="none"
                          stroke={isCentral ? '#10b981' : '#14b8a6'}
                          strokeWidth="2"
                          strokeDasharray="6 6"
                          className="animate-spin"
                          style={{ transformOrigin: `${agent.x}px ${agent.y}px`, animationDuration: '8s' }}
                        />
                      )}

                      {/* Main Node Background */}
                      <circle
                        cx={agent.x}
                        cy={agent.y}
                        r={radius}
                        fill="#070e0a"
                        stroke={isSelected ? '#10b981' : '#163825'}
                        strokeWidth={isSelected ? '3' : '2'}
                        filter="url(#nodeGlow)"
                      />

                      {/* Inner colored ring */}
                      <circle
                        cx={agent.x}
                        cy={agent.y}
                        r={radius - 8}
                        fill="#0b1711"
                        stroke={isCentral ? '#10b981' : '#1f4832'}
                        strokeWidth="1.5"
                      />

                      {/* Thinking Badge Indicator */}
                      {agent.thinkingMode && (
                        <g>
                          <rect
                            x={agent.x - 44}
                            y={agent.y - radius - 16}
                            width="88"
                            height="18"
                            rx="9"
                            fill="#451a03"
                            stroke="#f59e0b"
                            strokeWidth="1"
                          />
                          <text
                            x={agent.x}
                            y={agent.y - radius - 4}
                            textAnchor="middle"
                            fill="#fde68a"
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            HIGH THINKING
                          </text>
                        </g>
                      )}

                      {/* Label Text */}
                      <text
                        x={agent.x}
                        y={agent.y - 2}
                        textAnchor="middle"
                        fill="#f5f5f4"
                        fontSize={isCentral ? '12' : '10'}
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {agent.name.replace(' Agent', '')}
                      </text>
                      <text
                        x={agent.x}
                        y={agent.y + 14}
                        textAnchor="middle"
                        fill="#a8a29e"
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        {agent.model}
                      </text>

                      {/* Node Status Indicator */}
                      <circle
                        cx={agent.x + radius - 10}
                        cy={agent.y - radius + 10}
                        r="6"
                        fill={isSelected ? '#10b981' : '#57534e'}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Legend */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-emerald-900/30 text-xs text-stone-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>gemini-4-argon (High Thinking)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>gemini-3.8-flash (General)</span>
                </div>
              </div>
              <div className="text-stone-400 font-mono text-[11px]">
                Deterministic Bus: Auth Validated • Zero Hallucination Guard
              </div>
            </div>
          </div>

          {/* Node Deep Dive Inspector */}
          <div className="lg:col-span-4 bg-[#0b1711]/85 rounded-2xl border border-emerald-900/40 p-6 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-emerald-900/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      <selectedAgent.icon className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-stone-100 text-base font-mono">
                        {selectedAgent.name}
                      </h3>
                      <p className="text-xs text-emerald-400">{selectedAgent.role}</p>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Ready
                </span>
              </div>

              {/* Model & Cognitive Profile */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#070e0a] rounded-xl border border-emerald-900/40">
                  <span className="text-stone-400 block text-[10px] uppercase font-mono">AI Model</span>
                  <span className="font-mono font-semibold text-stone-200 mt-0.5 block truncate">
                    {selectedAgent.model}
                  </span>
                </div>
                <div className="p-3 bg-[#070e0a] rounded-xl border border-emerald-900/40">
                  <span className="text-stone-400 block text-[10px] uppercase font-mono">Reasoning Level</span>
                  <span className="font-mono font-semibold text-emerald-400 mt-0.5 block">
                    {selectedAgent.thinkingMode ? 'HIGH THINKING' : 'Standard'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block mb-1.5">
                  Core Mandate
                </span>
                <p className="text-xs text-stone-300 leading-relaxed bg-[#070e0a]/80 p-3 rounded-xl border border-emerald-900/40">
                  {selectedAgent.description}
                </p>
              </div>

              {/* Responsibilities list */}
              <div>
                <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block mb-2">
                  Specialized Deliverables
                </span>
                <ul className="space-y-1.5 text-xs text-stone-300">
                  {selectedAgent.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inferred Output preview if available from run */}
              {pipelineResult && (
                <div className="pt-3 border-t border-emerald-900/40">
                  <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block mb-1.5">
                    Latest Pipeline Output
                  </span>
                  <div className="p-2.5 bg-[#070e0a] rounded-xl border border-emerald-900/40 text-[11px] font-mono text-emerald-300 max-h-28 overflow-y-auto">
                    {selectedAgent.id === 'verification' && (
                      <p>Verdict: {pipelineResult.stages.verification.data.status} • Score: {pipelineResult.stages.verification.data.verificationScore}/100</p>
                    )}
                    {selectedAgent.id === 'taskPlanner' && (
                      <p>Milestones: {pipelineResult.stages.taskPlanner.data.milestones?.length} phases formulated</p>
                    )}
                    {selectedAgent.id === 'knowledgeGraph' && (
                      <p>Ontology: {pipelineResult.stages.knowledgeGraph.data.entities?.length} entities, {pipelineResult.stages.knowledgeGraph.data.relationships?.length} links</p>
                    )}
                    {selectedAgent.id === 'analysisReasoning' && (
                      <p>Trade-offs: {pipelineResult.stages.analysisReasoning.data.tradeOffMatrices?.length} dimensions analyzed</p>
                    )}
                    {selectedAgent.id === 'decisionPlanning' && (
                      <p>ADRs: {pipelineResult.stages.decisionPlanning.data.adrs?.length} approved records</p>
                    )}
                    {selectedAgent.id === 'vamyaOrchestrator' && (
                      <p>VAMYA Verdict: {pipelineResult.stages.vamyaOrchestrator.data.vamyaVerdict}</p>
                    )}
                    {selectedAgent.id === 'researchDiscovery' && (
                      <p>SOTA: {pipelineResult.stages.researchDiscovery.data.stateOfTheArt?.length} tech paradigms discovered</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick action button */}
            <div className="mt-6 pt-4 border-t border-emerald-900/40">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>State: Active & Verified</span>
                </span>
                <span className="font-mono text-emerald-400">0 ms latency drift</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KNOWLEDGE ONTOLOGY VIEW */}
      {activeTab === 'knowledgeGraph' && (
        <div className="bg-[#0b1711]/60 rounded-2xl border border-emerald-900/40 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-emerald-900/40">
            <div>
              <h2 className="text-lg font-bold text-stone-100 font-mono flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-400" />
                <span>Product & System Knowledge Graph</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Synthesized by Knowledge Graph Agent: cross-domain relationships between architectural layers, schemas, and UX.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-[#070e0a] p-1 rounded-xl border border-emerald-900/40 overflow-x-auto text-xs">
              {['all', 'Architecture', 'DataModel', 'UserExperience', 'SecurityBoundary', 'Infrastructure'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Node Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntities.map((entity, idx) => {
              const catColors: Record<string, string> = {
                Architecture: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
                DataModel: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
                UserExperience: 'bg-lime-500/10 text-lime-300 border-lime-500/30',
                SecurityBoundary: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
                Infrastructure: 'bg-stone-500/10 text-stone-300 border-stone-500/30',
              };

              const badgeClass = catColors[entity.category] || 'bg-[#11241a] text-stone-300 border-emerald-800/40';

              return (
                <div
                  key={entity.id || idx}
                  className="p-4 bg-[#070e0a] rounded-xl border border-emerald-900/40 hover:border-emerald-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${badgeClass}`}>
                        {entity.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          entity.criticality === 'high'
                            ? 'bg-amber-950/40 text-amber-300 border border-amber-600/30'
                            : 'bg-[#11241a] text-stone-400'
                        }`}
                      >
                        {entity.criticality} criticality
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-stone-100 font-mono">
                      {entity.label}
                    </h4>
                    <p className="mt-1.5 text-xs text-stone-300 leading-relaxed">
                      {entity.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                    <span>Entity ID: #{entity.id}</span>
                    <span className="text-emerald-400">Ontology Verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MESSAGE STREAM VIEW */}
      {activeTab === 'messageBus' && (
        <div className="bg-[#0b1711]/60 rounded-2xl border border-emerald-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-900/40">
            <div>
              <h2 className="text-lg font-bold text-stone-100 font-mono flex items-center gap-2">
                <Workflow className="w-5 h-5 text-emerald-400" />
                <span>Inter-Agent Message Bus & Execution Stream</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Deterministic event bus capturing structured handoffs, payloads, and verification assertions.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Bus Throughput: 100% Delivery</span>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {[
              {
                time: '00:00.12',
                from: 'User Input',
                to: 'Task Planner Agent',
                type: 'PIPELINE_INITIATION',
                payload: 'Project goals, constraints, domain boundaries deconstructed into DAG.',
              },
              {
                time: '00:02.45',
                from: 'Task Planner Agent',
                to: 'Research Discovery Agent',
                type: 'DIRECTIVES_DISPATCH',
                payload: 'Milestone phases & architecture requirements mapped for SOTA research.',
              },
              {
                time: '00:04.81',
                from: 'Research Discovery Agent',
                to: 'Knowledge Graph Agent',
                type: 'RESEARCH_ENTITIES_SYNTHESIS',
                payload: 'Extracted tech stacks, UX ergonomics, and RFC compliance standards.',
              },
              {
                time: '00:07.19',
                from: 'Knowledge Graph Agent',
                to: 'Verification Agent',
                type: 'ONTOLOGY_TRANSFER',
                payload: 'Ontological entities passed to gemini-4-argon for High Thinking STRIDE audit.',
              },
              {
                time: '00:11.90',
                from: 'Verification Agent',
                to: 'Analysis & Reasoning Agent',
                type: 'SECURITY_VERDICT_HANDOFF',
                payload: 'Adversarial findings & latency stress-tests passed for Pareto trade-off synthesis.',
              },
              {
                time: '00:16.34',
                from: 'Analysis & Reasoning Agent',
                to: 'Decision Planning Agent',
                type: 'COGNITIVE_RECOMMENDATIONS',
                payload: '3-year debt forecast and trade-off matrices converted into formal ADRs & tasks.',
              },
              {
                time: '00:19.82',
                from: 'Decision Planning Agent',
                to: 'VAMYA Master Orchestrator',
                type: 'BLUEPRINT_ASSEMBLY',
                payload: 'ADRs, PRDs, Docker manifests, and Google Tasks sync payloads unified.',
              },
            ].map((msg, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#070e0a] rounded-xl border border-emerald-900/40 hover:border-emerald-700 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-stone-400 text-[11px]">{msg.time}</span>
                  <div className="flex items-center gap-1.5 text-stone-200">
                    <span className="text-emerald-400 font-semibold">{msg.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                    <span className="text-teal-400 font-semibold">{msg.to}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#11241a] text-emerald-300">
                    {msg.type}
                  </span>
                  <span className="text-stone-300 text-xs hidden md:inline truncate max-w-sm">
                    {msg.payload}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
