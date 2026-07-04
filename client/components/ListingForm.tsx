"use client";

import { useState, useMemo } from "react";
import {
  CATEGORIES,
  CATEGORY_LIST,
  CategoryId,
  FieldDef,
} from "@/lib/categories";
import { Market, formatPrice } from "@/lib/markets";
import { NG_STATES } from "@/lib/states";
import { Seal } from "@/components/Seal";

type StepId = "category" | "details" | "specifics" | "media" | "review";
const STEPS: { id: StepId; label: string }[] = [
  { id: "category", label: "Category" },
  { id: "details", label: "Basics" },
  { id: "specifics", label: "Details" },
  { id: "media", label: "Photos" },
  { id: "review", label: "Review" },
];

/**
 * The draft mirrors the eventual write payload:
 *   - common columns sit on the listing row
 *   - `attributes` is the EAV bag (listing_attributes rows)
 *   - `marketId` is the tenant stamp, set once, never user-editable here
 */
interface Draft {
  marketId: string;
  category: CategoryId | null;
  subType: string;
  title: string;
  description: string;
  price: string;
  pricePeriod: string;
  state: string;
  lga: string;
  neighbourhood: string;
  bedrooms: string;
  bathrooms: string;
  toilets: string;
  attributes: Record<string, string | string[]>;
  photoCount: number;
}

export function ListingForm({ market }: { market: Market }) {
  const [step, setStep] = useState<StepId>("category");
  const [draft, setDraft] = useState<Draft>({
    marketId: market.id,
    category: null,
    subType: "",
    title: "",
    description: "",
    price: "",
    pricePeriod: "",
    state: "",
    lga: "",
    neighbourhood: "",
    bedrooms: "",
    bathrooms: "",
    toilets: "",
    attributes: {},
    photoCount: 0,
  });

  const cat = draft.category ? CATEGORIES[draft.category] : null;
  const stepIdx = STEPS.findIndex((s) => s.id === step);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function setAttr(key: string, value: string | string[]) {
    setDraft((d) => ({ ...d, attributes: { ...d.attributes, [key]: value } }));
  }

  // Live listing-quality score (PRD: graded on photos, description, completeness)
  const quality = useMemo(() => {
    let s = 0;
    if (draft.title.length > 10) s += 2;
    if (draft.description.length > 120) s += 3;
    if (draft.price) s += 1;
    if (draft.neighbourhood) s += 1;
    s += Math.min(3, draft.photoCount);
    return Math.min(10, s);
  }, [draft]);

  function next() {
    const i = STEPS.findIndex((s) => s.id === step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1].id);
  }
  function back() {
    const i = STEPS.findIndex((s) => s.id === step);
    if (i > 0) setStep(STEPS[i - 1].id);
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      {/* progress */}
      <ol className="flex gap-1.5 mb-8">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex-1">
            <button
              onClick={() => i <= stepIdx && setStep(s.id)}
              disabled={i > stepIdx}
              className="w-full text-left group"
            >
              <div
                className="h-1.5 rounded-full mb-2 transition-colors"
                style={{
                  background: i <= stepIdx ? "var(--forest)" : "var(--line)",
                }}
              />
              <span
                className="text-xs font-semibold"
                style={{
                  color: i <= stepIdx ? "var(--forest)" : "var(--clay)",
                }}
              >
                {s.label}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="bg-white border border-[var(--line)] rounded-2xl p-6 sm:p-8 shadow-sm">
        {step === "category" && (
          <CategoryStep
            selected={draft.category}
            onSelect={(id) => {
              set("category", id);
              set("pricePeriod", CATEGORIES[id].pricePeriods[0]);
              set("subType", "");
              set("attributes", {});
            }}
          />
        )}

        {step === "details" && cat && (
          <DetailsStep draft={draft} cat={cat} set={set} market={market} />
        )}

        {step === "specifics" && cat && (
          <SpecificsStep
            cat={cat}
            attributes={draft.attributes}
            setAttr={setAttr}
          />
        )}

        {step === "media" && (
          <MediaStep
            count={draft.photoCount}
            onChange={(n) => set("photoCount", n)}
            quality={quality}
          />
        )}

        {step === "review" && cat && (
          <ReviewStep
            draft={draft}
            cat={cat}
            market={market}
            quality={quality}
          />
        )}

        {/* nav */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--line)]">
          <button
            onClick={back}
            disabled={stepIdx === 0}
            className="text-sm font-semibold text-[var(--clay)] disabled:opacity-40 hover:text-[var(--forest)]"
          >
            ← Back
          </button>
          {step !== "review" ? (
            <button
              onClick={next}
              disabled={step === "category" && !draft.category}
              className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white disabled:opacity-40"
              style={{ background: "var(--forest)" }}
            >
              Continue
            </button>
          ) : (
            <button
              className="px-5 py-2.5 rounded-lg font-semibold text-sm"
              style={{ background: "var(--gold)", color: "var(--ink)" }}
              onClick={() =>
                alert(
                  "Submit → POST /api/" +
                    market.id +
                    "/listings (backend pass). marketId stamped: " +
                    draft.marketId,
                )
              }
            >
              Publish listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- steps ---------------- */

function CategoryStep({
  selected,
  onSelect,
}: {
  selected: CategoryId | null;
  onSelect: (id: CategoryId) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl mb-1">What are you listing?</h2>
      <p className="text-sm text-[var(--clay)] mb-6">
        Pick a category — the form adapts to ask only what matters for it.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORY_LIST.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="text-left rounded-xl border p-4 transition"
            style={{
              borderColor: selected === c.id ? "var(--forest)" : "var(--line)",
              background: selected === c.id ? "rgba(14,90,67,.05)" : "white",
              boxShadow:
                selected === c.id ? "0 0 0 2px var(--forest) inset" : "none",
            }}
          >
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-sm font-semibold leading-tight">{c.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Labeled({
  label,
  required,
  children,
  unit,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  unit?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold tracking-wide uppercase text-[var(--clay)] mb-1.5">
        {label} {required && <span className="text-[var(--gold-deep)]">*</span>}{" "}
        {unit && (
          <span className="normal-case tracking-normal text-[var(--clay)]">
            ({unit})
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full border border-[var(--line)] rounded-lg px-3 py-2.5 text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--forest-2)]";

function DetailsStep({
  draft,
  cat,
  set,
  market,
}: {
  draft: Draft;
  cat: (typeof CATEGORIES)[CategoryId];
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  market: Market;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl mb-1">The basics</h2>
        <p className="text-sm text-[var(--clay)]">{cat.label}</p>
      </div>

      <Labeled label="Sub-type" required>
        <select
          className={inputCls}
          value={draft.subType}
          onChange={(e) => set("subType", e.target.value)}
        >
          <option value="">Select…</option>
          {cat.subTypes.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Labeled>

      <Labeled label="Listing title" required>
        <input
          className={inputCls}
          value={draft.title}
          placeholder="e.g. Contemporary 5-bedroom semi-detached duplex"
          onChange={(e) => set("title", e.target.value)}
        />
      </Labeled>

      <div className="grid grid-cols-2 gap-3">
        <Labeled label="Price" required unit={market.currency}>
          <input
            className={inputCls}
            inputMode="numeric"
            value={draft.price}
            onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))}
          />
        </Labeled>
        <Labeled label="Period">
          <select
            className={inputCls}
            value={draft.pricePeriod}
            onChange={(e) => set("pricePeriod", e.target.value)}
          >
            {cat.pricePeriods.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Labeled>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Labeled label="State" required>
          <select
            className={inputCls}
            value={draft.state}
            onChange={(e) => set("state", e.target.value)}
          >
            <option value="">Select…</option>
            {NG_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Labeled>
        <Labeled label="LGA">
          <input
            className={inputCls}
            value={draft.lga}
            placeholder="Eti-Osa"
            onChange={(e) => set("lga", e.target.value)}
          />
        </Labeled>
        <Labeled label="Neighbourhood">
          <input
            className={inputCls}
            value={draft.neighbourhood}
            placeholder="Lekki"
            onChange={(e) => set("neighbourhood", e.target.value)}
          />
        </Labeled>
      </div>

      {cat.showRooms && (
        <div className="grid grid-cols-3 gap-3">
          <Labeled label="Bedrooms">
            <input
              className={inputCls}
              inputMode="numeric"
              value={draft.bedrooms}
              onChange={(e) => set("bedrooms", e.target.value)}
            />
          </Labeled>
          <Labeled label="Bathrooms">
            <input
              className={inputCls}
              inputMode="numeric"
              value={draft.bathrooms}
              onChange={(e) => set("bathrooms", e.target.value)}
            />
          </Labeled>
          <Labeled label="Toilets">
            <input
              className={inputCls}
              inputMode="numeric"
              value={draft.toilets}
              onChange={(e) => set("toilets", e.target.value)}
            />
          </Labeled>
        </div>
      )}

      <Labeled label="Description">
        <textarea
          className={inputCls + " min-h-28"}
          value={draft.description}
          placeholder="Describe the property…"
          onChange={(e) => set("description", e.target.value)}
        />
      </Labeled>
      <button
        className="text-xs font-bold text-[var(--gold-deep)]"
        onClick={() =>
          set(
            "description",
            draft.description ||
              "A well-appointed " +
                (draft.subType || "property") +
                " in " +
                (draft.neighbourhood || "a prime location") +
                ", offering modern finishes, secure surroundings, and easy access to key amenities. [AI draft — edit before publishing]",
          )
        }
      >
        ✦ Generate with AI
      </button>

      {/* live price hint — the Smart Price Suggestion feature */}
      {draft.neighbourhood && draft.price && (
        <div
          className="text-xs rounded-lg px-3 py-2"
          style={{ background: "rgba(14,90,67,.06)", color: "var(--forest)" }}
        >
          ✦ Comparable {cat.label.toLowerCase()} in {draft.neighbourhood} list
          around {formatPrice(market, Math.round(Number(draft.price) * 0.92))}–
          {formatPrice(market, Math.round(Number(draft.price) * 1.12))}. Your
          price looks in range.
        </div>
      )}
    </div>
  );
}

function SpecificsStep({
  cat,
  attributes,
  setAttr,
}: {
  cat: (typeof CATEGORIES)[CategoryId];
  attributes: Record<string, string | string[]>;
  setAttr: (k: string, v: string | string[]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl mb-1">{cat.label} details</h2>
        <p className="text-sm text-[var(--clay)]">
          Only the fields that matter for this category.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {cat.fields.map((f) => (
          <DynamicField
            key={f.key}
            field={f}
            value={attributes[f.key]}
            onChange={(v) => setAttr(f.key, v)}
          />
        ))}
      </div>
    </div>
  );
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  if (field.type === "boolean") {
    return (
      <Labeled label={field.label}>
        <div className="flex gap-2">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className="flex-1 py-2.5 rounded-lg border text-sm font-semibold"
              style={{
                borderColor: value === opt ? "var(--forest)" : "var(--line)",
                background: value === opt ? "var(--forest)" : "white",
                color: value === opt ? "white" : "var(--ink)",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </Labeled>
    );
  }
  if (field.type === "select") {
    return (
      <Labeled label={field.label} required={field.required} unit={field.unit}>
        <select
          className={inputCls}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {field.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Labeled>
    );
  }
  if (field.type === "multiselect") {
    const arr = (value as string[]) ?? [];
    return (
      <div className="sm:col-span-2">
        <Labeled label={field.label}>
          <div className="flex flex-wrap gap-2">
            {field.options?.map((o) => {
              const on = arr.includes(o);
              return (
                <button
                  key={o}
                  onClick={() =>
                    onChange(on ? arr.filter((x) => x !== o) : [...arr, o])
                  }
                  className="px-3 py-1.5 rounded-full border text-sm"
                  style={{
                    borderColor: on ? "var(--forest)" : "var(--line)",
                    background: on ? "var(--forest)" : "white",
                    color: on ? "white" : "var(--ink)",
                  }}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </Labeled>
      </div>
    );
  }
  return (
    <Labeled label={field.label} required={field.required} unit={field.unit}>
      <input
        className={inputCls}
        inputMode={field.type === "number" ? "numeric" : "text"}
        type={field.type === "date" ? "date" : "text"}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </Labeled>
  );
}

function MediaStep({
  count,
  onChange,
  quality,
}: {
  count: number;
  onChange: (n: number) => void;
  quality: number;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl mb-1">Photos</h2>
        <p className="text-sm text-[var(--clay)]">
          Listings with 5+ photos get far more enquiries. Photos are screened
          for stolen or stock images before going live.
        </p>
      </div>
      <div className="border-2 border-dashed border-[var(--line)] rounded-xl p-8 text-center">
        <div className="text-3xl mb-2">📷</div>
        <p className="text-sm text-[var(--clay)] mb-4">
          Drag photos here, or simulate upload below.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "var(--forest)" }}
            onClick={() => onChange(count + 1)}
          >
            + Add a photo ({count})
          </button>
          {count > 0 && (
            <button
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-[var(--line)]"
              onClick={() => onChange(0)}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <QualityMeter quality={quality} />
    </div>
  );
}

function QualityMeter({ quality }: { quality: number }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(14,90,67,.05)",
        border: "1px solid rgba(14,90,67,.15)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--forest)]">
          Listing quality score
        </span>
        <span className="font-display text-xl font-semibold text-[var(--forest)]">
          {quality}/10
        </span>
      </div>
      <div className="h-2 rounded-full bg-white overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${quality * 10}%`, background: "var(--gold)" }}
        />
      </div>
      <p className="text-xs text-[var(--clay)] mt-2">
        Only you see this. Higher scores rank better in search and earn more
        enquiries.
      </p>
    </div>
  );
}

function ReviewStep({
  draft,
  cat,
  market,
  quality,
}: {
  draft: Draft;
  cat: (typeof CATEGORIES)[CategoryId];
  market: Market;
  quality: number;
}) {
  const url = `propconnectng.com/${cat.id}/${(draft.state || "nigeria").toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${(draft.lga || "lga").toLowerCase().replace(/\s+/g, "-")}/${(draft.neighbourhood || "area").toLowerCase().replace(/\s+/g, "-")}/${(draft.title || "listing").toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`;
  return (
    <div className="space-y-5">
      <h2 className="text-2xl">Review &amp; publish</h2>
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--forest)]">
        <Seal size={22} /> This listing will be screened, then carry the
        verified seal.
      </div>

      <div className="rounded-xl border border-[var(--line)] overflow-hidden">
        <div className="px-4 py-3 bg-[var(--ground)] text-sm font-semibold">
          {draft.title || "Untitled listing"}
        </div>
        <dl className="divide-y divide-[var(--line)]">
          <Row k="Category" v={cat.label} />
          <Row k="Sub-type" v={draft.subType || "—"} />
          <Row
            k="Price"
            v={
              draft.price
                ? `${formatPrice(market, Number(draft.price))} ${draft.pricePeriod}`
                : "—"
            }
          />
          <Row
            k="Location"
            v={
              [draft.neighbourhood, draft.lga, draft.state]
                .filter(Boolean)
                .join(", ") || "—"
            }
          />
          {cat.showRooms && (
            <Row
              k="Rooms"
              v={`${draft.bedrooms || 0} bed · ${draft.bathrooms || 0} bath · ${draft.toilets || 0} toilet`}
            />
          )}
          {cat.fields
            .filter((f) => draft.attributes[f.key])
            .map((f) => (
              <Row
                key={f.key}
                k={f.label}
                v={
                  Array.isArray(draft.attributes[f.key])
                    ? (draft.attributes[f.key] as string[]).join(", ")
                    : String(draft.attributes[f.key])
                }
              />
            ))}
          <Row k="Photos" v={`${draft.photoCount} uploaded`} />
          <Row k="Quality score" v={`${quality}/10`} />
          <Row k="Market" v={`${market.flag} ${market.country}`} />
        </dl>
      </div>

      <div
        className="text-xs font-mono break-all rounded-lg px-3 py-2"
        style={{
          background: "rgba(14,90,67,.07)",
          border: "1px dashed rgba(14,90,67,.25)",
          color: "var(--forest-2)",
        }}
      >
        {url}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between px-4 py-2.5 text-sm">
      <dt className="text-[var(--clay)]">{k}</dt>
      <dd className="font-semibold text-right">{v}</dd>
    </div>
  );
}
