package worker

import (
	"log"
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
)

// StartBookingExpiryWorker menjalankan pengecekan booking kedaluwarsa secara berkala
// di background, terpisah dari request HTTP biasa.
func StartBookingExpiryWorker(bookingService *service.BookingService, interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			count, err := bookingService.ExpirePendingBookings()
			if err != nil {
				log.Printf("⚠️  booking expiry worker error: %v", err)
				continue
			}
			if count > 0 {
				log.Printf("🕒 booking expiry worker: %d booking dibatalkan otomatis, kamar dikembalikan ke available", count)
			}
		}
	}()
}

func StartLeaseCompletionWorker(bookingService *service.BookingService, interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			count, err := bookingService.CompleteExpiredLeases()
			if err != nil {
				log.Printf("⚠️  lease completion worker error: %v", err)
				continue
			}
			if count > 0 {
				log.Printf("🏁 lease completion worker: %d booking selesai masa sewa, kamar dikembalikan ke available", count)
			}
		}
	}()
}
