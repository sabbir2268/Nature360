export const severityMeta = {
  Low: {
    color: "#10B981",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Moderate: {
    color: "#F59E0B",
    soft: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  High: {
    color: "#F97316",
    soft: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  Critical: {
    color: "#EF4444",
    soft: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

export const riskScores = [
  {
    level: "Low",
    score: 28,
    description: "Minor reports with limited environmental impact.",
    color: "#10B981",
    track: "#D1FAE5",
  },
  {
    level: "Moderate",
    score: 46,
    description: "Recurring reports that need routine follow-up.",
    color: "#F59E0B",
    track: "#FEF3C7",
  },
  {
    level: "High",
    score: 72,
    description: "Concentrated or repeated issues requiring priority review.",
    color: "#F97316",
    track: "#FFEDD5",
  },
  {
    level: "Critical",
    score: 89,
    description: "Severe or hazardous reports that need immediate attention.",
    color: "#EF4444",
    track: "#FFE4E6",
  },
];

export const hotspots = [
  {
    id: "riverside",
    name: "Riverside Walk",
    category: "Water Pollution",
    severity: "Critical",
    x: 66,
    y: 58,
    reports: 34,
    status: "Under review",
  },
  {
    id: "north-market",
    name: "North Market Lane",
    category: "Illegal Dumping",
    severity: "High",
    x: 30,
    y: 26,
    reports: 27,
    status: "Investigation",
  },
  {
    id: "green-park",
    name: "Green Park Edge",
    category: "Illegal Dumping",
    severity: "Moderate",
    x: 49,
    y: 70,
    reports: 19,
    status: "Action taken",
  },
  {
    id: "industrial",
    name: "East Industrial Zone",
    category: "Air Pollution",
    severity: "High",
    x: 78,
    y: 34,
    reports: 23,
    status: "Investigation",
  },
  {
    id: "transit",
    name: "Central Transit Hub",
    category: "Noise Pollution",
    severity: "Moderate",
    x: 55,
    y: 44,
    reports: 16,
    status: "Under review",
  },
  {
    id: "workshop",
    name: "Old Workshop Row",
    category: "Chemical Waste",
    severity: "Critical",
    x: 20,
    y: 63,
    reports: 12,
    status: "Action taken",
  },
  {
    id: "lakeview",
    name: "Lakeview Drain",
    category: "Water Pollution",
    severity: "Low",
    x: 84,
    y: 72,
    reports: 8,
    status: "Resolved",
  },
  {
    id: "school",
    name: "School Road",
    category: "Air Pollution",
    severity: "Low",
    x: 42,
    y: 52,
    reports: 7,
    status: "Resolved",
  },
];

export const categoryOptions = [
  "All categories",
  "Illegal Dumping",
  "Water Pollution",
  "Air Pollution",
  "Noise Pollution",
  "Chemical Waste",
];

export const severityOptions = ["All severities", "Low", "Moderate", "High", "Critical"];

export const reportsOverTime = [
  { month: "Jan", reports: 120, resolved: 82 },
  { month: "Feb", reports: 148, resolved: 96 },
  { month: "Mar", reports: 132, resolved: 104 },
  { month: "Apr", reports: 176, resolved: 128 },
  { month: "May", reports: 190, resolved: 142 },
  { month: "Jun", reports: 168, resolved: 150 },
  { month: "Jul", reports: 214, resolved: 168 },
  { month: "Aug", reports: 238, resolved: 186 },
  { month: "Sep", reports: 226, resolved: 201 },
];

export const categoryData = [
  { name: "Illegal Dumping", value: 32, color: "#14532D" },
  { name: "Water Pollution", value: 24, color: "#10B981" },
  { name: "Air Pollution", value: 18, color: "#84CC16" },
  { name: "Noise Pollution", value: 14, color: "#A3E635" },
  { name: "Chemical Waste", value: 12, color: "#D9F99D" },
];

export const resolutionData = [
  { category: "Dumping", resolved: 68, pending: 14 },
  { category: "Water", resolved: 54, pending: 12 },
  { category: "Air", resolved: 42, pending: 9 },
  { category: "Noise", resolved: 31, pending: 7 },
  { category: "Chemical", resolved: 22, pending: 6 },
];
