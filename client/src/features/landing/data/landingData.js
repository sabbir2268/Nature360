import {
  Activity,
  BarChart3,
  BellRing,
  Bot,
  Camera,
  ChartLine,
  ClipboardCheck,
  ClipboardList,
  Compass,
  Droplets,
  Eye,
  FilePlus2,
  FlaskConical,
  Gauge,
  ListChecks,
  Map,
  MapPin,
  RefreshCw,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCog,
  Users,
  Volume2,
  Wind,
  Wrench,
  CircleCheck,
} from "lucide-react";

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Insights", href: "#insights" },
  { label: "About", href: "#about" },
];

export const heroStats = [
  { value: "12.4k", label: "Reports mapped", icon: MapPin, note: "Demo" },
  { value: "3.2k", label: "Community volunteers", icon: Users, note: "Demo" },
  { value: "9.4 days", label: "Average resolution", icon: Activity, note: "Demo" },
];

export const awarenessCards = [
  {
    title: "Community Driven",
    description:
      "Citizens report environmental problems from the places they know best, turning everyday observations into visible local evidence.",
    icon: Users,
    accent: "from-emerald-500/18 to-lime-300/10",
    iconClass: "text-emerald-700",
  },
  {
    title: "Transparent Response",
    description:
      "Every complaint has a visible journey. Citizens can follow verification, investigation, action, and resolution without guessing.",
    icon: Eye,
    accent: "from-forest-700/15 to-emerald-400/10",
    iconClass: "text-forest-700",
  },
  {
    title: "Data-Informed Decisions",
    description:
      "Authorities identify recurring problems, compare patterns, and prioritize action using organized reports and clear environmental signals.",
    icon: BarChart3,
    accent: "from-lime-400/20 to-emerald-400/10",
    iconClass: "text-lime-700",
  },
];

export const problems = [
  {
    title: "Illegal Dumping",
    description: "Unauthorized garbage disposal in public spaces, roadsides, and waterways.",
    icon: Trash2,
    accent: "from-amber-400/20 via-orange-300/10 to-transparent",
    iconClass: "text-amber-700",
    tag: "Waste",
  },
  {
    title: "Water Pollution",
    description: "Contaminated water, blocked drainage, and pollution entering local water bodies.",
    icon: Droplets,
    accent: "from-sky-400/20 via-cyan-300/10 to-transparent",
    iconClass: "text-sky-700",
    tag: "Water",
  },
  {
    title: "Air Pollution",
    description: "Smoke, dust, and harmful emissions affecting neighborhood air quality.",
    icon: Wind,
    accent: "from-slate-400/20 via-emerald-300/10 to-transparent",
    iconClass: "text-slate-600",
    tag: "Air",
  },
  {
    title: "Noise Pollution",
    description: "Excessive environmental noise from sites, events, or industrial activity.",
    icon: Volume2,
    accent: "from-violet-400/16 via-fuchsia-300/8 to-transparent",
    iconClass: "text-violet-700",
    tag: "Noise",
  },
  {
    title: "Chemical Waste",
    description: "Suspicious chemical disposal, spills, and unsafe handling of hazardous materials.",
    icon: FlaskConical,
    accent: "from-rose-400/18 via-orange-300/8 to-transparent",
    iconClass: "text-rose-700",
    tag: "Hazard",
  },
];

export const timelineSteps = [
  {
    title: "Report an Issue",
    description: "Submit descriptions, GPS location, and photo or video evidence.",
    icon: FilePlus2,
    label: "Citizen",
  },
  {
    title: "Verification",
    description: "Officers review the report, validate details, and classify the case.",
    icon: ClipboardCheck,
    label: "Officer",
  },
  {
    title: "Investigation",
    description: "Volunteers investigate assigned cases and add field observations.",
    icon: SearchCheck,
    label: "Volunteer",
  },
  {
    title: "Take Action",
    description: "Officers record corrective actions and update the complaint record.",
    icon: Wrench,
    label: "Officer",
  },
  {
    title: "Track Progress",
    description: "Citizens monitor complaint status and receive meaningful updates.",
    icon: Activity,
    label: "Citizen",
  },
  {
    title: "Resolution",
    description: "Citizens confirm resolution or reopen the issue if concerns remain.",
    icon: CircleCheck,
    label: "Community",
  },
];

export const bentoFeatures = [
  {
    title: "Geo-Tagged Reporting",
    description:
      "Every report carries a precise location, evidence, and context so issues are easy to find and verify.",
    icon: MapPin,
    span: "lg:col-span-5",
    visual: "geo",
    accent: "from-emerald-500/14 to-lime-300/8",
  },
  {
    title: "Real-Time Complaint Tracking",
    description:
      "A shared status timeline keeps citizens and officers aligned from submission to resolution.",
    icon: RefreshCw,
    span: "lg:col-span-7",
    visual: "tracking",
    accent: "from-forest-700/12 to-emerald-400/8",
  },
  {
    title: "Interactive Environmental Hotspot Map",
    description:
      "Explore reports by location, category, and severity to understand where environmental pressure is concentrated.",
    icon: Map,
    span: "lg:col-span-7",
    visual: "map",
    accent: "from-sky-500/12 to-emerald-300/8",
  },
  {
    title: "Rule-Based Pollution Risk Score",
    description:
      "A transparent Low, Moderate, High, or Critical score based on defined report thresholds and severity rules.",
    icon: Gauge,
    span: "lg:col-span-5",
    visual: "risk",
    accent: "from-amber-400/14 to-emerald-300/8",
  },
  {
    title: "Environmental Analytics & Trends",
    description:
      "Understand report volume, category mix, and resolution performance through clear trend charts.",
    icon: ChartLine,
    span: "lg:col-span-4",
    visual: "analytics",
    accent: "from-lime-400/16 to-emerald-300/8",
  },
  {
    title: "Threshold-Based Alerts",
    description:
      "Configurable thresholds highlight when a location or category needs attention.",
    icon: BellRing,
    span: "lg:col-span-4",
    visual: "alerts",
    accent: "from-rose-400/12 to-amber-300/8",
  },
  {
    title: "Field Investigation Management",
    description:
      "Assign investigations, capture observations, and keep field work connected to the case record.",
    icon: ClipboardList,
    span: "lg:col-span-4",
    visual: "field",
    accent: "from-emerald-500/12 to-sky-300/8",
  },
  {
    title: "Role Management & Audit Logs",
    description:
      "Citizens, volunteers, and officers see the right tools, with clear activity records for accountability.",
    icon: UserCog,
    span: "lg:col-span-5",
    visual: "roles",
    accent: "from-forest-700/12 to-lime-300/8",
  },
  {
    title: "AI-Assisted Complaint Classification",
    description:
      "AI suggests complaint categories and severity to speed up review. Environmental officers make the final decision.",
    icon: Bot,
    span: "lg:col-span-7",
    visual: "ai",
    accent: "from-violet-400/12 to-emerald-300/8",
  },
];

export const carouselSlides = [
  {
    id: "report",
    eyebrow: "Citizen Reporting",
    title: "See a Problem? Make It Visible.",
    description:
      "Report illegal dumping, water pollution, air pollution, and other environmental problems with location-based evidence.",
    bullets: [
      "Add photo or video evidence",
      "Attach GPS location automatically",
      "Submit a clear report in minutes",
    ],
    icon: Camera,
    visual: "phone",
  },
  {
    id: "intelligence",
    eyebrow: "Environmental Intelligence",
    title: "Discover Pollution Hotspots Before They Grow.",
    description:
      "Explore environmental reports, recurring hotspots, and geographic pollution risks.",
    bullets: [
      "Browse reports by neighborhood",
      "Spot recurring pollution patterns",
      "Review transparent risk levels",
    ],
    icon: Compass,
    visual: "map",
  },
  {
    id: "action",
    eyebrow: "Community Action",
    title: "From Reports to Real-World Action.",
    description:
      "Follow complaints through verification, investigation, corrective action, and resolution.",
    bullets: [
      "See every status update",
      "Follow investigation outcomes",
      "Confirm resolution or reopen",
    ],
    icon: ShieldCheck,
    visual: "timeline",
  },
];

export const aboutValues = [
  {
    title: "Citizen-first by design",
    description: "Reporting should feel simple, respectful, and worth the effort.",
    icon: Users,
  },
  {
    title: "Transparent by default",
    description: "Progress should be visible to the people who raised the issue.",
    icon: Eye,
  },
  {
    title: "Action over noise",
    description: "The goal is not more complaints. It is cleaner, safer places.",
    icon: ShieldCheck,
  },
];

export const footerColumns = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "#home" },
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Insights", href: "#insights" },
      { label: "About", href: "#about" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Reporting", href: "#features" },
      { label: "Tracking", href: "#how-it-works" },
      { label: "Analytics", href: "#insights" },
      { label: "Hotspot Monitoring", href: "#insights" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", to: "/login" },
      { label: "Register", to: "/register" },
    ],
  },
];

export const trustPoints = [
  { label: "Citizen reports", icon: Camera },
  { label: "Visible progress", icon: ListChecks },
  { label: "Officer review", icon: ShieldAlert },
  { label: "Community action", icon: Sparkles },
];
