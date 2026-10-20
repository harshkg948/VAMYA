/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { PipelineStudio } from './components/PipelineStudio';
import { AgentVisualization } from './components/AgentVisualization';
import { DockerStudio } from './components/DockerStudio';
import { HarnessStudio } from './components/HarnessStudio';
import { GoogleTasksView } from './components/GoogleTasksView';
import { ExportReportModal } from './components/ExportReportModal';
import {
  initAuth,
  googleSignIn,
  logout,
  testFirestoreConnection,
} from './services/firebase';
import { PipelineExecutionResult, ActionableTask } from './types/agent';
import { Sparkles, MessageSquare, Send, X, Bot, ShieldCheck } from 'lucide-react';

// Showcase baseline pipeline result to populate the system on first load
const INITIAL_DEMO_RESULT: PipelineExecutionResult = {
  projectName: 'FinTech Realtime Payment Gateway & Distributed Ledger',
  domain: 'Financial Technology / High-Throughput Payments',
  goal: 'Build an ultra-low-latency financial ledger processing 50,000 tx/sec with idempotency, double-entry bookkeeping, and real-time fraud mitigation.',
  totalDurationMs: 14200,
  stages: {
    taskPlanner: {
      modelUsed: 'gemini-3.8-flash',
      durationMs: 1800,
      data: {
        projectVision: 'Architect a carrier-grade, double-entry financial ledger delivering deterministic state transitions, zero-downtime replication, and sub-10ms transaction finality.',
        architecturalPillars: [
          'Deterministic Append-Only Event Sourcing',
          'Distributed In-Memory Lock Sharding',
          'Zero-Trust ABAC Security Perimeter',
        ],
        milestones: [
          {
            phase: 'Phase 1',
            name: 'Core Ledger Schema & Idempotency Engine',
            deliverables: ['Double-entry schema definition', 'SHA-256 state chain verification', 'Postgres partition strategy'],
            dependencies: ['None'],
          },
          {
            phase: 'Phase 2',
            name: 'Distributed Concurrency & Locking',
            deliverables: ['Redis Redlock cluster harness', 'Deadlock detection circuit breaker', 'Outbox event streamer'],
            dependencies: ['Phase 1'],
          },
          {
            phase: 'Phase 3',
            name: 'Verification & STRIDE Hardening',
            deliverables: ['Adversarial fuzzing suite', 'ABAC token validator', 'PCI-DSS audit compliance report'],
            dependencies: ['Phase 2'],
          },
        ],
        technicalConstraints: ['PCI-DSS Level 1', 'Sub-15ms p99 latency', 'PostgreSQL 16 partitioned', 'Docker Alpine runner'],
        evaluationMetrics: [
          { metric: 'Throughput', target: '50,000 tx/sec', rationale: 'Accommodates peak holiday volume spikes' },
          { metric: 'Replication Lag', target: '< 5ms', rationale: 'Prevents phantom balances across multi-region read replicas' },
        ],
        agentDirectives: {
          researchFocus: ['Modern SOTA ledger designs', 'LMAX disruptor pattern', 'PostgreSQL B-Tree tuning'],
          knowledgeGraphEntities: ['LedgerAccount', 'TransactionJournal', 'FraudDetector', 'ReconciliationWorker'],
          verificationCheckpoints: ['Double-spend race conditions', 'Clock-skew desynchronization', 'Privilege elevation'],
          reasoningTopics: ['ACID vs BASE consistency under partition', 'Eventual consistency risks in accounting'],
        },
      },
    },
    researchDiscovery: {
      modelUsed: 'gemini-3.8-flash',
      durationMs: 2100,
      data: {
        researchSummary: 'Synthesized high-performance financial architectures combining the LMAX Disruptor ring buffer with PostgreSQL partitioned append-only tables.',
        stateOfTheArt: [
          {
            area: 'Ledger Engine',
            recommendedTech: 'PostgreSQL 16 + Citus Distributed Partitioning',
            benchmarkAdvantages: 'ACID guarantees with horizontal write sharding across account ID hashes.',
            alternativesConsidered: ['CockroachDB', 'TigerBeetle', 'Cassandra'],
          },
          {
            area: 'Distributed Locking',
            recommendedTech: 'Redis 7 Multi-Key Lua Scripting + Redlock',
            benchmarkAdvantages: 'Atomic balance reservations with 0.4ms round-trip latency.',
            alternativesConsidered: ['Zookeeper', 'etcd'],
          },
        ],
        uxDesignParadigms: [
          {
            patternName: 'Realtime Ledger Stream Visualizer',
            problemSolved: 'Eliminates uncertainty in pending transactions with instant optimistic feedback.',
            userImpact: 'Reduces merchant support disputes by 74%.',
          },
          {
            patternName: 'Cryptographic Audit Proof Inspector',
            problemSolved: 'Enables auditors to verify hash-chain continuity in one click.',
            userImpact: 'Streamlines SOC2 Type II compliance reviews.',
          },
        ],
        competitiveAnalysis: [
          {
            competitorType: 'Legacy Batch Gateways',
            gapOpportunity: 'Batch clearing creates 24h settlement lags.',
            ourDifferentiator: 'Sub-second continuous gross settlement with immutable audit proofs.',
          },
        ],
        standardsAndRegulations: ['PCI-DSS v4.0', 'ISO 20022 Financial Messaging', 'GDPR Article 17 Right to Erasure exception for audit ledgers'],
      },
    },
    knowledgeGraph: {
      modelUsed: 'gemini-3.8-flash',
      durationMs: 1950,
      data: {
        ontologySummary: 'Constructed 6 core financial entities with explicit relational integrity and security boundaries.',
        entities: [
          { id: '1', label: 'TransactionLedgerCore', category: 'Architecture', description: 'Append-only ledger sequencer with hash chaining', criticality: 'high' },
          { id: '2', label: 'JournalEntrySchema', category: 'DataModel', description: 'Double-entry debit/credit invariant model', criticality: 'high' },
          { id: '3', label: 'FraudDetectionInterceptor', category: 'SecurityBoundary', description: 'Real-time velocity & anomaly scoring filter', criticality: 'high' },
          { id: '4', label: 'MerchantCheckoutUX', category: 'UserExperience', description: 'Zero-friction payment sheet with biometrics', criticality: 'medium' },
          { id: '5', label: 'DockerClusterHarness', category: 'Infrastructure', description: 'Containerized multi-stage orchestration stack', criticality: 'high' },
          { id: '6', label: 'GoogleTasksSyncBridge', category: 'UserExperience', description: 'Automated sprint & compliance audit checklist sync', criticality: 'medium' },
        ],
        relationships: [
          { source: '1', target: '2', relationship: 'enforces_invariants', protocolOrType: 'SQL Constraint' },
          { source: '3', target: '1', relationship: 'intercepts_before_write', protocolOrType: 'gRPC Interceptor' },
          { source: '4', target: '3', relationship: 'submits_payload_to', protocolOrType: 'HTTPS/TLS 1.3' },
          { source: '5', target: '1', relationship: 'containerizes', protocolOrType: 'Docker Runtime' },
        ],
      },
    },
    verification: {
      modelUsed: 'gemini-4-argon',
      thinkingMode: true,
      durationMs: 3100,
      data: {
        verificationScore: 98,
        status: 'APPROVED',
        verificationVerdict: 'All STRIDE threat vectors verified. Mathematical double-entry invariants guaranteed via database foreign constraints.',
        securityAudits: [
          { threatCategory: 'Spoofing', vulnerability: 'Forged webhook payment notifications', mitigation: 'Ed25519 asymmetric signature verification with replay timestamp window.', severity: 'CRITICAL' },
          { threatCategory: 'Tampering', vulnerability: 'In-flight ledger state modification', mitigation: 'SHA-256 block hash chaining; any row tampering invalidates downstream balance checksums.', severity: 'CRITICAL' },
          { threatCategory: 'Elevation of Privilege', vulnerability: 'Client requesting unauthorized refund balance', mitigation: 'Firestore and API ABAC rules verifying verified email token claims against database role documents.', severity: 'HIGH' },
          { threatCategory: 'Denial of Service', vulnerability: 'Distributed volume flood on settlement worker', mitigation: 'Token bucket rate-limiting at ingress with Redis-backed leaky bucket queue.', severity: 'MEDIUM' },
        ],
        scalabilityCheckpoints: [
          { component: 'Balance Lock Sequencer', bottleneckRisk: 'Account contention on hot merchant balances', remediationArchitecture: 'Partitioned sub-accounts with asynchronous end-of-minute aggregation balance rollups.' },
        ],
        edgeCasesValidated: [
          { scenario: 'Simultaneous opposing debits exceeding total funds', behaviorExpected: 'Atomic conditional rollback on negative balance check', isResilient: true },
          { scenario: 'Partial network partition mid-distributed write', behaviorExpected: 'Two-phase commit timeout aborts transaction cleanly', isResilient: true },
        ],
        complianceChecklist: [
          { standard: 'PCI-DSS v4.0 Requirement 3 (Cardholder Data Protection)', compliant: true, notes: 'Tokenized vaults; zero raw PAN storage in ledger.' },
          { standard: 'SOC2 Type II Trust Services Criteria', compliant: true, notes: 'Immutable append-only audit trail with cryptographic sealing.' },
        ],
      },
    },
    analysisReasoning: {
      modelUsed: 'gemini-4-argon',
      thinkingMode: true,
      durationMs: 3400,
      data: {
        reasoningSynthesis: 'Delved into foundational trade-offs between linearizability and availability (CAP theorem). Chose CP (Consistency + Partition tolerance) for ledger book, and AP for analytics cache.',
        tradeOffMatrices: [
          {
            dimension: 'Event Sourcing vs In-Place Mutation',
            optionA: 'Append-Only Event Journal',
            optionB: 'Direct Account Balance Update',
            recommendedChoice: 'Option A (Event Sourcing)',
            reasoning: 'Event sourcing guarantees mathematical auditability; balances can be recomputed from genesis at any historical millisecond.',
          },
          {
            dimension: 'Synchronous vs Asynchronous Fraud Scoring',
            optionA: 'Inline Blocking Pre-Auth',
            optionB: 'Post-Auth Async Webhook Review',
            recommendedChoice: 'Option A (Inline with < 8ms Budget)',
            reasoning: 'Zero chargeback liability outweighs negligible 8ms latency overhead in modern payment flows.',
          },
        ],
        secondOrderConsequences: [
          {
            decision: 'Immutable append-only ledger storage',
            directEffect: 'Rapid table size growth (est. 12GB/day at full volume)',
            secondOrderImpact: 'Vacuuming and index bloat degrades query planning after 90 days',
            mitigation: 'Implement automated monthly table partitioning with cold storage archiving to Google Cloud Storage.',
          },
        ],
        paretoOptimizations: [
          {
            leveragePoint: 'Redis Read-Through Balance Cache with Invalidation Webhooks',
            effort: 'Low (2 developer days)',
            impact: 'Huge (reduces 80% of database read queries)',
            roiAnalysis: 'Massive reduction in database read IOPS and infrastructure monthly costs.',
          },
        ],
        techDebtForecast: {
          sixMonths: 'Minimal debt. Core schema remains pristine and strictly partitioned.',
          oneYear: 'Partition lifecycle management tooling will need scheduled cron automation.',
          threeYears: 'Migration to multi-region active-active database clusters if expanding overseas.',
        },
      },
    },
    decisionPlanning: {
      modelUsed: 'gemini-3.8-flash',
      durationMs: 1850,
      data: {
        executiveSummary: 'Formulated 3 formal ADRs, 5 production user stories, and 5 sprint action backlog items ready for Google Tasks synchronization.',
        adrs: [
          {
            id: 'ADR-001',
            title: 'Use Append-Only Ledger with Cryptographic Checksums',
            status: 'Accepted',
            context: 'Financial regulatory compliance mandates non-repudiation and zero silent modifications.',
            decision: 'All financial balance changes must be represented as immutable double-entry journal rows.',
            consequences: 'Requires partition management, but achieves unassailable audit rigor.',
          },
          {
            id: 'ADR-002',
            title: 'Adopt Multi-Stage Docker Build with Distroless/Alpine Runner',
            status: 'Accepted',
            context: 'Container security is paramount in FinTech environments.',
            decision: 'Build artifacts in Node builder, run as unprivileged "USER node" on Alpine Linux.',
            consequences: 'Eliminates CVE vulnerabilities and shrinks deploy image to 118MB.',
          },
        ],
        prdSpecs: {
          epicTitle: 'Realtime Ledger & Payment Authorization Core',
          userStories: [
            {
              asA: 'Merchant API Client',
              iWant: 'To submit idempotent payment authorization requests',
              soThat: 'Network retries never result in duplicate debit charges',
              acceptanceCriteria: [
                'Idempotency-Key header is strictly enforced for all POST requests',
                'Repeated requests return identical cached receipt within 24h window',
              ],
            },
          ],
        },
        actionableTasks: [
          { title: 'Implement PostgreSQL double-entry ledger schema & trigger constraints', category: 'Backend', priority: 'P0', estimatedHours: 12, notes: 'Must enforce sum(credits) == sum(debits) at database engine level.' },
          { title: 'Configure Redis distributed lock harness with 10s auto-expiry', category: 'Backend', priority: 'P0', estimatedHours: 8, notes: 'Prevent race conditions during simultaneous customer checkout requests.' },
          { title: 'Deploy multi-stage Dockerfile with dumb-init and non-root user', category: 'Infra', priority: 'P1', estimatedHours: 6, notes: 'Ensure healthcheck probes pass on port 3000.' },
          { title: 'Audit STRIDE webhook verification with Ed25519 signature tests', category: 'Security', priority: 'P0', estimatedHours: 10, notes: 'Mitigate webhook spoofing per verification findings.' },
          { title: 'Build realtime transaction dashboard with optimistic UI updates', category: 'Frontend', priority: 'P1', estimatedHours: 14, notes: 'Provide instant feedback with sub-50ms UI response.' },
        ],
        dockerSpec: {
          baseImage: 'node:22-alpine',
          services: ['app', 'db', 'cache'],
          ports: [3000, 5432, 6379],
          volumeMounts: ['postgres_data', 'redis_data'],
          envVarsRequired: ['GEMINI_API_KEY', 'DATABASE_URL', 'REDIS_URL'],
        },
      },
    },
    vamyaOrchestrator: {
      modelUsed: 'gemini-3.8-flash',
      durationMs: 2000,
      data: {
        vamyaVerdict: 'READY_FOR_PRODUCTION',
        systemHealthIndex: 97,
        masterBlueprint: {
          productName: 'FinTech Realtime Payment Gateway & Distributed Ledger',
          domain: 'Financial Technology / High-Throughput Payments',
          architectureOverview: 'An event-driven, double-entry financial ledger backed by partitioned PostgreSQL and in-memory Redis distributed locks. Implements cryptographic hash chaining and STRIDE zero-trust boundaries.',
          uxDesignSystemOverview: 'High-density, low-latency financial console featuring real-time stream visualizer, cryptographic audit explorer, and dark-mode ergonomic hierarchy.',
          dataFlowModel: 'Client HTTPS → Rate Limiter → Ed25519 Verifier → Redis Lock → PostgreSQL Append-Only Journal → Event Outbox → Google Tasks Sync.',
          securityGuardrails: [
            'All balance mutations require validated bearer tokens with verified email claim',
            'Zero raw card data stored in application layer (PCI-DSS tokenization)',
            'Strict non-root user execution in Docker container',
          ],
        },
        dockerManifests: {
          dockerfile: '',
          dockerCompose: '',
          runInstructions: 'Run `docker compose up --build -d` to launch the multi-service ledger cluster.',
        },
        googleTasksPayload: [
          { title: 'Implement PostgreSQL double-entry ledger schema & trigger constraints', notes: 'Priority P0: Fundamental accounting invariant', priority: 'P0', dueDaysFromNow: 1 },
          { title: 'Configure Redis distributed lock harness with 10s auto-expiry', notes: 'Priority P0: Hot account concurrency mitigation', priority: 'P0', dueDaysFromNow: 2 },
          { title: 'Deploy multi-stage Dockerfile with dumb-init and non-root user', notes: 'Priority P1: Container security hardening', priority: 'P1', dueDaysFromNow: 3 },
          { title: 'Audit STRIDE webhook verification with Ed25519 signature tests', notes: 'Priority P0: Threat mitigation', priority: 'P0', dueDaysFromNow: 4 },
        ],
        vamyaExecutiveSummary: 'VAMYA Multi-Agent Runtime has successfully orchestrated all 6 specialized agents. Technical design, security threat mitigation, trade-off matrices, Docker manifests, and Google Tasks roadmaps are validated and ready for production deployment.',
      },
    },
  },
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<'pipeline' | 'visualization' | 'docker' | 'harness' | 'tasks'>('pipeline');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineExecutionResult | null>(INITIAL_DEMO_RESULT);
  const [isGlobalExportOpen, setIsGlobalExportOpen] = useState(false);

  // Fast Gemini 3.1 Flash-Lite AI assistant drawer state
  const [isFastChatOpen, setIsFastChatOpen] = useState(false);
  const [fastPrompt, setFastPrompt] = useState('');
  const [fastHistory, setFastHistory] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: 'Hello! I am VAMYA Fast Assistant, powered by Gemini 3.1 Flash-Lite for sub-second technical queries, syntax lookups, and design reviews.',
    },
  ]);
  const [isFastLoading, setIsFastLoading] = useState(false);

  useEffect(() => {
    // Initialize Auth state listener
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );

    // Test Firestore connection on boot
    testFirestoreConnection();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Sign-in failed:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  const handleFastAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastPrompt.trim() || isFastLoading) return;

    const userMsg = fastPrompt.trim();
    setFastPrompt('');
    setFastHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsFastLoading(true);

    try {
      const response = await fetch('/api/agent/fast-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg }),
      });
      const data = await response.json();
      if (data.success && data.answer) {
        setFastHistory((prev) => [...prev, { sender: 'assistant', text: data.answer }]);
      } else {
        throw new Error(data.error || 'Failed to get answer');
      }
    } catch (err: any) {
      setFastHistory((prev) => [
        ...prev,
        { sender: 'assistant', text: `Error: ${err.message || 'Fast inquiry failed.'}` },
      ]);
    } finally {
      setIsFastLoading(false);
    }
  };

  const pendingTasks: ActionableTask[] =
    pipelineResult?.stages?.decisionPlanning?.data?.actionableTasks || [];

  return (
    <div className="min-h-screen bg-[#060e08] text-stone-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isAuthenticating={isAuthenticating}
        selectedProjectName={pipelineResult?.projectName || 'FinTech Ledger'}
        onOpenExport={() => setIsGlobalExportOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'pipeline' && (
          <PipelineStudio
            pipelineResult={pipelineResult}
            onPipelineCompleted={(result) => setPipelineResult(result)}
            onNavigateToDocker={() => setCurrentTab('docker')}
            onNavigateToVisualization={() => setCurrentTab('visualization')}
            onNavigateToTasks={() => setCurrentTab('tasks')}
            currentProjectId="vamya-active-project"
          />
        )}

        {currentTab === 'visualization' && (
          <AgentVisualization
            pipelineResult={pipelineResult}
            isRunning={false}
            onRunPipeline={() => setCurrentTab('pipeline')}
          />
        )}

        {currentTab === 'docker' && (
          <DockerStudio pipelineResult={pipelineResult} />
        )}

        {currentTab === 'harness' && (
          <HarnessStudio currentProjectId="vamya-active-project" />
        )}

        {currentTab === 'tasks' && (
          <GoogleTasksView
            user={user}
            onSignIn={handleSignIn}
            pendingAgentTasks={pendingTasks}
          />
        )}
      </main>

      {/* Floating Gemini 3.1 Flash-Lite Fast Inquiry Widget - Nature Color Theme */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isFastChatOpen ? (
          <button
            onClick={() => setIsFastChatOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white rounded-2xl shadow-xl shadow-emerald-950/50 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 text-xs font-semibold"
          >
            <Bot className="w-4 h-4 text-emerald-200" />
            <span>Fast Agent Query</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
              3.1 Lite
            </span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 h-[460px] bg-[#09150e] border border-emerald-800/60 rounded-2xl shadow-2xl shadow-emerald-950/70 flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-3.5 bg-[#0d1d13] border-b border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Bot className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-xs text-stone-100 font-mono">VAMYA Fast Assistant</h4>
                  <span className="text-[10px] text-teal-400 font-mono">gemini-3.1-flash-lite</span>
                </div>
              </div>
              <button
                onClick={() => setIsFastChatOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-100 hover:bg-[#12281a] rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs font-mono scrollbar-thin">
              {fastHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-2.5 rounded-xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white font-sans shadow-sm'
                        : 'bg-[#060e08] text-stone-300 border border-emerald-900/50'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isFastLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#060e08] p-2.5 rounded-xl border border-emerald-900/50 text-stone-400 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Gemini 3.1 Flash-Lite synthesizing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleFastAsk} className="p-2.5 bg-[#0d1d13] border-t border-emerald-900/60 flex gap-2">
              <input
                type="text"
                placeholder="Ask technical or architecture question..."
                value={fastPrompt}
                onChange={(e) => setFastPrompt(e.target.value)}
                className="flex-1 bg-[#060e08] border border-emerald-900/60 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="submit"
                disabled={isFastLoading || !fastPrompt.trim()}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer - Nature Botanical Theme */}
      <footer className="w-full border-t border-emerald-950 bg-[#060e08] py-4 text-center text-xs text-stone-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VAMYA • Autonomous AI Technology & Product Design Multi-Agent System</span>
          <div className="flex items-center gap-3">
            <span>Runtime: Gemini 4 Argon + Gemini 3.8 Flash</span>
            <span>•</span>
            <span className="text-emerald-400">Google Cloud Firestore Ready</span>
          </div>
        </div>
      </footer>

      {/* Global Export Modal */}
      <ExportReportModal
        isOpen={isGlobalExportOpen}
        onClose={() => setIsGlobalExportOpen(false)}
        pipelineResult={pipelineResult}
      />
    </div>
  );
}
