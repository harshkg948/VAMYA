export type AgentStepId =
  | 'taskPlanner'
  | 'researchDiscovery'
  | 'knowledgeGraph'
  | 'verification'
  | 'analysisReasoning'
  | 'decisionPlanning'
  | 'vamyaOrchestrator';

export interface PipelineInput {
  projectName: string;
  domain: string;
  goal: string;
  techConstraints?: string;
  targetAudience?: string;
  deploymentTarget?: string;
}

export interface Milestone {
  phase: string;
  name: string;
  deliverables: string[];
  dependencies: string[];
}

export interface EvaluationMetric {
  metric: string;
  target: string;
  rationale: string;
}

export interface TaskPlannerData {
  projectVision: string;
  architecturalPillars: string[];
  milestones: Milestone[];
  technicalConstraints: string[];
  evaluationMetrics: EvaluationMetric[];
  agentDirectives: {
    researchFocus: string[];
    knowledgeGraphEntities: string[];
    verificationCheckpoints: string[];
    reasoningTopics: string[];
  };
}

export interface TechArea {
  area: string;
  recommendedTech: string;
  benchmarkAdvantages: string;
  alternativesConsidered: string[];
}

export interface UxParadigm {
  patternName: string;
  problemSolved: string;
  userImpact: string;
}

export interface CompetitorInsight {
  competitorType: string;
  gapOpportunity: string;
  ourDifferentiator: string;
}

export interface ResearchData {
  stateOfTheArt: TechArea[];
  uxDesignParadigms: UxParadigm[];
  competitiveAnalysis: CompetitorInsight[];
  standardsAndRegulations: string[];
  researchSummary: string;
}

export interface KnowledgeEntity {
  id: string;
  label: string;
  category: 'Architecture' | 'DataModel' | 'UserExperience' | 'SecurityBoundary' | 'Infrastructure';
  description: string;
  criticality: 'high' | 'medium' | 'low';
  x?: number;
  y?: number;
}

export interface KnowledgeRelationship {
  source: string;
  target: string;
  relationship: string;
  protocolOrType: string;
}

export interface KnowledgeGraphData {
  entities: KnowledgeEntity[];
  relationships: KnowledgeRelationship[];
  ontologySummary: string;
  isolatedSubgraphs?: string[];
}

export interface SecurityAuditItem {
  threatCategory: string;
  vulnerability: string;
  mitigation: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ScalabilityCheckpoint {
  component: string;
  bottleneckRisk: string;
  remediationArchitecture: string;
}

export interface EdgeCaseValidation {
  scenario: string;
  behaviorExpected: string;
  isResilient: boolean;
}

export interface ComplianceCheck {
  standard: string;
  compliant: boolean;
  notes: string;
}

export interface VerificationData {
  verificationScore: number;
  status: 'APPROVED' | 'APPROVED_WITH_CAUTIONS' | 'REJECTED';
  securityAudits: SecurityAuditItem[];
  scalabilityCheckpoints: ScalabilityCheckpoint[];
  edgeCasesValidated: EdgeCaseValidation[];
  complianceChecklist: ComplianceCheck[];
  verificationVerdict: string;
}

export interface TradeOffMatrix {
  dimension: string;
  optionA: string;
  optionB: string;
  recommendedChoice: string;
  reasoning: string;
}

export interface SecondOrderConsequence {
  decision: string;
  directEffect: string;
  secondOrderImpact: string;
  mitigation: string;
}

export interface ParetoOptimization {
  leveragePoint: string;
  effort: string;
  impact: string;
  roiAnalysis: string;
}

export interface AnalysisReasoningData {
  tradeOffMatrices: TradeOffMatrix[];
  secondOrderConsequences: SecondOrderConsequence[];
  paretoOptimizations: ParetoOptimization[];
  techDebtForecast: {
    sixMonths: string;
    oneYear: string;
    threeYears: string;
  };
  reasoningSynthesis: string;
}

export interface ADR {
  id: string;
  title: string;
  status: string;
  context: string;
  decision: string;
  consequences: string;
}

export interface UserStory {
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
}

export interface ActionableTask {
  title: string;
  category: 'Frontend' | 'Backend' | 'Infra' | 'Security' | 'Design';
  priority: 'P0' | 'P1' | 'P2';
  estimatedHours: number;
  notes: string;
}

export interface DockerSpec {
  baseImage: string;
  services: string[];
  ports: number[];
  volumeMounts: string[];
  envVarsRequired: string[];
}

export interface DecisionPlanningData {
  adrs: ADR[];
  prdSpecs: {
    epicTitle: string;
    userStories: UserStory[];
  };
  actionableTasks: ActionableTask[];
  dockerSpec: DockerSpec;
  executiveSummary: string;
}

export interface VamyaOrchestratorData {
  vamyaVerdict: 'READY_FOR_PRODUCTION' | 'READY_WITH_OBSERVATIONS' | 'NEEDS_REVISION';
  systemHealthIndex: number;
  masterBlueprint: {
    productName: string;
    domain: string;
    architectureOverview: string;
    uxDesignSystemOverview: string;
    dataFlowModel: string;
    securityGuardrails: string[];
  };
  dockerManifests: {
    dockerfile: string;
    dockerCompose: string;
    runInstructions: string;
  };
  googleTasksPayload: {
    title: string;
    notes: string;
    priority: 'P0' | 'P1' | 'P2';
    dueDaysFromNow: number;
  }[];
  vamyaExecutiveSummary: string;
}

export interface AgentStage {
  id: AgentStepId;
  name: string;
  role: string;
  model: string;
  thinkingMode: boolean;
  status: 'idle' | 'running' | 'completed' | 'failed';
  summary?: string;
  data?: any;
  durationMs?: number;
}

export interface PipelineExecutionResult {
  projectName: string;
  domain: string;
  goal: string;
  totalDurationMs: number;
  stages: {
    taskPlanner: { data: TaskPlannerData; durationMs: number; modelUsed: string };
    researchDiscovery: { data: ResearchData; durationMs: number; modelUsed: string };
    knowledgeGraph: { data: KnowledgeGraphData; durationMs: number; modelUsed: string };
    verification: { data: VerificationData; durationMs: number; modelUsed: string; thinkingMode: boolean };
    analysisReasoning: { data: AnalysisReasoningData; durationMs: number; modelUsed: string; thinkingMode: boolean };
    decisionPlanning: { data: DecisionPlanningData; durationMs: number; modelUsed: string };
    vamyaOrchestrator: { data: VamyaOrchestratorData; durationMs: number; modelUsed: string };
  };
}

export interface BenchmarkTestCase {
  id: string;
  name: string;
  category: 'reasoning' | 'hallucination' | 'security' | 'docker' | 'ontology';
  description: string;
  prompt: string;
  expectedKeywords: string[];
}

export interface BenchmarkResult {
  testId: string;
  testName: string;
  category: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  invariantsSatisfied: string[];
  invariantsMissed: string[];
  hallucinationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoningQualityScore: number;
  latencyMs: number;
  evaluationNotes: string;
  reproducibilityHash: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updated?: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
}
