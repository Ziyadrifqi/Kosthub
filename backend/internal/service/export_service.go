package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/Ziyadrifqi/kosthub/backend/internal/repository"
	"github.com/xuri/excelize/v2"
)

var ErrNoDataToExport = errors.New("tidak ada data transaksi untuk rentang/filter yang dipilih")

type ExportService struct {
	paymentRepo *repository.PaymentRepository
}

func NewExportService(paymentRepo *repository.PaymentRepository) *ExportService {
	return &ExportService{paymentRepo: paymentRepo}
}

type ExportTransactionsInput struct {
	Method    string
	BranchID  *uint
	StartDate time.Time
	EndDate   time.Time
}

func (s *ExportService) GenerateTransactionsExcel(input ExportTransactionsInput) (*excelize.File, error) {
	payments, err := s.paymentRepo.FindForExport(repository.ExportFilter{
		Method: input.Method, BranchID: input.BranchID,
		StartDate: input.StartDate, EndDate: input.EndDate,
	})
	if err != nil {
		return nil, err
	}

	if len(payments) == 0 {
		return nil, ErrNoDataToExport
	}

	f := excelize.NewFile()
	sheet := "Transaksi"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{"Tanggal", "Customer", "Email", "Kamar", "Cabang", "Metode", "Jumlah (Rp)"}
	for i, h := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i)
		f.SetCellValue(sheet, cell, h)
	}

	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Color: "FFFFFF"},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"10B981"}, Pattern: 1},
	})
	f.SetCellStyle(sheet, "A1", "G1", headerStyle)

	var total float64
	row := 2
	for _, p := range payments {
		method := "Transfer"
		if p.Method == "cash" {
			method = "Tunai"
		}

		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), p.UpdatedAt.Format("02-01-2006"))
		if p.Booking != nil && p.Booking.User != nil {
			f.SetCellValue(sheet, fmt.Sprintf("B%d", row), p.Booking.User.Name)
			f.SetCellValue(sheet, fmt.Sprintf("C%d", row), p.Booking.User.Email)
		}
		if p.Booking != nil && p.Booking.Room != nil {
			f.SetCellValue(sheet, fmt.Sprintf("D%d", row), p.Booking.Room.RoomNumber)
			if p.Booking.Room.Branch != nil {
				f.SetCellValue(sheet, fmt.Sprintf("E%d", row), p.Booking.Room.Branch.Name)
			}
		}
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), method)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), p.Amount)

		total += p.Amount
		row++
	}

	totalRow := row + 1
	f.SetCellValue(sheet, fmt.Sprintf("F%d", totalRow), "TOTAL")
	f.SetCellValue(sheet, fmt.Sprintf("G%d", totalRow), total)

	totalStyle, _ := f.NewStyle(&excelize.Style{Font: &excelize.Font{Bold: true}})
	f.SetCellStyle(sheet, fmt.Sprintf("F%d", totalRow), fmt.Sprintf("G%d", totalRow), totalStyle)

	f.SetColWidth(sheet, "A", "A", 14)
	f.SetColWidth(sheet, "B", "C", 22)
	f.SetColWidth(sheet, "D", "F", 14)
	f.SetColWidth(sheet, "G", "G", 16)

	return f, nil
}
