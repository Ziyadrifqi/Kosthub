import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { initLenis, destroyLenis } from "@/animations/lenisSetup"
import { PublicLayout } from "@/layouts/PublicLayout"
import { AdminLayout } from "@/layouts/AdminLayout"
import { ProtectedRoute, AdminRoute, RoleRoute } from "@/routes/ProtectedRoute"

import Login from "@/pages/public/Login"
import Register from "@/pages/public/Register"
import Home from "@/pages/public/Home"
import RoomList from "@/pages/public/RoomList"
import RoomDetail from "@/pages/public/RoomDetail"

import Booking from "@/pages/customer/Booking"
import PaymentUpload from "@/pages/customer/PaymentUpload"
import MyBookings from "@/pages/customer/MyBookings"
import Profile from "@/pages/customer/Profile"
import Favorites from "@/pages/customer/Favorites"

import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminPayments from "@/pages/admin/AdminPayments"
import OwnerReports from "@/pages/admin/OwnerReports"
import SuperAdminUsers from "@/pages/admin/SuperAdminUsers"
import StaffRooms from "@/pages/admin/StaffRooms"
import StaffContent from "@/pages/admin/StaffContent"
import StaffBuildings from "@/pages/admin/StaffBuildings"
import RoomTypes from "@/pages/admin/RoomTypes"
import About from "@/pages/public/About"
import Help from "@/pages/public/Help"
import Contact from "@/pages/public/Contact"
import AdminChat from "@/pages/admin/AdminChat"
import OwnerAuditLog from "@/pages/admin/OwnerAuditLog"
import { useIdleLogout } from "@/hooks/useIdleLogout"
import ForgotPassword from "@/pages/public/ForgotPassword"
import ResetPassword from "@/pages/public/ResetPassword"
import StaffCancellations from "@/pages/admin/StaffCancellations"
import Terms from "@/pages/public/Terms"
import EndingSoon from "@/pages/admin/EndingSoon"
import DirectBooking from "@/pages/admin/DirectBooking"
import CheckInSchedule from "@/pages/admin/CheckInSchedule"
import BankInfo from "@/pages/admin/BankInfo"
import SuperAdminBranches from "@/pages/admin/SuperAdminBranches"
import BranchMap from "@/pages/public/BranchMap"
import StaffExtensions from "@/pages/admin/StaffExtensions"

function App() {
  useIdleLogout()

  useEffect(() => {
    initLenis()
    return () => destroyLenis()
  }, [])

  return (
    <Routes>
      {/* ===== ZONA PUBLIK + CUSTOMER ===== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/rooms" element={<RoomList />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/map" element={<BranchMap />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/booking/:roomId" element={<Booking />} />
          <Route path="/payment/:bookingId" element={<PaymentUpload />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ===== ZONA ADMIN (layout sidebar terpisah) ===== */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />

         <Route element={<RoleRoute allowedRoles={["staff"]} />}>
  <Route path="/admin/payments" element={<AdminPayments />} />
  <Route path="/admin/rooms" element={<StaffRooms />} />
  <Route path="/admin/chat" element={<AdminChat />} />
  <Route path="/admin/cancellations" element={<StaffCancellations />} />
  <Route path="/admin/ending-soon" element={<EndingSoon />} />
<Route path="/admin/direct-booking" element={<DirectBooking />} />
<Route path="/admin/checkin" element={<CheckInSchedule />} />
<Route path="/admin/extensions" element={<StaffExtensions />} />
</Route>

<Route element={<RoleRoute allowedRoles={["super_admin"]} />}>
  <Route path="/admin/users" element={<SuperAdminUsers />} />
  <Route path="/admin/buildings" element={<StaffBuildings />} />
  <Route path="/admin/room-types" element={<RoomTypes />} />
  <Route path="/admin/content" element={<StaffContent />} />
  <Route path="/admin/branches" element={<SuperAdminBranches />} />
</Route>

          <Route element={<RoleRoute allowedRoles={["owner", "super_admin"]} />}>
  <Route path="/admin/reports" element={<OwnerReports />} />
  <Route path="/admin/audit" element={<OwnerAuditLog />} />
  <Route path="/admin/bank-info" element={<BankInfo />} />
</Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App