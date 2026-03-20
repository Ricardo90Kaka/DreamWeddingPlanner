import type { VendorChecklistItem, VendorKey } from "@/lib/types";

export const vendorKeys = [
  "trouwlocatie",
  "fotograaf",
  "videograaf",
  "juwelier",
  "ceremoniemeester",
  "babs",
  "trouwjurk",
  "trouwpak",
  "taart",
  "decoratie",
  "vervoer",
  "dj",
  "zanger",
] as const satisfies readonly VendorKey[];

export const vendorDefinitions: Array<Omit<VendorChecklistItem, "checked">> = [
  { key: "trouwlocatie", label: "Trouwlocatie", iconName: "Landmark", accent: "default" },
  { key: "fotograaf", label: "Fotograaf", iconName: "Camera", accent: "default" },
  { key: "videograaf", label: "Videograaf", iconName: "Clapperboard", accent: "default" },
  { key: "juwelier", label: "Juwelier", iconName: "Gem", accent: "default" },
  {
    key: "ceremoniemeester",
    label: "Ceremoniemeester",
    iconName: "ClipboardList",
    accent: "default",
  },
  { key: "babs", label: "BABS", iconName: "ScrollText", accent: "default" },
  { key: "trouwjurk", label: "Trouwjurk", iconName: "Shirt", accent: "rose" },
  { key: "trouwpak", label: "Trouwpak", iconName: "Shirt", accent: "blue" },
  { key: "taart", label: "Taart", iconName: "Cake", accent: "default" },
  { key: "decoratie", label: "Decoratie", iconName: "Flower2", accent: "default" },
  { key: "vervoer", label: "Vervoer", iconName: "CarFront", accent: "default" },
  { key: "dj", label: "DJ", iconName: "Headphones", accent: "default" },
  { key: "zanger", label: "Zanger", iconName: "MicVocal", accent: "default" },
];
