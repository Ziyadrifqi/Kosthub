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

function App() {
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
        <Route path="/rooms" element={<RoomList />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />

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

          <Route element={<RoleRoute allowedRoles={["staff", "super_admin"]} />}>
  <Route path="/admin/payments" element={<AdminPayments />} />
  <Route path="/admin/rooms" element={<StaffRooms />} />
  <Route path="/admin/content" element={<StaffContent />} />
</Route>

<Route element={<RoleRoute allowedRoles={["super_admin"]} />}>
  <Route path="/admin/users" element={<SuperAdminUsers />} />
  <Route path="/admin/buildings" element={<StaffBuildings />} />
  <Route path="/admin/room-types" element={<RoomTypes />} />
</Route>

          <Route element={<RoleRoute allowedRoles={["owner", "super_admin"]} />}>
            <Route path="/admin/reports" element={<OwnerReports />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App