import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ChatWidget } from "@/components/ChatWidget"
import { AnnouncementBar } from "@/components/home/AnnouncementBar"

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <AnnouncementBar />
<Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
