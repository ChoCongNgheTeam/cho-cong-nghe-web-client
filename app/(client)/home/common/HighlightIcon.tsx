import {
   Cpu,
   Monitor,
   HardDrive,
   Camera,
   Sun,
   Package,
   Zap,
   LucideIcon,
   Glasses,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
   "cpu-fill": Cpu,
   gpu: Monitor,
   storage: HardDrive,
   rom_capacity: HardDrive,
   "camera-user": Camera,
   sun: Sun,
   glass: Glasses,
   default: Package,
};

export function HighlightIcon({ icon }: { icon: string }) {
   const Icon = ICON_MAP[icon] ?? ICON_MAP["default"];
   return <Icon className="w-5 h-5 text-neutral-dark-hover" />;
}
