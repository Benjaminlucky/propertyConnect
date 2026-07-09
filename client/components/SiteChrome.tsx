"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Market } from "@/lib/markets";
import { LogoMark, LogoMarkDim, ChevronRightIcon, XIcon } from "@/components/ui/Icons";
import { SearchBar } from "@/components/SearchBar";
import { Search } from "lucide-react";
import { getSessionUser } from "@/lib/auth";

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

const NAV_CATS = [
  { label: "For Sale",  slug: "for-sale",    blurb: "Flats, duplexes, villas, off-plan" },
  { label: "For Rent",  slug: "for-rent",    blurb: "Apartments, self-contain, shared" },
  { label: "Short-let", slug: "short-let",   blurb: "Nightly & weekly stays" },
  { label: "Office",    slug: "office",      blurb: "Serviced, open-plan, co-working" },
  { label: "Retail",    slug: "retail",      blurb: "Mall units, showrooms, stalls" },
  { label: "Warehouse", slug: "warehouse",   blurb: "Storage, logistics, cold storage" },
  { label: "Land",      slug: "land",        blurb: "Plots with C of O, survey, gazette" },
  { label: "Events",    slug: "event-venue", blurb: "Halls, rooftops, outdoor spaces" },
] as const;

export function SiteHeader({ market }: { market: Market }) {
  const [open, setOpen] = useState(false);
  const [raised, setRaised] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userInitials, setUserInitials] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    getSessionUser().then((u) => {
      if (!cancelled) setUserInitials(u ? toInitials(u.name) : null);
    });
    return () => { cancelled = true; };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setRaised(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  const isActive = (slug: string) =>
    pathname.startsWith(`/${market.slug}/${slug}`);

  return (
    <>
      <header className={`pc-nav${raised ? " pc-nav--raised" : ""}`}>
        <div className="pc-nav__inner">

          {/* Logo */}
          <Link className="pc-logo" href={`/${market.slug}`} onClick={close}>
            <span className="pc-logo__mark">
              <LogoMark size={30} />
            </span>
            <span className="pc-logo__name">MyPropertyConnect</span>
          </Link>

          {/* Desktop search bar — takes all flex space between logo and CTAs */}
          <div className="pc-search-wrap">
            <SearchBar
              marketId={market.id}
              marketSlug={market.slug}
              placeholder="Area, type or keyword…"
            />
          </div>

          {/* Right CTAs + hamburger */}
          <div className="pc-nav__end">
            {/* Mobile search toggle */}
            <button
              className="pc-search-toggle"
              aria-label="Search properties"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} strokeWidth={2} />
            </button>
            {userInitials ? (
              <Link
                className="pc-user-avatar"
                href={`/${market.slug}/dashboard`}
                aria-label="Go to dashboard"
              >
                {userInitials}
              </Link>
            ) : (
              <Link
                className="pc-cta pc-cta--ghost"
                href={`/${market.slug}/dashboard`}
              >
                Sign in
              </Link>
            )}
            <Link className="pc-cta pc-cta--gold" href={`/${market.slug}/list`}>
              List free
            </Link>
            <button
              className={`pc-burger${open ? " pc-burger--x" : ""}`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="pc-drawer"
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Category sub-bar — desktop only, below main row */}
        <nav className="pc-cats-bar" aria-label="Property categories">
          {NAV_CATS.map((c) => (
            <Link
              key={c.slug}
              className={`pc-cats-bar__link${isActive(c.slug) ? " pc-cats-bar__link--active" : ""}`}
              href={`/${market.slug}/${c.slug}/nigeria`}
            >
              {c.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Mobile search overlay */}
      <div className={`pc-search-overlay${searchOpen ? " open" : ""}`} onClick={() => setSearchOpen(false)}>
        <div className="pc-search-overlay-inner" onClick={(e) => e.stopPropagation()}>
          <div className="pc-search-overlay-close">
            <button onClick={() => setSearchOpen(false)} aria-label="Close search">
              <XIcon size={18} strokeWidth={2} />
            </button>
            <span>Search properties</span>
          </div>
          <SearchBar
            marketId={market.id}
            marketSlug={market.slug}
            autoFocus={searchOpen}
            onClose={() => setSearchOpen(false)}
          />
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={`pc-backdrop${open ? " pc-backdrop--on" : ""}`}
        aria-hidden="true"
        onClick={close}
      />

      {/* Slide-in drawer */}
      <aside
        id="pc-drawer"
        className={`pc-drawer${open ? " pc-drawer--open" : ""}`}
        aria-label="Navigation"
        aria-hidden={!open}
      >
        <div className="pc-drawer__head">
          <Link className="pc-logo" href={`/${market.slug}`} onClick={close}>
            <span className="pc-logo__mark">
              <LogoMark size={28} />
            </span>
            <span className="pc-logo__name">MyPropertyConnect</span>
          </Link>
          <button
            className="pc-drawer__close"
            aria-label="Close menu"
            onClick={close}
          >
            <XIcon size={16} strokeWidth={2} />
          </button>
        </div>

        <p className="pc-drawer__eyebrow">Browse all categories</p>

        <nav className="pc-drawer__nav" aria-label="All property categories">
          {NAV_CATS.map((c) => (
            <Link
              key={c.slug}
              className={`pc-drawer__item${isActive(c.slug) ? " pc-drawer__item--active" : ""}`}
              href={`/${market.slug}/${c.slug}/nigeria`}
              onClick={close}
            >
              <div className="pc-drawer__item-text">
                <div className="pc-drawer__item-name">{c.label}</div>
                <div className="pc-drawer__item-blurb">{c.blurb}</div>
              </div>
              <span className="pc-drawer__item-arrow">
                <ChevronRightIcon size={16} strokeWidth={2} />
              </span>
            </Link>
          ))}
        </nav>

        <div className="pc-drawer__ctas">
          <Link
            className="pc-cta pc-cta--outline"
            href={`/${market.slug}/dashboard`}
            onClick={close}
          >
            {userInitials ? "Go to dashboard" : "Sign in to dashboard"}
          </Link>
          <Link
            className="pc-cta pc-cta--gold"
            href={`/${market.slug}/list`}
            onClick={close}
          >
            List a property free
          </Link>
        </div>
      </aside>
    </>
  );
}

export function SiteFooter({ market }: { market: Market }) {
  return (
    <footer className="pc-footer">
      <div className="pc-footer__inner">
        <div className="pc-footer__grid">

          {/* Brand column */}
          <div>
            <div className="pc-footer__brand">
              <LogoMarkDim size={28} />
              <span className="pc-footer__brand-name">MyPropertyConnect</span>
            </div>
            <p className="pc-footer__tagline">
              The operating system for Nigerian real estate. List free, find fast,
              deal smart — across all 36 states and the FCT.
            </p>
          </div>

          {/* Buy column */}
          <div>
            <h4 className="pc-footer__col-title">Buy</h4>
            <Link href={`/${market.slug}/for-sale/lagos`}>Flats in Lagos</Link>
            <Link href={`/${market.slug}/for-sale/fct-abuja`}>Houses in Abuja</Link>
            <Link href={`/${market.slug}/for-sale/rivers`}>Homes in Port Harcourt</Link>
            <Link href={`/${market.slug}/land/nigeria`}>Land nationwide</Link>
          </div>

          {/* Rent column */}
          <div>
            <h4 className="pc-footer__col-title">Rent</h4>
            <Link href={`/${market.slug}/for-rent/lagos`}>Flats in Lagos</Link>
            <Link href={`/${market.slug}/for-rent/fct-abuja`}>Flats in Abuja</Link>
            <Link href={`/${market.slug}/short-let/nigeria`}>Short-lets nationwide</Link>
            <Link href={`/${market.slug}/for-rent/oyo`}>Rentals in Ibadan</Link>
          </div>

          {/* Professionals column */}
          <div>
            <h4 className="pc-footer__col-title">Professionals</h4>
            <Link href={`/${market.slug}/dashboard`}>Agent dashboard</Link>
            <Link href={`/${market.slug}/list`}>List a property</Link>
            <Link href={`/${market.slug}/verify`}>Get verified</Link>
            <Link href={`/${market.slug}`}>Market reports</Link>
          </div>
        </div>

        <div className="pc-footer__bot">
          <span>© 2026 MyPropertyConnect · Nigeria</span>
          <span className="pc-footer__credit">A product of Mark V Technologies Limited</span>
          <span>Privacy · Terms · Report a listing</span>
        </div>
      </div>
    </footer>
  );
}
