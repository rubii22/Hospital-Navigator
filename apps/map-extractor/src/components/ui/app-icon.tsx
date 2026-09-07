import React from "react";
import {
  Menu,
  Stethoscope,
  Building2,
  Search,
  DoorOpen,
  Activity,
  Accessibility,
  Calendar,
  AlertTriangle,
  Heart,
  ScanEye,
  Pill,
  CornerUpRight,
  Navigation,
  Check,
  QrCode,
  Download,
  PhoneCall,
  HeartPulse,
  MapPin,
  Globe,
  Upload,
  Cpu,
  Layers,
  Box,
  Sliders,
  ChevronRight,
  ChevronDown,
  RotateCw,
  Maximize2,
  PlusCircle,
  MinusCircle,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Cloud,
  FileText,
  User,
  Home,
  Scan,
  RefreshCw,
  Play,
  Pause,
  Flashlight,
  Grid,
} from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";

const icons = {
  menu: Menu,
  medical: Stethoscope,
  hospital: Building2,
  search: Search,
  room: DoorOpen,
  services: Activity,
  accessibility: Accessibility,
  visits: Calendar,
  emergency: AlertTriangle,
  department: Heart,
  radiology: ScanEye,
  pharmacy: Pill,
  route: CornerUpRight,
  navigation: Navigation,
  check: Check,
  qr: QrCode,
  download: Download,
  phone: PhoneCall,
  ambulance: HeartPulse,
  location: MapPin,
  globe: Globe,
  upload: Upload,
  cpu: Cpu,
  layers: Layers,
  box: Box,
  sliders: Sliders,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  rotate: RotateCw,
  maximize: Maximize2,
  plus: PlusCircle,
  minus: MinusCircle,
  trash: Trash2,
  eye: Eye,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  cloud: Cloud,
  fileText: FileText,
  user: User,
  home: Home,
  scan: Scan,
  refresh: RefreshCw,
  play: Play,
  pause: Pause,
  flash: Flashlight,
  grid: Grid,
} as const;

export type AppIconName = keyof typeof icons;

export function AppIcon({
  name,
  size = 20,
  color,
}: {
  name: AppIconName;
  size?: number;
  color?: string;
}) {
  const theme = useTheme();
  const Icon = icons[name];

  if (!Icon) return null;

  const IconComponent = Icon as any;
  return <IconComponent size={size} color={color || theme.primary} />;
}
