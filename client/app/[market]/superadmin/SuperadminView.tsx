"use client";

import { useState, useEffect, useTransition, useCallback, type FormEvent } from "react";
import {
  LayoutDashboard, Building2, Users, Star, ShieldCheck, ShieldX,
  Globe2, UserCog, Search, Ban, CheckCircle2, Trash2, Clock,
} from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/lib/admin-auth";
import {
  getOverviewStats, type OverviewStats,
  listListings, setListingStatus, type AdminListing,
  listUsers, setVerificationTier, setUserBanned, type AdminUser,
  listReviews, setReviewApproved, deleteReviewAdmin, type AdminReview,
  listVerificationQueue, reviewVerification, type Submission,
  listAdmins, setUserRole, promoteByEmail, type AdminAccount,
  getMarketsOverview, type MarketOverview, type CategoryOverview,
  type Paged,
} from "./actions";

type Tab = "overview" | "listings" | "users" | "reviews" | "verification" | "markets" | "admins";

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = diff / 3_600_000;
  if (h < 1) return "just now";
  if (h < 24) return `${Math.floor(h)}h ago`;
  const d = h / 24;
  if (d < 7) return `${Math.floor(d)}d ago`;
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function Pager({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <div className="sa-pager">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
      <span>Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</button>
    </div>
  );
}

function MiniChart({ data, label }: { data: { date: string; count: number }[]; label: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="sa-panel">
      <div className="sa-panel__head">
        <h3>{label}</h3>
        <span className="sa-panel__meta">Last 30 days · total {data.reduce((s, d) => s + d.count, 0)}</span>
      </div>
      <div className="sa-chart">
        {data.map((d) => (
          <div
            key={d.date}
            className="sa-chart__bar"
            style={{ height: `${Math.max(4, Math.round((d.count / max) * 100))}%` }}
            title={`${d.count} · ${d.date}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────────────── */

function OverviewTab() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverviewStats().then(setStats).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="sa-loading">Loading overview…</div>;
  if (!stats) return <div className="sa-loading">Couldn&apos;t load overview.</div>;

  return (
    <>
      <div className="sa-kpi-row">
        <div className="sa-kpi"><span className="sa-kpi__num">{stats.totals.listings}</span><span className="sa-kpi__lbl">Total listings</span></div>
        <div className="sa-kpi"><span className="sa-kpi__num">{stats.totals.activeListings}</span><span className="sa-kpi__lbl">Active listings</span></div>
        <div className="sa-kpi"><span className="sa-kpi__num">{stats.totals.agents}</span><span className="sa-kpi__lbl">Registered users</span></div>
        <div className="sa-kpi"><span className="sa-kpi__num">{stats.totals.pendingVerification}</span><span className="sa-kpi__lbl">Pending verification</span></div>
        <div className="sa-kpi"><span className="sa-kpi__num">{stats.totals.reviews}</span><span className="sa-kpi__lbl">Total reviews</span></div>
      </div>
      <div className="sa-chart-grid">
        <MiniChart data={stats.newListings30d} label="New listings" />
        <MiniChart data={stats.newSignups30d} label="New signups" />
        <MiniChart data={stats.leads30d} label="Leads" />
      </div>
    </>
  );
}

/* ── Listings ─────────────────────────────────────────────────────── */

function ListingsTab() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paged<AdminListing> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(() => {
    setLoading(true);
    listListings({ q: q || undefined, status: status || undefined, page })
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [q, status, page]);

  useEffect(() => { load(); }, [load]);

  function handleStatus(id: number, next: "active" | "suspended" | "deleted") {
    startTransition(async () => {
      try {
        await setListingStatus(id, next);
        toast.success(`Listing ${next}`);
        load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  return (
    <>
      <div className="sa-toolbar">
        <div className="sa-search">
          <Search size={14} strokeWidth={2} />
          <input placeholder="Search title…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {loading ? <div className="sa-loading">Loading…</div> : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr><th>Title</th><th>Location</th><th>Agent</th><th>Status</th><th>Listed</th><th></th></tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((l) => (
                <tr key={l.id} className={isPending ? "sa-row--busy" : ""}>
                  <td className="sa-cell-title">{l.title}</td>
                  <td>{[l.neighbourhood, l.state].filter(Boolean).join(", ")}</td>
                  <td>{l.agent_profiles?.name ?? "—"}</td>
                  <td><span className={`sa-badge sa-badge--${l.status}`}>{l.status}</span></td>
                  <td>{relTime(l.created_at)}</td>
                  <td className="sa-actions">
                    {l.status !== "active" && <button onClick={() => handleStatus(l.id, "active")} title="Activate"><CheckCircle2 size={15} /></button>}
                    {l.status !== "suspended" && <button onClick={() => handleStatus(l.id, "suspended")} title="Suspend"><Ban size={15} /></button>}
                    {l.status !== "deleted" && <button onClick={() => handleStatus(l.id, "deleted")} title="Delete" className="sa-danger"><Trash2 size={15} /></button>}
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && <tr><td colSpan={6} className="sa-empty-row">No listings found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />}
    </>
  );
}

/* ── Users ────────────────────────────────────────────────────────── */

function UsersTab() {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paged<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(() => {
    setLoading(true);
    listUsers({ q: q || undefined, tier: tier || undefined, page })
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [q, tier, page]);

  useEffect(() => { load(); }, [load]);

  function handleTier(id: string, next: AdminUser["verification_tier"]) {
    startTransition(async () => {
      try {
        await setVerificationTier(id, next as "starter" | "bronze" | "silver" | "gold");
        toast.success("Tier updated");
        load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  function handleBan(id: string, banned: boolean) {
    startTransition(async () => {
      try {
        await setUserBanned(id, banned);
        toast.success(banned ? "User banned" : "User unbanned");
        load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  return (
    <>
      <div className="sa-toolbar">
        <div className="sa-search">
          <Search size={14} strokeWidth={2} />
          <input placeholder="Search name or email…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <select value={tier} onChange={(e) => { setTier(e.target.value); setPage(1); }}>
          <option value="">All tiers</option>
          <option value="starter">Starter</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
        </select>
      </div>

      {loading ? <div className="sa-loading">Loading…</div> : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Persona</th><th>Tier</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((u) => (
                <tr key={u.id} className={isPending ? "sa-row--busy" : ""}>
                  <td className="sa-cell-title">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.persona}</td>
                  <td>
                    <select value={u.verification_tier} onChange={(e) => handleTier(u.id, e.target.value as AdminUser["verification_tier"])}>
                      <option value="starter">Starter</option>
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                    </select>
                  </td>
                  <td>{relTime(u.created_at)}</td>
                  <td className="sa-actions">
                    <button className="sa-danger" title="Ban" onClick={() => handleBan(u.id, true)}><Ban size={15} /></button>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && <tr><td colSpan={6} className="sa-empty-row">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />}
    </>
  );
}

/* ── Reviews ──────────────────────────────────────────────────────── */

function ReviewsTab() {
  const [page, setPage] = useState(1);
  const [approved, setApprovedFilter] = useState("");
  const [data, setData] = useState<Paged<AdminReview> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(() => {
    setLoading(true);
    listReviews({ approved: approved === "" ? undefined : approved === "true", page })
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [approved, page]);

  useEffect(() => { load(); }, [load]);

  function handleApprove(id: number, next: boolean) {
    startTransition(async () => {
      try {
        await setReviewApproved(id, next);
        toast.success(next ? "Review approved" : "Review unpublished");
        load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteReviewAdmin(id);
        toast.success("Review deleted");
        load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  return (
    <>
      <div className="sa-toolbar">
        <select value={approved} onChange={(e) => { setApprovedFilter(e.target.value); setPage(1); }}>
          <option value="">All reviews</option>
          <option value="true">Published</option>
          <option value="false">Unpublished</option>
        </select>
      </div>

      {loading ? <div className="sa-loading">Loading…</div> : (
        <div className="sa-grid-reviews">
          {(data?.items ?? []).map((r) => (
            <div key={r.id} className={`sa-review-card${isPending ? " sa-row--busy" : ""}`}>
              <div className="sa-review-head">
                <span className="sa-review-name">{r.name}</span>
                <span className="sa-review-rating">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
              </div>
              <p className="sa-review-comment">{r.comment}</p>
              <div className="sa-review-foot">
                <span className="sa-time"><Clock size={12} /> {relTime(r.created_at)}</span>
                <div className="sa-actions">
                  {r.approved
                    ? <button onClick={() => handleApprove(r.id, false)} title="Unpublish"><ShieldX size={15} /></button>
                    : <button onClick={() => handleApprove(r.id, true)} title="Publish"><ShieldCheck size={15} /></button>}
                  <button className="sa-danger" title="Delete" onClick={() => handleDelete(r.id)}><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
          {data?.items.length === 0 && <div className="sa-empty-row">No reviews found.</div>}
        </div>
      )}
      {data && <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />}
    </>
  );
}

/* ── Verification queue ───────────────────────────────────────────── */

const STEP_LABEL: Record<string, string> = { nin: "NIN", bvn: "BVN", face: "Face ID", cac: "CAC", rean: "REAN", photo: "Photo ID" };

function SubmissionData({ stepId, data }: { stepId: string; data: Record<string, string> | null }) {
  if (!data || Object.keys(data).length === 0) return <p className="sa-nodata">No data submitted</p>;

  const fileUrl = data.file_url;
  const isImage = stepId === "face" || stepId === "photo";

  if (fileUrl && isImage) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="sa-doc-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fileUrl.replace("/upload/", "/upload/w_480,h_320,c_fill/")} alt="Submitted document" />
        <span>Open full image ↗</span>
      </a>
    );
  }

  if (fileUrl) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="sa-doc-link">
        View document ↗
        <span>{decodeURIComponent(fileUrl.split("/").pop() ?? "")}</span>
      </a>
    );
  }

  const num = data.nin_number ?? data.bvn_number ?? data.rean_number;
  if (num) return <p className="sa-num">Submitted: <strong>{num}</strong></p>;

  return <pre className="sa-raw">{JSON.stringify(data, null, 2)}</pre>;
}

function VerificationTab() {
  const [items, setItems] = useState<Submission[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(() => {
    setLoading(true);
    listVerificationQueue().then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function handle(id: number, action: "approved" | "rejected") {
    startTransition(async () => {
      try {
        await reviewVerification(id, action);
        toast.success(action === "approved" ? "Approved" : "Rejected");
        load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  if (loading) return <div className="sa-loading">Loading…</div>;
  if (!items || items.length === 0) return <div className="sa-empty-row">No pending submissions. All caught up.</div>;

  return (
    <div className="sa-grid-reviews">
      {items.map((s) => (
        <div key={s.id} className={`sa-review-card${isPending ? " sa-row--busy" : ""}`}>
          <div className="sa-review-head">
            <span className="sa-badge">{STEP_LABEL[s.step_id] ?? s.step_id}</span>
            <span className="sa-review-name">{s.agent_profiles?.name ?? "Unknown"}</span>
          </div>
          <p className="sa-review-comment">{s.agent_profiles?.email}</p>
          <SubmissionData stepId={s.step_id} data={s.data} />
          <div className="sa-review-foot">
            <span className="sa-time"><Clock size={12} /> {relTime(s.submitted_at)}</span>
            <div className="sa-actions">
              <button onClick={() => handle(s.id, "approved")} title="Approve"><ShieldCheck size={15} /></button>
              <button className="sa-danger" onClick={() => handle(s.id, "rejected")} title="Reject"><ShieldX size={15} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Markets & categories (read-only) ────────────────────────────── */

function MarketsTab() {
  const [data, setData] = useState<{ markets: MarketOverview[]; categories: CategoryOverview[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarketsOverview().then(setData).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="sa-loading">Loading…</div>;
  if (!data) return null;

  return (
    <>
      <p className="sa-note">
        Markets and categories are code-level config (<code>lib/markets.ts</code>, <code>lib/categories.ts</code>) —
        changing live status or adding a new market/category is still a code change + deploy. This is a read-only view.
      </p>
      <div className="sa-table-wrap">
        <table className="sa-table">
          <thead><tr><th>Market</th><th>Status</th><th>Listings</th><th>Agents</th></tr></thead>
          <tbody>
            {data.markets.map((m) => (
              <tr key={m.id}>
                <td className="sa-cell-title">{m.flag} {m.country}</td>
                <td><span className={`sa-badge ${m.live ? "sa-badge--active" : ""}`}>{m.live ? "Live" : "Not launched"}</span></td>
                <td>{m.listingCount}</td>
                <td>{m.agentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sa-table-wrap" style={{ marginTop: 20 }}>
        <table className="sa-table">
          <thead><tr><th>Category</th><th>Listings</th></tr></thead>
          <tbody>
            {data.categories.map((c) => (
              <tr key={c.id}><td className="sa-cell-title">{c.label}</td><td>{c.listingCount}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Admins (superadmin only) ─────────────────────────────────────── */

function AdminsTab() {
  const [items, setItems] = useState<AdminAccount[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteRole, setPromoteRole] = useState<"admin" | "superadmin">("admin");

  const load = useCallback(() => {
    setLoading(true);
    listAdmins().then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleRole(id: string, role: "user" | "admin" | "superadmin") {
    startTransition(async () => {
      try {
        await setUserRole(id, role);
        toast.success("Role updated");
        load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  function handlePromote(e: FormEvent) {
    e.preventDefault();
    if (!promoteEmail.trim()) return;
    startTransition(async () => {
      try {
        await promoteByEmail(promoteEmail.trim(), promoteRole);
        toast.success(`Promoted to ${promoteRole}`);
        setPromoteEmail("");
        load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  return (
    <>
      <p className="sa-note">
        Promote any existing account to admin or superadmin by email. You can&apos;t change your own
        role — ask another superadmin to do it.
      </p>
      <form className="sa-toolbar" onSubmit={handlePromote}>
        <div className="sa-search">
          <Search size={14} strokeWidth={2} />
          <input
            type="email"
            placeholder="user@example.com"
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            required
          />
        </div>
        <select value={promoteRole} onChange={(e) => setPromoteRole(e.target.value as "admin" | "superadmin")}>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
        <button type="submit" className="sa-promote-btn" disabled={isPending}>Promote</button>
      </form>
      {loading ? <div className="sa-loading">Loading…</div> : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Since</th><th></th></tr></thead>
            <tbody>
              {(items ?? []).map((a) => (
                <tr key={a.id} className={isPending ? "sa-row--busy" : ""}>
                  <td className="sa-cell-title">{a.name}</td>
                  <td>{a.email}</td>
                  <td>
                    <select value={a.role} onChange={(e) => handleRole(a.id, e.target.value as "user" | "admin" | "superadmin")}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </td>
                  <td>{relTime(a.created_at)}</td>
                  <td></td>
                </tr>
              ))}
              {items?.length === 0 && <tr><td colSpan={5} className="sa-empty-row">No admins yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ── Shell ────────────────────────────────────────────────────────── */

const TABS: { id: Tab; label: string; Icon: typeof LayoutDashboard; superadminOnly?: boolean }[] = [
  { id: "overview",     label: "Overview",     Icon: LayoutDashboard },
  { id: "listings",     label: "Listings",     Icon: Building2 },
  { id: "users",        label: "Users",        Icon: Users },
  { id: "reviews",      label: "Reviews",      Icon: Star },
  { id: "verification", label: "Verification", Icon: ShieldCheck },
  { id: "markets",      label: "Markets",      Icon: Globe2 },
  { id: "admins",       label: "Admins",       Icon: UserCog, superadminOnly: true },
];

export function SuperadminView({ role }: { role: Role; marketSlug: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const visibleTabs = TABS.filter((t) => !t.superadminOnly || role === "superadmin");

  return (
    <div className="sa-shell">
      <div className="sa-hdr">
        <h1 className="sa-title">Superadmin</h1>
        <span className="sa-role-badge">{role}</span>
      </div>

      <div className="sa-tabs">
        {visibleTabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`sa-tab${tab === id ? " sa-tab--active" : ""}`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} strokeWidth={2} /> {label}
          </button>
        ))}
      </div>

      <div className="sa-content">
        {tab === "overview" && <OverviewTab />}
        {tab === "listings" && <ListingsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "reviews" && <ReviewsTab />}
        {tab === "verification" && <VerificationTab />}
        {tab === "markets" && <MarketsTab />}
        {tab === "admins" && role === "superadmin" && <AdminsTab />}
      </div>
    </div>
  );
}
