import {
  LayoutDashboard,
  Wallet,
  DoorOpen,
  BarChart3,
  Users,
  FileClock,
  FileText,
  Building2,
  Layers,
} from "lucide-react"

export interface MenuItem {
  label: string
  to: string
  icon: typeof LayoutDashboard
}

export interface RoleTheme {
  accent: string
  accentBg: string
  badge: string
}

export const roleMenus: Record<string, MenuItem[]> = {
  staff: [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Kelola Kamar", to: "/admin/rooms", icon: DoorOpen },
    { label: "Kelola Gedung", to: "/admin/buildings", icon: Building2 },
    { label: "Tipe Kamar", to: "/admin/room-types", icon: Layers },
    { label: "Verifikasi Payment", to: "/admin/payments", icon: Wallet },
    { label: "Kelola Konten", to: "/admin/content", icon: FileText },
  ],
  owner: [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Laporan Revenue", to: "/admin/reports", icon: BarChart3 },
    { label: "Audit Log", to: "/admin/audit", icon: FileClock },
  ],
  super_admin: [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Kelola Kamar", to: "/admin/rooms", icon: DoorOpen },
    { label: "Kelola Gedung", to: "/admin/buildings", icon: Building2 },
    { label: "Tipe Kamar", to: "/admin/room-types", icon: Layers },
    { label: "Verifikasi Payment", to: "/admin/payments", icon: Wallet },
    { label: "Kelola Konten", to: "/admin/content", icon: FileText },
    { label: "Laporan Revenue", to: "/admin/reports", icon: BarChart3 },
    { label: "Kelola User", to: "/admin/users", icon: Users },
  ],
}

export const roleThemes: Record<string, RoleTheme> = {
  staff: { accent: "text-secondary", accentBg: "bg-secondary/10", badge: "Staff Operasional" },
  owner: { accent: "text-text", accentBg: "bg-text/10", badge: "Pemilik Bisnis" },
  super_admin: { accent: "text-primary", accentBg: "bg-primary/10", badge: "Super Admin" },
}