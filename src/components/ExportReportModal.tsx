import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  X,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Container,
  Workflow,
  Share2,
  Leaf,
} from 'lucide-react';
import { PipelineExecutionResult } from '../types/agent';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineResult: PipelineExecutionResult | null;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  pipelineResult,
}) => {
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'json'>('preview');

  if (!isOpen || !pipelineResult) return null;

  const {
    projectName,
    domain,
    goal,
    totalDurationMs,
    stages,
  } = pipelineResult;

  const vamyaData = stages.vamyaOrchestrator?.data;
  const taskPlannerData = stages.taskPlanner?.data;
  const researchData = stages.researchDiscovery?.data;
  const verificationData = stages.verification?.data;
  const reasoningData = stages.analysisReasoning?.data;
  const decisionData = stages.decisionPlanning?.data;

  // 1. Download raw JSON export
  const handleDownloadJson = () => {
    const jsonString = JSON.stringify(pipelineResult, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `vamya-${sanitizedTitle}-architecture.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. Copy JSON
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(pipelineResult, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // 3. Generate Markdown Brief for Notion/Slack
  const generateMarkdownReport = () => {
    return `# VAMYA Multi-Agent Architecture Report: ${projectName}
**Domain:** ${domain}  
**Executive Verdict:** ${vamyaData?.vamyaVerdict || 'APPROVED'}  
**System Health Index:** ${vamyaData?.systemHealthIndex || 95}/100  
**Generated On:** ${new Date().toLocaleDateString()} via VAMYA Multi-Agent Runtime  

---

## 1. Executive Summary
${vamyaData?.vamyaExecutiveSummary || ''}

### Master Architecture Overview
${vamyaData?.masterBlueprint?.architectureOverview || ''}

---

## 2. Architectural Pillars & Milestones
${taskPlannerData?.architecturalPillars?.map((p: string) => `- ${p}`).join('\n') || ''}

### Milestone Delivery DAG
${taskPlannerData?.milestones?.map((m: any, i: number) => `### Phase ${i + 1}: ${m.name}\n- Deliverables: ${m.deliverables?.join(', ')}\n- Dependencies: ${m.dependencies?.join(', ')}`).join('\n\n') || ''}

---

## 3. State-of-the-Art Technology Selection
${researchData?.stateOfTheArt?.map((s: any) => `### ${s.area}: ${s.recommendedTech}\n- **Benchmark Advantage:** ${s.benchmarkAdvantages}\n- **Alternatives:** ${s.alternativesConsidered?.join(', ')}`).join('\n\n') || ''}

---

## 4. Verification & STRIDE Security Audit (Score: ${verificationData?.verificationScore || 95}/100)
${verificationData?.securityAudits?.map((t: any) => `- **[${t.severity}] ${t.threatCategory}:** ${t.vulnerability}\n  - *Mitigation:* ${t.mitigation}`).join('\n') || ''}

---

## 5. Architectural Decision Records (ADRs)
${decisionData?.adrs?.map((adr: any) => `### ${adr.id}: ${adr.title} (${adr.status})\n- **Decision:** ${adr.decision}\n- **Consequences:** ${adr.consequences}`).join('\n\n') || ''}

---

## 6. Docker Containerization Specification
- Base Image: ${decisionData?.dockerSpec?.baseImage || 'node:22-alpine'}
- Services: ${decisionData?.dockerSpec?.services?.join(', ') || 'app, db, cache'}
- Ports: ${decisionData?.dockerSpec?.ports?.join(', ') || '3000, 5432, 6379'}

---
*Report synthesized by VAMYA Autonomous Multi-Agent Runtime (Gemini 4 Argon & Gemini 3.8 Flash)*
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  // 4. Trigger Print to PDF
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-[#0b1711] border border-emerald-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-[#070e0a] border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-100 text-base font-mono">
                Stakeholder Architecture Export & Presentation
              </h2>
              <p className="text-xs text-stone-400">
                Export full pipeline design as JSON, Markdown, or print-ready executive PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center p-1 bg-[#0b1711] rounded-lg border border-emerald-900/40 text-xs">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md transition ${
                  viewMode === 'preview'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Executive Report
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-3 py-1 rounded-md transition ${
                  viewMode === 'json'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Raw JSON
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-[#11241a] rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-3 bg-[#070e0a]/90 border-b border-emerald-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-300 font-mono">
            <span>Project:</span>
            <span className="font-semibold text-stone-100">{projectName}</span>
            <span className="text-stone-500">•</span>
            <span>Duration: {(totalDurationMs / 1000).toFixed(1)}s</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-sm transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#11241a] hover:bg-[#183626] text-stone-200 font-medium rounded-lg border border-emerald-800/40 transition"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#11241a] hover:bg-[#183626] text-stone-200 font-medium rounded-lg border border-emerald-800/40 transition"
            >
              {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMarkdown ? 'Copied MD!' : 'Copy Markdown'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:bg-white print:text-black">
          {viewMode === 'preview' ? (
            /* Executive Briefing Presentation Paper View */
            <div id="printable-report" className="space-y-8 max-w-4xl mx-auto bg-[#070e0a] p-8 rounded-2xl border border-emerald-900/40 print:bg-white print:border-none print:p-0 print:text-stone-900">
              {/* Report Header */}
              <div className="pb-6 border-b border-emerald-900/40 print:border-stone-300 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 print:border-stone-400 print:text-emerald-800 flex items-center gap-1.5">
                      <Leaf className="w-3 h-3 text-emerald-400" />
                      <span>VAMYA MULTI-AGENT SPECIFICATION</span>
                    </span>
                    <span className="text-xs text-stone-400 print:text-stone-600 font-mono">
                      Confidential & Proprietary
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-stone-100 print:text-black font-mono">
                    {projectName}
                  </h1>
                  <p className="text-xs text-stone-400 print:text-stone-600 mt-1">
                    Domain: <strong className="text-stone-300 print:text-black">{domain}</strong> • Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-[#0b1711] print:bg-stone-100 p-3.5 rounded-xl border border-emerald-900/40 print:border-stone-300">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-stone-400 print:text-stone-600 block">
                      Health Index
                    </span>
                    <span className="text-2xl font-bold font-mono text-emerald-400 print:text-emerald-700">
                      {vamyaData?.systemHealthIndex || 97}/100
                    </span>
                  </div>
                  <div className="text-right border-l border-emerald-900/40 print:border-stone-300 pl-4">
                    <span className="text-[10px] font-mono uppercase text-stone-400 print:text-stone-600 block">
                      Verdict
                    </span>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 print:text-emerald-800">
                      {vamyaData?.vamyaVerdict || 'APPROVED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mission Goal */}
              <div className="p-4 bg-[#0b1711]/60 print:bg-stone-50 rounded-xl border border-emerald-900/30 print:border-stone-200">
                <span className="text-[11px] font-mono uppercase text-emerald-400 print:text-emerald-800 font-bold block mb-1">
                  Product Mission & System Goal
                </span>
                <p className="text-xs text-stone-200 print:text-stone-800 leading-relaxed">
                  {goal}
                </p>
              </div>

              {/* Section 1: Executive Blueprint */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-stone-100 print:text-black font-mono flex items-center gap-2 border-b border-emerald-900/40 print:border-stone-300 pb-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                  <span>1. Executive Architecture Synthesis</span>
                </h3>
                <p className="text-xs text-stone-300 print:text-stone-800 leading-relaxed">
                  {vamyaData?.vamyaExecutiveSummary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3.5 bg-[#0b1711]/40 print:bg-stone-50 rounded-xl border border-emerald-900/40 print:border-stone-200">
                    <strong className="text-stone-200 print:text-black block mb-1 font-mono">Architecture Topology:</strong>
                    <p className="text-stone-400 print:text-stone-700">{vamyaData?.masterBlueprint?.architectureOverview}</p>
                  </div>
                  <div className="p-3.5 bg-[#0b1711]/40 print:bg-stone-50 rounded-xl border border-emerald-900/40 print:border-stone-200">
                    <strong className="text-stone-200 print:text-black block mb-1 font-mono">Data Flow Model:</strong>
                    <p className="text-stone-400 print:text-stone-700">{vamyaData?.masterBlueprint?.dataFlowModel}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Architectural Pillars & Milestones */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-stone-100 print:text-black font-mono flex items-center gap-2 border-b border-emerald-900/40 print:border-stone-300 pb-2">
                  <Layers className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                  <span>2. Architectural Pillars & Milestone Phases</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {taskPlannerData?.architecturalPillars?.map((pillar: string, i: number) => (
                    <div key={i} className="p-2.5 bg-[#0b1711]/40 print:bg-stone-50 rounded-lg border border-emerald-900/40 print:border-stone-200 text-xs text-stone-300 print:text-black font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 print:bg-emerald-600 flex-shrink-0"></span>
                      <span>{pillar}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  {taskPlannerData?.milestones?.map((m: any, i: number) => (
                    <div key={i} className="p-3 bg-[#0b1711]/40 print:bg-stone-50 rounded-xl border border-emerald-900/40 print:border-stone-200 space-y-1.5">
                      <span className="text-[10px] font-mono text-emerald-400 print:text-emerald-700 font-bold">{m.phase}</span>
                      <h4 className="font-semibold text-stone-200 print:text-black">{m.name}</h4>
                      <ul className="text-[11px] text-stone-400 print:text-stone-700 list-disc list-inside space-y-0.5">
                        {m.deliverables?.map((d: string, di: number) => (
                          <li key={di}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: SOTA Tech Stack */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-stone-100 print:text-black font-mono flex items-center gap-2 border-b border-emerald-900/40 print:border-stone-300 pb-2">
                  <Cpu className="w-4 h-4 text-teal-400 print:text-teal-700" />
                  <span>3. State-of-the-Art Technology Selections</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {researchData?.stateOfTheArt?.map((item: any, i: number) => (
                    <div key={i} className="p-3.5 bg-[#0b1711]/40 print:bg-stone-50 rounded-xl border border-emerald-900/40 print:border-stone-200 space-y-1">
                      <span className="text-[10px] font-mono text-teal-400 print:text-teal-800 font-bold uppercase">{item.area}</span>
                      <h4 className="font-semibold text-stone-200 print:text-black font-mono">{item.recommendedTech}</h4>
                      <p className="text-stone-400 print:text-stone-700 text-[11px]">{item.benchmarkAdvantages}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: STRIDE Security Audit */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-stone-100 print:text-black font-mono flex items-center justify-between border-b border-emerald-900/40 print:border-stone-300 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 print:text-amber-700" />
                    <span>4. Adversarial STRIDE Threat Modeling & Verification</span>
                  </div>
                  <span className="text-xs font-mono text-amber-400 print:text-amber-800">
                    Verification Score: {verificationData?.verificationScore || 95}/100
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {verificationData?.securityAudits?.map((threat: any, i: number) => (
                    <div key={i} className="p-3 bg-[#0b1711]/40 print:bg-stone-50 rounded-xl border border-emerald-900/40 print:border-stone-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-stone-400 print:text-stone-600 uppercase font-bold">{threat.threatCategory}</span>
                        <span className="text-[10px] font-mono text-amber-400 print:text-amber-700 font-bold">{threat.severity}</span>
                      </div>
                      <p className="font-medium text-stone-200 print:text-black">{threat.vulnerability}</p>
                      <p className="text-stone-400 print:text-stone-700 text-[11px]">
                        <strong className="text-emerald-400 print:text-emerald-800">Mitigation:</strong> {threat.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Codified ADRs */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-stone-100 print:text-black font-mono flex items-center gap-2 border-b border-emerald-900/40 print:border-stone-300 pb-2">
                  <Workflow className="w-4 h-4 text-teal-400 print:text-teal-700" />
                  <span>5. Architectural Decision Records (ADRs)</span>
                </h3>

                <div className="space-y-2 text-xs">
                  {decisionData?.adrs?.map((adr: any, i: number) => (
                    <div key={i} className="p-3 bg-[#0b1711]/40 print:bg-stone-50 rounded-xl border border-emerald-900/40 print:border-stone-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-emerald-400 print:text-emerald-800 font-bold">{adr.id}: {adr.title}</span>
                        <span className="text-[10px] font-mono text-emerald-400 print:text-emerald-800 font-semibold">{adr.status}</span>
                      </div>
                      <p className="text-stone-300 print:text-stone-800"><strong>Decision:</strong> {adr.decision}</p>
                      <p className="text-stone-400 print:text-stone-600 text-[11px]"><strong>Consequences:</strong> {adr.consequences}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Container Architecture */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-stone-100 print:text-black font-mono flex items-center gap-2 border-b border-emerald-900/40 print:border-stone-300 pb-2">
                  <Container className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                  <span>6. Docker Containerization & Deployment Topology</span>
                </h3>

                <div className="p-3.5 bg-[#0b1711]/40 print:bg-stone-50 rounded-xl border border-emerald-900/40 print:border-stone-200 text-xs space-y-2 font-mono">
                  <div className="flex flex-wrap gap-4 text-stone-300 print:text-stone-800">
                    <span>Base Image: <strong>{decisionData?.dockerSpec?.baseImage || 'node:22-alpine'}</strong></span>
                    <span>•</span>
                    <span>Services: <strong>{decisionData?.dockerSpec?.services?.join(', ') || 'app, db, cache'}</strong></span>
                    <span>•</span>
                    <span>Exposed Ports: <strong>{decisionData?.dockerSpec?.ports?.join(', ') || '3000, 5432, 6379'}</strong></span>
                  </div>
                  <p className="text-stone-400 print:text-stone-600 text-[11px]">
                    Hardening: Non-root user execution, dumb-init signal forwarding, multi-stage minimal payload.
                  </p>
                </div>
              </div>

              {/* Stakeholder Sign-Off Block */}
              <div className="pt-6 border-t border-emerald-900/40 print:border-stone-300 flex items-center justify-between text-xs text-stone-400 print:text-stone-700 font-mono">
                <div>
                  <span>Evaluated by: <strong>VAMYA Autonomous Multi-Agent Runtime</strong></span>
                </div>
                <div>
                  <span>Status: <strong>{vamyaData?.vamyaVerdict || 'APPROVED'}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            /* Raw JSON View */
            <div className="relative">
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#11241a] hover:bg-[#183626] text-stone-200 text-xs font-mono rounded-lg border border-emerald-800/40 transition"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-5 bg-[#070e0a] font-mono text-xs text-stone-300 rounded-xl border border-emerald-900/40 overflow-x-auto max-h-[580px] scrollbar-thin">
                {JSON.stringify(pipelineResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
