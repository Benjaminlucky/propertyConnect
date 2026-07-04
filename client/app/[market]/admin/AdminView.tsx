"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldX, Clock } from "lucide-react";
import { toast } from "sonner";
import { reviewSubmission, type Submission } from "./actions";

const STEP_LABEL: Record<string, string> = {
  nin:   "NIN",
  bvn:   "BVN",
  face:  "Face ID",
  cac:   "CAC",
  rean:  "REAN",
  photo: "Photo ID",
};

const STEP_COLOR: Record<string, string> = {
  nin:   "#1a6b50",
  bvn:   "#0e5a43",
  face:  "#7c4b14",
  cac:   "#1a4f8a",
  rean:  "#5a1a6b",
  photo: "#7a1a1a",
};

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = diff / 3_600_000;
  if (h < 1) return "just now";
  if (h < 24) return `${Math.floor(h)}h ago`;
  const d = h / 24;
  if (d < 7) return `${Math.floor(d)}d ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function DataPreview({ stepId, data }: { stepId: string; data: Record<string, string> | null }) {
  if (!data) return <p className="adm-nodata">No data submitted</p>;

  const fileUrl = data.file_url;
  const isImage = stepId === "face" || stepId === "photo";

  if (fileUrl && isImage) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="adm-img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fileUrl.replace("/upload/", "/upload/w_480,h_320,c_fill/")}
          alt="Submitted document"
          className="adm-img"
        />
        <span className="adm-img-label">Open full image ↗</span>
      </a>
    );
  }

  if (fileUrl) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="adm-doc">
        View document ↗
        <span className="adm-doc-name">{decodeURIComponent(fileUrl.split("/").pop() ?? "")}</span>
      </a>
    );
  }

  const num = data.nin_number ?? data.bvn_number ?? data.rean_number;
  if (num) return <p className="adm-num">Submitted: <strong>{num}</strong></p>;

  return <pre className="adm-raw">{JSON.stringify(data, null, 2)}</pre>;
}

function SubmissionCard({ sub, onDone }: { sub: Submission; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function handle(action: "approved" | "rejected") {
    startTransition(async () => {
      try {
        await reviewSubmission(sub.id, action);
        setDone(true);
        toast.success(action === "approved" ? "Approved" : "Rejected");
        setTimeout(onDone, 350);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  if (done) return null;

  const agent = sub.agent_profiles;
  const color = STEP_COLOR[sub.step_id] ?? "#333";

  return (
    <div className={`adm-card${isPending ? " adm-card--busy" : ""}`}>
      <div className="adm-card-head">
        <span
          className="adm-step"
          style={{ background: `${color}18`, color }}
        >
          {STEP_LABEL[sub.step_id] ?? sub.step_id}
        </span>
        <div className="adm-agent">
          <span className="adm-agent-name">{agent?.name ?? "Unknown agent"}</span>
          {agent?.email && <span className="adm-agent-email">{agent.email}</span>}
        </div>
        <span className="adm-time">
          <Clock size={12} strokeWidth={1.8} />
          {relTime(sub.submitted_at)}
        </span>
      </div>

      <div className="adm-card-body">
        <DataPreview stepId={sub.step_id} data={sub.data} />
      </div>

      <div className="adm-card-foot">
        <button
          className="adm-btn adm-btn--approve"
          onClick={() => handle("approved")}
          disabled={isPending}
        >
          <ShieldCheck size={14} strokeWidth={2} />
          Approve
        </button>
        <button
          className="adm-btn adm-btn--reject"
          onClick={() => handle("rejected")}
          disabled={isPending}
        >
          <ShieldX size={14} strokeWidth={2} />
          Reject
        </button>
      </div>
    </div>
  );
}

export function AdminView({ submissions }: { submissions: Submission[] }) {
  const router = useRouter();

  if (submissions.length === 0) {
    return (
      <div className="adm-shell">
        <div className="adm-hdr">
          <h1 className="adm-title">Verification Queue</h1>
          <span className="adm-badge adm-badge--ok">All clear</span>
        </div>
        <div className="adm-empty">
          <ShieldCheck size={42} strokeWidth={1.2} />
          <p>No pending submissions. All caught up.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-shell">
      <div className="adm-hdr">
        <h1 className="adm-title">Verification Queue</h1>
        <span className="adm-badge">{submissions.length} pending</span>
      </div>
      <div className="adm-grid">
        {submissions.map((sub) => (
          <SubmissionCard
            key={sub.id}
            sub={sub}
            onDone={() => router.refresh()}
          />
        ))}
      </div>
    </div>
  );
}
