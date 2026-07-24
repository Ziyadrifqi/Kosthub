import { useRef, useState } from "react"
import { X, Star, Trash2, UploadCloud, Loader2, AlertTriangle } from "lucide-react"
import { useRoomImages, useUploadRoomImage, useDeleteRoomImage, useSetPrimaryImage } from "@/hooks/useRoomImages"

const apiOrigin = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? ""

export function RoomPhotoModal({ roomId, roomNumber, onClose }: { roomId: number; roomNumber: string; onClose: () => void }) {
  const { data: images, isLoading } = useRoomImages(roomId)
  const uploadImage = useUploadRoomImage()
  const deleteImage = useDeleteRoomImage()
  const setPrimary = useSetPrimaryImage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // id foto yang mau dihapus — dipakai buat munculin dialog konfirmasi custom
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadImage.mutate({ roomId, file })
    e.target.value = "" // reset supaya bisa upload file yang sama lagi kalau perlu
  }

  const handleConfirmDelete = () => {
    if (confirmDeleteId == null) return
    deleteImage.mutate({ roomId, imageId: confirmDeleteId })
    setConfirmDeleteId(null)
  }

  return (
   <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 sm:px-6">
  <div className="bg-card rounded-2xl p-5 sm:p-6 w-full max-w-lg relative max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text">
          <X size={20} />
        </button>
          <h3 className="font-heading font-bold text-lg text-text mb-1 pr-6">Kelola Foto</h3>
        <p className="text-sm text-text-secondary mb-4">Kamar {roomNumber}</p>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadImage.isPending}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-6 text-text-secondary hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-60"
        >
          {uploadImage.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <UploadCloud size={18} />
          )}
          <span className="text-sm font-heading font-medium">
            {uploadImage.isPending ? "Mengunggah..." : "Klik untuk upload foto"}
          </span>
        </button>
        <p className="text-xs text-text-secondary text-center mt-2">
          Rekomendasi: foto landscape, min. 1200×900px, maks. 5MB (JPG/PNG/WebP)
        </p>

        {isLoading && <p className="text-center text-text-secondary text-sm mt-6">Memuat foto...</p>}

      {images && images.length > 0 && (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
            {images.map((img) => (
              <div key={img.id} className="relative rounded-lg overflow-hidden border border-border group">
                <img src={`${apiOrigin}${img.image_url}`} alt="" className="w-full h-32 object-cover" />

                {img.is_primary && (
                  <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-heading font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star size={10} className="fill-white" /> Utama
                  </span>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.is_primary && (
                    <button
                      onClick={() => setPrimary.mutate({ roomId, imageId: img.id })}
                      title="Jadikan foto utama"
                      className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Star size={14} className="text-warning" />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDeleteId(img.id)}
                    title="Hapus foto"
                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Trash2 size={14} className="text-error" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {images && images.length === 0 && !isLoading && (
          <p className="text-center text-text-secondary text-sm mt-6">Belum ada foto untuk kamar ini.</p>
        )}
      </div>

      {/* dialog konfirmasi hapus custom, menggantikan native browser confirm() */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-11 h-11 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <AlertTriangle size={20} className="text-error" />
            </div>
            <h4 className="font-heading font-bold text-base text-text mb-1.5">Hapus foto ini?</h4>
            <p className="text-sm text-text-secondary mb-5">
              Foto yang sudah dihapus tidak bisa dikembalikan lagi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 font-heading font-medium text-sm border border-border text-text rounded-lg py-2.5 hover:bg-section transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteImage.isPending}
                className="flex-1 font-heading font-medium text-sm bg-error text-white rounded-lg py-2.5 hover:bg-error/90 transition-colors disabled:opacity-60"
              >
                {deleteImage.isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}