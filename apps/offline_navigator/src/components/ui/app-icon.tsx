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
  ArrowLeft,
  ArrowRight,
} from "lucide-react-native";

import { useTheme } from "@/hooks/useTheme";

const icons = {
  menu: Menu,
  medical: Stethoscope,
  hospital: Building2,
  floors: Building2,
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
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
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

  return <Icon size={size} color={color || theme.primary} />;
}
