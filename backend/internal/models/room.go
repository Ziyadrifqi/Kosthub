package models

import "time"

type Room struct {
	ID         uint        `gorm:"primaryKey" json:"id"`
	BranchID   uint        `json:"branch_id"`
	Branch     *Branch     `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	BuildingID uint        `json:"building_id"`
	Building   *Building   `gorm:"foreignKey:BuildingID" json:"building,omitempty"`
	RoomTypeID uint        `json:"room_type_id"`
	RoomType   *RoomType   `gorm:"foreignKey:RoomTypeID" json:"room_type,omitempty"`
	RoomNumber string      `gorm:"size:20;not null" json:"room_number"`
	Price      float64     `gorm:"type:numeric(12,2);not null" json:"price"`
	Status     string      `gorm:"size:20;default:available" json:"status"` // available, booked, maintenance
	Images     []RoomImage `gorm:"foreignKey:RoomID" json:"images,omitempty"`
	Facilities []Facility  `gorm:"many2many:room_facilities;joinForeignKey:RoomID;joinReferences:FacilityID" json:"facilities,omitempty"`
	DeletedAt  *time.Time  `json:"-"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
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
