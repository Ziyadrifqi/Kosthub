export interface RoomImage {
  id: number
  image_url: string
  is_primary: boolean
}

export interface Facility {
  id: number
  name: string
  icon: string
}

export interface Room {
  id: number
  branch_id: number
  branch?: { id: number; name: string; city: string }
  building_id: number
  building?: { id: number; name: string }
  room_type_id: number
  room_type?: { id: number; name: string; description: string }
  room_number: string
  price: number
  status: string
  images?: RoomImage[]
  facilities?: Facility[]
  created_at: string
}

export interface RoomListResponse {
  rooms: Room[]
  total: number
  page: number
  limit: number
}