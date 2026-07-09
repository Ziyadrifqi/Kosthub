package repository

import "gorm.io/gorm/clause"

// clauseForUpdate menghasilkan clause SQL "FOR UPDATE" untuk row-level locking
func clauseForUpdate() clause.Locking {
	return clause.Locking{Strength: "UPDATE"}
}
