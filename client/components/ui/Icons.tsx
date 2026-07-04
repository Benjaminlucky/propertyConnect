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
