package service

import "gorm.io/gorm"

type ReportService struct {
	db *gorm.DB
}

func NewReportService(db *gorm.DB) *ReportService {
	return &ReportService{db: db}
}

type ReportSummary struct {
	TotalRevenue      float64 `json:"total_revenue"`
	TotalBookings     int64   `json:"total_bookings"`
	ConfirmedBookings int64   `json:"confirmed_bookings"`
	PendingPayments   int64   `json:"pending_payments"`
	TotalRooms        int64   `json:"total_rooms"`
	OccupiedRooms     int64   `json:"occupied_rooms"`
}

func (s *ReportService) GetSummary() (*ReportSummary, error) {
	var summary ReportSummary

	s.db.Table("payments").Where("status = ?", "verified").
		Select("COALESCE(SUM(amount), 0)").Scan(&summary.TotalRevenue)

	s.db.Table("bookings").Count(&summary.TotalBookings)
	s.db.Table("bookings").Where("status = ?", "confirmed").Count(&summary.ConfirmedBookings)
	s.db.Table("payments").Where("status = ?", "waiting_verification").Count(&summary.PendingPayments)
	s.db.Table("rooms").Count(&summary.TotalRooms)
	s.db.Table("rooms").Where("status = ?", "booked").Count(&summary.OccupiedRooms)

	return &summary, nil
}
