import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ChatWidget } from "@/components/ChatWidget"
import { AnnouncementBar } from "@/components/home/AnnouncementBar"
import { ExtensionTicker } from "@/components/ExtensionTicker"

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <AnnouncementBar />
<Navbar />
<ExtensionTicker />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
