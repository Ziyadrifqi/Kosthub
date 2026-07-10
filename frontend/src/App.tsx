import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { initLenis, destroyLenis } from "@/animations/lenisSetup"
import { PublicLayout } from "@/layouts/PublicLayout"
import Login from "@/pages/public/Login"
import Register from "@/pages/public/Register"

function App() {
  useEffect(() => {
    initLenis()
    return () => destroyLenis()
  }, [])

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<div className="p-10 text-center">Halaman Home (segera)</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  )
}

export default App