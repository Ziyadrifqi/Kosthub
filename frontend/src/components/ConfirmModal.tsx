// src/components/ConfirmModal.tsx
import { useEffect } from "react"
import { createPortal } from "react-dom"

interface ConfirmModalProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title = "Konfirmasi",
  message,
  confirmLabel = "Ya",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-heading font-semibold text-lg text-ink mb-2">
          {title}
        </h2>
        <p className="text-sm text-text-secondary mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="font-heading font-medium text-sm border border-border rounded-sm px-4 py-2 hover:bg-section transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="font-heading font-medium text-sm bg-error text-paper rounded-sm px-4 py-2 hover:bg-error/90 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}