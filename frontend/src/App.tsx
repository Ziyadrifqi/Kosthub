import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { initLenis, destroyLenis } from "@/animations/lenisSetup"
import { PublicLayout } from "@/layouts/PublicLayout"
import { ProtectedRoute } from "@/routes/ProtectedRoute"

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

function App() {
  useEffect(() => {
    initLenis()
    return () => destroyLenis()
  }, [])

  return (
    <Routes>
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
    </Routes>
  )
}

export default App