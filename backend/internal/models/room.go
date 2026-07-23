package models

import "time"

type Room struct {
	ID                     uint        `gorm:"primaryKey" json:"id"`
	BranchID               uint        `json:"branch_id"`
	Branch                 *Branch     `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	BuildingID             uint        `json:"building_id"`
	Building               *Building   `gorm:"foreignKey:BuildingID" json:"building,omitempty"`
	RoomTypeID             uint        `json:"room_type_id"`
	RoomType               *RoomType   `gorm:"foreignKey:RoomTypeID" json:"room_type,omitempty"`
	RoomNumber             string      `gorm:"size:20;not null" json:"room_number"`
	Price                  float64     `gorm:"type:numeric(12,2);not null" json:"price"`
	Status                 string      `gorm:"size:20;default:available" json:"status"` // available, booked, maintenance
	Images                 []RoomImage `gorm:"foreignKey:RoomID" json:"images,omitempty"`
	Facilities             []Facility  `gorm:"many2many:room_facilities;joinForeignKey:RoomID;joinReferences:FacilityID" json:"facilities,omitempty"`
	DiscountType           *string     `json:"discount_type"`
	DiscountValue          *float64    `json:"discount_value"`
	DiscountStartDate      *time.Time  `gorm:"type:date" json:"discount_start_date"`
	DiscountEndDate        *time.Time  `gorm:"type:date" json:"discount_end_date"`
	FinalPrice             float64     `gorm:"-" json:"final_price"`
	IsDiscountActive       bool        `gorm:"-" json:"is_discount_active"`
	DiscountMinMonths      *int        `json:"discount_min_months"`
	HasConditionalDiscount bool        `gorm:"-" json:"has_conditional_discount"`
	DeletedAt              *time.Time  `json:"-"`
	CreatedAt              time.Time   `json:"created_at"`
	UpdatedAt              time.Time   `json:"updated_at"`
}

func (Room) TableName() string { return "rooms" }

type RoomImage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	RoomID    uint      `json:"room_id"`
	ImageURL  string    `gorm:"not null" json:"image_url"`
	IsPrimary bool      `gorm:"default:false" json:"is_primary"`
	CreatedAt time.Time `json:"created_at"`
}

func (RoomImage) TableName() string { return "room_images" }

// CalculateFinalPrice dipakai untuk tampilan listing/detail (belum tahu durasi customer).
// - Diskon TANPA syarat durasi → langsung dihitung, tampil sebagai harga coret.
// - Diskon BERSYARAT durasi → TIDAK dihitung di sini (harga listing tetap normal),
//   cuma ditandai HasConditionalDiscount=true supaya frontend bisa tampilkan badge info,
//   harga aslinya baru dihitung pas customer pilih durasi di form booking (PriceForDuration).
func (r *Room) CalculateFinalPrice() {
	now := time.Now()

	dateActive := r.DiscountType != nil && r.DiscountValue != nil &&
		r.DiscountStartDate != nil && r.DiscountEndDate != nil &&
		!now.Before(*r.DiscountStartDate) && !now.After(r.DiscountEndDate.AddDate(0, 0, 1))

	hasMinMonths := r.DiscountMinMonths != nil && *r.DiscountMinMonths > 0

	r.IsDiscountActive = dateActive && !hasMinMonths
	r.HasConditionalDiscount = dateActive && hasMinMonths

	if r.IsDiscountActive {
		r.FinalPrice = r.calculateDiscountedPrice()
	} else {
		r.FinalPrice = r.Price
	}
}

func (r *Room) calculateDiscountedPrice() float64 {
	switch *r.DiscountType {
	case "percentage":
		return r.Price - (r.Price * (*r.DiscountValue) / 100)
	case "fixed":
		price := r.Price - *r.DiscountValue
		if price < 0 {
			return 0
		}
		return price
	default:
		return r.Price
	}
}

// PriceForDuration dipakai SAAT BOOKING, ketika durasi sudah diketahui —
// ini yang menentukan harga final SEBENARNYA yang dipakai untuk hitung total.
func (r *Room) PriceForDuration(months int) float64 {
	now := time.Now()

	dateActive := r.DiscountType != nil && r.DiscountValue != nil &&
		r.DiscountStartDate != nil && r.DiscountEndDate != nil &&
		!now.Before(*r.DiscountStartDate) && !now.After(r.DiscountEndDate.AddDate(0, 0, 1))

	if !dateActive {
		return r.Price
	}

	// kalau ada syarat minimal bulan, cek durasi memenuhi atau tidak
	if r.DiscountMinMonths != nil && *r.DiscountMinMonths > 0 && months < *r.DiscountMinMonths {
		return r.Price
	}

	return r.calculateDiscountedPrice()
}
