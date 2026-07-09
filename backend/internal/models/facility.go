package models

type Facility struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"size:100;not null" json:"name"`
	Icon string `gorm:"size:100" json:"icon"`
}

func (Facility) TableName() string { return "facilities" }
