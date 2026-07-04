/**
 * PropertyConnect Icon Library — thin re-exports from lucide-react.
 * All icons inherit strokeWidth=1.8 and currentColor by default.
 * Named exports match the legacy custom-SVG names so existing imports are unchanged.
 */

export {
  /* ── Listing specs ──────────────────────────────────────── */
  BedDouble      as BedIcon,
  Bath           as BathIcon,
  Droplets       as ToiletIcon,
  MapPin         as MapPinIcon,
  Maximize2      as AreaIcon,

  /* ── Navigation & UI ────────────────────────────────────── */
  ChevronDown    as ChevronDownIcon,
  ChevronRight   as ChevronRightIcon,
  ArrowRight     as ArrowRightIcon,
  X              as XIcon,
  Search         as SearchIcon,
  SlidersHorizontal as FilterIcon,
  Plus           as PlusIcon,
  Menu           as MenuIcon,

  /* ── Trust & verification ───────────────────────────────── */
  ShieldCheck    as ShieldCheckIcon,
  CheckCircle    as CheckCircleIcon,
  Check          as CheckIcon,
  Upload         as UploadIcon,
  Camera         as CameraIcon,
  CreditCard     as IdCardIcon,
  Fingerprint    as FingerprintIcon,

  /* ── Property types ─────────────────────────────────────── */
  Building2      as BuildingIcon,
  Home           as HomeIcon,
  KeyRound       as KeyIcon,
  Moon           as MoonIcon,
  ShoppingBag    as ShoppingBagIcon,
  Package        as PackageIcon,
  Layers         as LandIcon,
  PartyPopper    as PartyIcon,

  /* ── Dashboard & analytics ──────────────────────────────── */
  Eye            as EyeIcon,
  TrendingUp     as TrendingUpIcon,
  Mail           as EnvelopeIcon,
  Star           as StarIcon,
  Calendar       as CalendarIcon,
  Sparkles       as SparkleIcon,
  Zap            as ZapIcon,
  Pencil         as PencilIcon,
  Trash2         as TrashIcon,
  Clock          as ClockIcon,
  LayoutDashboard as DashboardIcon,
  BarChart2      as AnalyticsIcon,
  MessageSquare  as LeadsIcon,
  Settings       as SettingsIcon,
  Flame          as FlameIcon,
  Thermometer    as WarmIcon,
  Snowflake      as CoolIcon,
} from "lucide-react";

/* ── Logo mark — stays custom (colored, not currentColor) ─── */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
    >
      <rect width="30" height="30" rx="9" fill="#0b3d2e" />
      <path
        d="M7 18L15 9l8 9"
        stroke="#f0c75e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 18v4h9v-4"
        stroke="#f0c75e"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoMarkDim({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="8" fill="rgba(255,255,255,0.1)" />
      <path
        d="M6 17L14 8l8 9"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 17v3.5h9V17"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── OAuth provider marks — official brand colors, not currentColor ── */
export function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  );
}

export function FacebookMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#1877F2" d="M18 9a9 9 0 1 0-10.4 8.89v-6.29H5.31V9h2.29V7.01c0-2.26 1.35-3.51 3.41-3.51.99 0 2.02.18 2.02.18v2.22h-1.14c-1.12 0-1.47.7-1.47 1.41V9h2.5l-.4 2.6h-2.1v6.29A9 9 0 0 0 18 9Z" />
    </svg>
  );
}
