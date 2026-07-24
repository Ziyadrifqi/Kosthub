import { useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { api } from "@/lib/api"
import { usePageTitle } from "@/hooks/usePageTitle"

// fix icon default Leaflet yang sering rusak di bundler modern (Vite)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface BuildingWithLocation {
  id: number
  name: string
  latitude?: number
  longitude?: number
  branch?: { id: number; name: string; city: string }
}

function FlyToBuilding({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 1 })
  }, [lat, lng, map])
  return null
}

// perbaikan bug: react-leaflet cuma baca prop `center` sekali waktu mount awal.
// Karena data buildings di-fetch async, saat data itu datang map tidak otomatis
// re-center/refresh, sampai ada event resize/scroll yang maksa Leaflet ngukur ulang.
// Komponen ini nge-sync ulang map (fitBounds + invalidateSize) tiap kali data berubah,
// supaya SEMUA marker (walau lokasinya mencar/beda kota) tetap muat dalam satu layar.
function MapSync({ buildings }: { buildings: BuildingWithLocation[] | undefined }) {
  const map = useMap()

  useEffect(() => {
    map.invalidateSize()

    if (!buildings || buildings.length === 0) return

    if (buildings.length === 1) {
      // cuma 1 titik → gak ada "bounds", langsung center + zoom wajar
      map.setView([buildings[0].latitude!, buildings[0].longitude!], 14)
      return
    }

    // lebih dari 1 titik → hitung bounds dari semua marker, biar semuanya kelihatan
    const bounds = L.latLngBounds(
      buildings.map((b) => [b.latitude!, b.longitude!] as [number, number])
    )
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
  }, [buildings, map])

  useEffect(() => {
    const container = map.getContainer()
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [map])

  return null
}

export default function BranchMap() {
  usePageTitle("Peta Cabang")

  const [searchParams] = useSearchParams()
  const focusBuildingId = searchParams.get("building")

  const { data: buildings } = useQuery({
    queryKey: ["buildings-map"],
    queryFn: async () => {
      const res = await api.get<{ buildings: BuildingWithLocation[] }>("/buildings")
      return res.data.buildings.filter((b) => b.latitude && b.longitude)
    },
  })

  const focusBuilding = buildings?.find((b) => String(b.id) === focusBuildingId)

  // pusat peta default: kamar pertama yang punya koordinat, atau Jakarta kalau belum ada data
  const center: [number, number] = buildings && buildings.length > 0
    ? [buildings[0].latitude!, buildings[0].longitude!]
    : [-6.2, 106.8]

  return (
    <section className="max-w-6xl mx-auto px-6 py-14 bg-paper">
      <span className="font-mono text-xs uppercase tracking-widest text-primary">Lokasi</span>
      <h1 className="font-heading font-medium text-3xl text-ink mt-1 mb-6">Peta Cabang</h1>
      <p className="text-text-secondary mb-8 max-w-xl">
        Lihat lokasi tiap cabang KostHub relatif terhadap kampus atau kantor kamu.
      </p>

      <div className="h-[500px] rounded-md overflow-hidden border border-border">
        <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapSync buildings={buildings} />

          {focusBuilding?.latitude && focusBuilding?.longitude && (
            <FlyToBuilding lat={focusBuilding.latitude} lng={focusBuilding.longitude} />
          )}

          {buildings?.map((b) => (
            <Marker key={b.id} position={[b.latitude!, b.longitude!]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{b.branch?.name}</p>
                  <p className="text-xs text-gray-500">{b.name} · {b.branch?.city}</p>
                  <Link to={`/rooms?branch=${b.branch?.id}`} className="text-primary text-xs underline mt-1 inline-block">
                    Lihat kamar di sini
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {(!buildings || buildings.length === 0) && (
        <p className="text-text-secondary text-sm mt-4">Belum ada lokasi gedung yang diatur.</p>
      )}
    </section>
  )
}