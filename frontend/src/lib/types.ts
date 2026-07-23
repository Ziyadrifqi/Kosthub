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
   is_favorited?: boolean
 discount_type?: "percentage" | "fixed"
  discount_value?: number
  discount_start_date?: string
  discount_end_date?: string
  final_price: number
  is_discount_active: boolean
discount_min_months?: number
  has_conditional_discount: boolean
}

export interface RoomListResponse {
  rooms: Room[]
  total: number
  page: number
  limit: number
}

export interface Booking {
  id: string
  user_id: string
  room_id: number
  room?: Room
  check_in: string
  duration_months: number
  total_price: number
  status: string // pending, confirmed, cancelled, completed
  expires_at?: string
  created_at: string
}

export interface Payment {
  id: string
  booking_id: string
  method: string
  proof_url?: string
  amount: number
  status: string
  created_at: string
}