"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  FileText,
  Loader2,
  MonitorPlay,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { StatusPill, type RunStatus } from "@/components/ui/StatusPill";
import { ReplayModal, type ReplayFrame } from "@/components/runs/ReplayModal";
import type { RunPayload, RunSpecWithSteps } from "@/lib/runs-data";
import { cn } from "@/lib/utils";

const ACTIVE: RunStatus[] = ["queued", "running"];

/** Run detail with live step streaming via polling (swap to Realtime later). */
export function RunDetailLive({ initial, runId }: { initial: RunPayload; runId: string }) {
  const [data, setData] = useState<RunPayload>(initial);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stillActive = (p: RunPayload) =>
      p.run != null && (ACTIVE.includes(p.run.status) || p.specs.some((s) => ACTIVE.includes(s.status)));

    async function tick() {
      try {
        const res = await fetch(`/api/runs/${runId}`, { cache: "no-store" });
        if (res.ok) {
          const next = (await res.json()) as RunPayload;
          setData(next);
          if (!stillActive(next) && timer.current) {
            clearInterval(timer.current);
            timer.current = null;
          }
        }
      } catch {
        /* transient — keep polling */
      }
    }

    if (stillActive(initial)) {
      timer.current = setInterval(tick, 1200);
      return () => {
        if (timer.current) clearInterval(timer.current);
      };
    }
  }, [runId, initial]);

  const { run, specs } = data;
  if (!run) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <StatusPill status={run.status} />
        {run.summary && <span className="text-sm text-mute">{run.summary}</span>}
      </div>

      <div className="space-y-4">
        {specs.map((spec) => (
          <SpecCard key={spec.id} spec={spec} />
        ))}
      </div>
    </div>
  );
}

function SpecCard({ spec }: { spec: RunSpecWithSteps }) {
  const total = spec.steps.length;
  const done = spec.steps.filter((s) => s.status === "passed" || s.status === "failed").length;
  const frames: ReplayFrame[] = spec.steps
    .filter((s) => s.screenshot_url)
    .map((s) => ({ url: s.screenshot_url as string, description: s.description, status: s.status }));
  const hasRecording = !!spec.replay_s3_key && spec.replay_s3_key.startsWith("s3://");

  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-md border border-line text-faint">
            <MonitorPlay className="size-4" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{spec.title}</p>
            {spec.summary && <p className="truncate text-xs text-mute">{spec.summary}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {(hasRecording || frames.length > 0) && (
            <ReplayModal
              title={spec.title}
              frames={frames}
              runSpecId={spec.id}
              hasRecording={hasRecording}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
                >
                  <PlayCircle className="size-3.5" strokeWidth={1.75} /> Ver repetición
                </button>
              }
            />
          )}
          {total > 0 && (
            <span className="text-mono text-[11px] text-faint">
              {done}/{total}
            </span>
          )}
          <StatusPill status={spec.status} />
        </div>
      </div>

      <ul className="divide-y divide-line">
        {spec.steps.map((step) => (
          <li key={step.id} className="flex items-start gap-3 px-5 py-2.5">
            <StepIcon status={step.status} />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm",
                  step.status === "pending" ? "text-faint" : "text-ink",
                  step.status === "failed" && "text-danger",
                )}
              >
                {step.description}
              </p>
              {step.log && <p className="mt-0.5 text-xs text-danger">{step.log}</p>}
            </div>
          </li>
        ))}
        {spec.steps.length === 0 && (
          <li className="flex items-center gap-2 px-5 py-3 text-sm text-mute">
            <ChevronRight className="size-3.5" /> Preparando sesión de navegador…
          </li>
        )}
      </ul>

      {/* Detailed QA report (dev + product), generated by the agent. */}
      {spec.report && (
        <div className="border-t border-line px-5 py-4">
          <p className="text-overline mb-2 flex items-center gap-1.5">
            <FileText className="size-3.5" strokeWidth={1.5} /> Informe del agente
          </p>
          <ReportText text={spec.report} />
        </div>
      )}
    </section>
  );
}

/** Minimal markdown-lite renderer for the agent report (headings, bullets, bold). */
function ReportText({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-medium text-ink">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      ),
    );

  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-mute">
      {text.split("\n").map((raw, i) => {
        const line = raw.trim();
        if (!line) return <div key={i} className="h-1" />;
        if (line.startsWith("## ")) {
          return (
            <p key={i} className="text-overline pt-2 first:pt-0">
              {line.slice(3)}
            </p>
          );
        }
        if (/^[-*]\s+/.test(line)) {
          return (
            <p key={i} className="flex gap-2 pl-1">
              <span className="text-faint">•</span>
              <span>{inline(line.replace(/^[-*]\s+/, ""))}</span>
            </p>
          );
        }
        if (/^\d+\.\s+/.test(line)) {
          return (
            <p key={i} className="pl-1 text-ink">
              {inline(line)}
            </p>
          );
        }
        return <p key={i}>{inline(line)}</p>;
      })}
    </div>
  );
}

function StepIcon({ status }: { status: string }) {
  if (status === "passed")
    return <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" strokeWidth={1.75} />;
  if (status === "failed")
    return <XCircle className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={1.75} />;
  if (status === "running")
    return <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-warn" strokeWidth={1.75} />;
  return <Circle className="mt-0.5 size-4 shrink-0 text-faint" strokeWidth={1.5} />;
}
