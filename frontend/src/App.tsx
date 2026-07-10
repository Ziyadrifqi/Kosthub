import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { initLenis, destroyLenis } from "@/animations/lenisSetup"
import { PublicLayout } from "@/layouts/PublicLayout"
import Login from "@/pages/public/Login"
import Register from "@/pages/public/Register"
import Home from "@/pages/public/Home"
import RoomList from "@/pages/public/RoomList"
import RoomDetail from "@/pages/public/RoomDetail"

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
      </Route>
    </Routes>
  )
}

export default App