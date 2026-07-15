import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import { queryClient } from "@/lib/queryClient"
import App from "./App"
import "./index.css"
import { SessionGate } from "@/components/SessionGate"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionGate>
          <App />
        </SessionGate>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)