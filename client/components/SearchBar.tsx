"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, MapPin, Home, X } from "lucide-react";
import {
  getSuggestions,
  addRecentSearch,
  getRecentSearches,
  type SearchSuggestion,
} from "@/lib/search";
import { getDbSuggestions } from "@/lib/search-client";
import type { MarketId } from "@/lib/markets";

interface Props {
  marketId: MarketId;
  marketSlug: string;
  placeholder?: string;
  autoFocus?: boolean;
  onClose?: () => void;
}

export function SearchBar({
  marketId,
  marketSlug,
  placeholder = "Search by area, type, or keyword…",
  autoFocus = false,
  onClose,
}: Props) {
  const router = useRouter();
  const [query, setQuery]         = useState("");
  const [open, setOpen]           = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recents, setRecents]     = useState<string[]>([]);
  const inputRef    = useRef<HTMLInputElement>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);
  const fieldRef    = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const genRef      = useRef(0); // cancels stale DB responses
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setRecents(getRecentSearches());
  }, []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  /* Close on outside click; reposition on scroll/resize */
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onScroll() {
      if (open) positionDropdown();
    }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updateSuggestions = useCallback(
    async (q: string) => {
      const gen = ++genRef.current;

      // Show seed results immediately (synchronous, no latency)
      const seedSuggs = getSuggestions(q, marketId);
      setSuggestions(seedSuggs);
      setActiveIdx(-1);

      // For empty query (popular) no DB call needed
      if (!q.trim()) return;

      // Fire DB query; discard if a newer call has already started
      const dbSuggs = await getDbSuggestions(q, marketId).catch(() => []);
      if (gen !== genRef.current) return;
      if (!dbSuggs.length) return;

      // Merge: DB first, then seed entries not already covered by DB
      const dbKeys = new Set(dbSuggs.map((s) => `${s.type}:${s.label}`));
      const merged = [
        ...dbSuggs,
        ...seedSuggs.filter((s) => !dbKeys.has(`${s.type}:${s.label}`)),
      ].slice(0, 6);
      setSuggestions(merged);
    },
    [marketId],
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateSuggestions(v), 150);
  }

  function positionDropdown() {
    if (!fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    setDropdownStyle({
      top:   rect.bottom + 6,
      left:  rect.left,
      width: rect.width,
    });
  }

  function handleFocus() {
    positionDropdown();
    setOpen(true);
    updateSuggestions(query);
  }

  function commit(q: string) {
    if (!q.trim()) return;
    addRecentSearch(q.trim());
    setRecents(getRecentSearches());
    setOpen(false);
    router.push(`/${marketSlug}/search?q=${encodeURIComponent(q.trim())}`);
    onClose?.();
  }

  function commitSuggestion(s: SearchSuggestion) {
    if (s.type === "listing") {
      addRecentSearch(s.label);
      setOpen(false);
      router.push(s.href);
      onClose?.();
    } else if (s.href) {
      addRecentSearch(s.label);
      setOpen(false);
      router.push(s.href);
      onClose?.();
    } else {
      setQuery(s.label);
      commit(s.label);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    const items = suggestions;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && items[activeIdx]) {
        commitSuggestion(items[activeIdx]);
      } else {
        commit(query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      onClose?.();
    }
  }

  const showDropdown = open && (suggestions.length > 0 || recents.length > 0);

  function SuggIcon({ type }: { type: SearchSuggestion["type"] }) {
    if (type === "listing") return <Home size={14} strokeWidth={1.8} color="var(--forest)" />;
    if (type === "neighbourhood") return <MapPin size={14} strokeWidth={1.8} color="var(--forest)" />;
    return <MapPin size={14} strokeWidth={1.8} color="var(--clay)" />;
  }

  return (
    <div className="sb-wrap" ref={wrapRef}>
      <div className={`sb-field${open ? " sb-field--open" : ""}`} ref={fieldRef}>
        <Search size={16} strokeWidth={2} className="sb-icon" color="var(--clay)" />
        <input
          ref={inputRef}
          className="sb-input"
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKey}
          aria-label="Search properties"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
        {query && (
          <button
            className="sb-clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setSuggestions(getSuggestions("", marketId));
              inputRef.current?.focus();
            }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="sb-dropdown" role="listbox" style={dropdownStyle}>
          {/* Recent searches — only when query is empty */}
          {!query && recents.length > 0 && (
            <div className="sb-group">
              <div className="sb-group-label">Recent</div>
              {recents.map((r, i) => (
                <button
                  key={r}
                  className={`sb-item${activeIdx === i ? " sb-item--active" : ""}`}
                  role="option"
                  onClick={() => { setQuery(r); commit(r); }}
                >
                  <span className="sb-item-icon">
                    <Clock size={13} strokeWidth={1.8} color="var(--clay)" />
                  </span>
                  <span className="sb-item-label">{r}</span>
                </button>
              ))}
              <div className="sb-divider" />
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="sb-group">
              {!query && <div className="sb-group-label">Popular searches</div>}
              {suggestions.map((s, i) => {
                const offset = !query ? recents.length : 0;
                const idx = offset + i;
                return (
                  <button
                    key={`${s.type}-${s.label}`}
                    className={`sb-item${activeIdx === idx ? " sb-item--active" : ""}`}
                    role="option"
                    onClick={() => commitSuggestion(s)}
                  >
                    <span className="sb-item-icon">
                      <SuggIcon type={s.type} />
                    </span>
                    <span className="sb-item-body">
                      <span className="sb-item-label">{s.label}</span>
                      <span className="sb-item-sub">{s.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {query && suggestions.length === 0 && (
            <div className="sb-empty">
              <Search size={16} strokeWidth={1.8} color="var(--clay)" />
              No matches — press Enter to search &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
