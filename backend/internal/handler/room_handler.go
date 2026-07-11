package handler

import (
	"net/http"
	"strconv"

	"github.com/Ziyadrifqi/kosthub/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type RoomHandler struct {
	roomService *service.RoomService
}

func NewRoomHandler(roomService *service.RoomService) *RoomHandler {
	return &RoomHandler{roomService: roomService}
}

// GET /api/rooms?branch_id=&status=&min_price=&max_price=&page=&limit=
func (h *RoomHandler) ListRooms(c *gin.Context) {
	branchID, _ := strconv.Atoi(c.Query("branch_id"))
	minPrice, _ := strconv.ParseFloat(c.Query("min_price"), 64)
	maxPrice, _ := strconv.ParseFloat(c.Query("max_price"), 64)
	page, _ := strconv.Atoi(c.Query("page"))
	limit, _ := strconv.Atoi(c.Query("limit"))

	result, err := h.roomService.ListRooms(service.ListRoomsInput{
		BranchID: uint(branchID),
		Status:   c.Query("status"),
		MinPrice: minPrice,
		MaxPrice: maxPrice,
		Search:   c.Query("search"),
		Page:     page,
		Limit:    limit,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch rooms"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GET /api/rooms/:id
func (h *RoomHandler) GetRoom(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid room id"})
		return
	}

	room, err := h.roomService.GetRoomByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
		return
	}

	c.JSON(http.StatusOK, room)
}

type createRoomRequest struct {
	BranchID   uint    `json:"branch_id" binding:"required"`
	BuildingID uint    `json:"building_id" binding:"required"`
	RoomTypeID uint    `json:"room_type_id" binding:"required"`
	RoomNumber string  `json:"room_number" binding:"required"`
	Price      float64 `json:"price" binding:"required,gt=0"`
}

// POST /api/rooms (protected, nanti ditambah cek role admin)
func (h *RoomHandler) CreateRoom(c *gin.Context) {
	var req createRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := c.MustGet("role").(string)

	// staff (bukan super_admin) cuma boleh bikin kamar di cabangnya sendiri
	if role == "staff" {
		userBranchID := c.MustGet("branch_id")
		if userBranchID == nil || uint(userBranchID.(float64)) != req.BranchID {
			c.JSON(http.StatusForbidden, gin.H{"error": "kamu hanya bisa mengelola kamar di cabangmu sendiri"})
			return
		}
	}

	room, err := h.roomService.CreateRoom(service.CreateRoomInput{
		BranchID:   req.BranchID,
		BuildingID: req.BuildingID,
		RoomTypeID: req.RoomTypeID,
		RoomNumber: req.RoomNumber,
		Price:      req.Price,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create room"})
		return
	}

	c.JSON(http.StatusCreated, room)
}
