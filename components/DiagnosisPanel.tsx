"use client";

import { DiagnosisPanelProps } from "@/lib/types";

export default function DiagnosisPanel({ diagnosis }: DiagnosisPanelProps) {
  // Simple markdown-like rendering
  const renderDiagnosis = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        elements.push(<br key={index} />);
        return;
      }

      // Headers (## or ###)
      if (trimmed.startsWith("###")) {
        elements.push(
          <h4
            key={index}
            className="text-md font-semibold text-white mt-4 mb-2"
          >
            {trimmed.replace(/^###\s*/, "")}
          </h4>
        );
        return;
      }

      if (trimmed.startsWith("##")) {
        elements.push(
          <h3
            key={index}
            className="text-lg font-semibold text-white mt-5 mb-3"
          >
            {trimmed.replace(/^##\s*/, "")}
          </h3>
        );
        return;
      }

      // Bullet points
      if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
        elements.push(
          <li key={index} className="text-white/80 ml-4 mb-1 text-sm leading-relaxed">
            {renderInlineFormatting(trimmed.replace(/^[-•]\s*/, ""))}
          </li>
        );
        return;
      }

      // Numbered lists
      const numberedMatch = trimmed.match(/^\d+\.\s/);
      if (numberedMatch) {
        elements.push(
          <li
            key={index}
            className="text-white/80 ml-4 mb-1 text-sm leading-relaxed list-decimal"
          >
            {renderInlineFormatting(trimmed.replace(/^\d+\.\s/, ""))}
          </li>
        );
        return;
      }

      // Horizontal rule
      if (trimmed === "---") {
        elements.push(
          <hr key={index} className="border-white/10 my-4" />
        );
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={index} className="text-white/80 mb-2 text-sm leading-relaxed">
          {renderInlineFormatting(trimmed)}
        </p>
      );
    });

    return elements;
  };

  // Handle bold, italic, and code formatting
  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Split by bold markers (**text**)
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Handle inline code (`text`)
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((codePart, j) => {
        if (codePart.startsWith("`") && codePart.endsWith("`")) {
          return (
            <code
              key={`${i}-${j}`}
              className="px-1.5 py-0.5 rounded bg-white/10 text-aurora-400 text-xs font-mono"
            >
              {codePart.slice(1, -1)}
            </code>
          );
        }
        return codePart;
      });
    });
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green/30 to-neon-blue/30 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-neon-green"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">AI Diagnosis</h3>
          <p className="text-white/50 text-sm">
            Plain-English analysis of your portfolio
          </p>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-1">{renderDiagnosis(diagnosis)}</div>
      </div>

      {/* AI disclaimer */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-start gap-2 text-xs text-white/40">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>
            This analysis is generated using AI based on quantitative metrics.
            The math is deterministic, but interpretations are educational only.
            Always consult a licensed financial advisor for personalized advice.
          </p>
        </div>
      </div>
    </div>
  );
}

