import {
  LayoutDashboard,
  Wallet,
  DoorOpen,
  MessageCircle,
  BarChart3,
  Users,
  FileClock,
  FileText,
  Building2,
  Layers,
  UserX,
   CalendarClock,
   UserPlus,
   CalendarCheck,
    Landmark,
    MapPinned,
    CalendarPlus,
    Wallet as WalletIcon,
    MessageSquareQuote,
    Users as UsersIcon,
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
  { label: "Jadwal Check-in", to: "/admin/checkin", icon: CalendarCheck },
  { label: "Kamar Akan Kosong", to: "/admin/ending-soon", icon: CalendarClock },
  { label: "Booking Langsung", to: "/admin/direct-booking", icon: UserPlus },
  { label: "Live Chat", to: "/admin/chat", icon: MessageCircle },
  { label: "Verifikasi Payment", to: "/admin/payments", icon: Wallet },
  { label: "Pembatalan", to: "/admin/cancellations", icon: UserX },
  { label: "Perpanjangan Sewa", to: "/admin/extensions", icon: CalendarPlus },
  { label: "Kelola Data Pengguna", to: "/admin/tenants", icon: UsersIcon },
],
owner: [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Info Rekening", to: "/admin/bank-info", icon: Landmark },
  { label: "Laporan Revenue", to: "/admin/reports", icon: BarChart3 },
  { label: "Riwayat Transaksi", to: "/admin/transactions", icon: WalletIcon },
  { label: "Audit Log", to: "/admin/audit", icon: FileClock },
],
super_admin: [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Kelola Cabang", to: "/admin/branches", icon: MapPinned },
  { label: "Kelola Gedung", to: "/admin/buildings", icon: Building2 },
  { label: "Tipe Kamar", to: "/admin/room-types", icon: Layers },
  { label: "Kelola Konten", to: "/admin/content", icon: FileText },
  { label: "Kelola Testimonial", to: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Kelola User", to: "/admin/users", icon: Users },
],
}

export const roleThemes: Record<string, RoleTheme> = {
  staff: { accent: "text-secondary", accentBg: "bg-secondary/10", badge: "Staff Operasional" },
  owner: { accent: "text-text", accentBg: "bg-text/10", badge: "Pemilik Bisnis" },
  super_admin: { accent: "text-primary", accentBg: "bg-primary/10", badge: "Super Admin" },
}