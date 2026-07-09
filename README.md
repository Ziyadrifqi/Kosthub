# 🏠 KostHub

**KostHub** adalah platform manajemen dan pemesanan kost (boarding house) berbasis web, dilengkapi dengan sistem booking, pembayaran, live chat admin, dan AI Assistant untuk membantu calon penyewa mencari kamar yang sesuai.

---

## ✨ Fitur Utama

- 🔐 **Autentikasi** — Register & login dengan JWT
- 🏘️ **Manajemen Kost** — Branch, building, room type, kamar, fasilitas, galeri foto
- 📅 **Booking** — Pemesanan kamar dengan proteksi _race condition_ (`SELECT FOR UPDATE`)
- 💳 **Payment** — MVP: upload bukti transfer manual + verifikasi admin. Upgrade: integrasi Midtrans
- ⭐ **Review & Favorite** — Penyewa bisa memberi rating dan menyimpan kamar favorit
- 💬 **Live Chat Admin** — Chat real-time via WebSocket (khusus user yang sudah login)
- 🤖 **AI Assistant** — Asisten AI yang bisa diakses sebelum maupun sesudah login untuk membantu pencarian kamar
- 🛠️ **Maintenance Ticket** — Pelaporan kerusakan/keluhan kamar
- 🔔 **Notifikasi** — Sistem notifikasi in-app

---

## 🧱 Tech Stack

### Backend

| Teknologi                     | Fungsi                     |
| ----------------------------- | -------------------------- |
| Go                            | Bahasa pemrograman utama   |
| Gin                           | Web framework / router     |
| GORM                          | ORM untuk PostgreSQL       |
| PostgreSQL                    | Database utama             |
| JWT                           | Autentikasi berbasis token |
| Redis                         | Caching & rate limiting    |
| WebSocket (gorilla/websocket) | Real-time chat             |
| Docker                        | Containerization           |

### Frontend

| Teknologi       | Fungsi                     |
| --------------- | -------------------------- |
| React + Vite    | UI framework & build tool  |
| Tailwind CSS v4 | Styling                    |
| TanStack Query  | Data fetching & caching    |
| Zustand         | State management           |
| GSAP            | Animasi scroll & interaksi |
| Framer Motion   | Micro-interaction          |
| Lenis           | Smooth scrolling           |

---

## 📁 Struktur Project

```
kosthub/
├── backend/
│   ├── cmd/api/              # entry point aplikasi
│   ├── internal/
│   │   ├── config/           # load environment variables
│   │   ├── database/         # koneksi Postgres & Redis
│   │   ├── models/           # struct GORM (representasi tabel)
│   │   ├── repository/       # query ke database
│   │   ├── service/          # business logic
│   │   ├── handler/          # HTTP handler (controller)
│   │   ├── middleware/       # auth middleware, dll
│   │   └── router/           # routing API
│   ├── migrations/           # file migration SQL
│   └── .env                  # konfigurasi environment (tidak di-commit)
├── frontend/
│   ├── src/
│   │   ├── pages/            # halaman aplikasi
│   │   ├── components/       # komponen reusable
│   │   ├── store/            # Zustand store
│   │   ├── hooks/            # custom hooks
│   │   ├── lib/              # axios instance, query client
│   │   └── animations/       # setup GSAP, Lenis, Framer Motion
│   └── .env                  # konfigurasi environment frontend
├── docker-compose.yml
└── docs/
```

---

## 🗄️ Skema Database

Entitas utama: `roles`, `users`, `branches`, `buildings`, `room_types`, `rooms`, `room_images`, `facilities`, `room_facilities`, `bookings`, `payments`, `reviews`, `favorites`, `chat_rooms`, `chat_messages`, `maintenance_tickets`, `notifications`, `ai_chat_history`.

### Index penting

```sql
UNIQUE users(email)
INDEX rooms(branch_id, status, price)
INDEX bookings(user_id, status)
INDEX payments(status)
INDEX chat_messages(chat_room_id, created_at)
```

### Prinsip anti-konflik data

- Semua relasi antar tabel menggunakan **foreign key**
- Proses booking dibungkus dalam **database transaction**
- Booking kamar menggunakan **`SELECT ... FOR UPDATE`** untuk mencegah dua user memesan kamar yang sama secara bersamaan
- Semua endpoint list data menerapkan **pagination**
- Penghapusan data menggunakan **soft delete** (`deleted_at`), bukan hapus permanen
- Query yang berpotensi lambat dicek dengan **`EXPLAIN ANALYZE`**

---

## 🚀 Cara Menjalankan (Development)

### Prasyarat

Pastikan sudah terinstall: Go 1.22+, Node.js 20+, Docker Desktop, `golang-migrate`.

### 1. Clone repository

```bash
git clone https://github.com/ZiyadRifqi/kosthub.git
cd kosthub
```

### 2. Jalankan database & Redis

```bash
docker compose up -d postgres redis
```

### 3. Setup backend

```bash
cd backend
cp .env.example .env
# sesuaikan isi .env (DB_HOST, DB_PORT, JWT_SECRET, dll)

go mod tidy
migrate -path migrations -database "postgres://kosthub:kosthub_secret@localhost:5432/kosthub_db?sslmode=disable" up
go run cmd/api/main.go
```

Backend berjalan di `http://localhost:8080`

### 4. Setup frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
APP_PORT=8080
APP_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=kosthub
DB_PASSWORD=kosthub_secret
DB_NAME=kosthub_db
DB_SSLMODE=disable

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=<random string minimal 32 karakter>
JWT_EXPIRE_HOURS=24

MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

---

## 📡 API Endpoint (yang sudah tersedia)

| Method | Endpoint             | Deskripsi                      | Auth            |
| ------ | -------------------- | ------------------------------ | --------------- |
| GET    | `/health`            | Cek status server              | Tidak           |
| POST   | `/api/auth/register` | Registrasi user baru           | Tidak           |
| POST   | `/api/auth/login`    | Login, mengembalikan JWT token | Tidak           |
| GET    | `/api/me`            | Data user yang sedang login    | ✅ Bearer Token |

> Endpoint lain (rooms, bookings, payments, chat, AI assistant) masih dalam pengembangan — lihat [Roadmap](#-roadmap).

---

## 🗺️ Roadmap

| Fase   | Fitur                                                                                           |
| ------ | ----------------------------------------------------------------------------------------------- |
| ✅ MVP | Setup project, koneksi database, Auth (register/login JWT)                                      |
| 🔄 V1  | CRUD rooms & master data, booking dengan transaction, upload bukti transfer, AI Assistant dasar |
| ⏳ V2  | Live chat admin (WebSocket), review & favorite, notifikasi, maintenance ticket                  |
| ⏳ V3  | Integrasi Midtrans, dashboard analytics admin, caching Redis untuk listing kamar                |
| ⏳ V4  | Multi-branch scaling, rekomendasi AI personalisasi                                              |

---

## 🌿 Git Workflow

```
main        → kode stabil / production
develop     → integrasi fitur yang sedang berjalan
feature/*   → satu branch per fitur (contoh: feature/booking-transaction)
```

### Konvensi commit ([Conventional Commits](https://www.conventionalcommits.org/))

```
feat(auth): implement register, login, and JWT middleware
fix(booking): prevent double booking with SELECT FOR UPDATE
chore: setup docker compose for postgres & redis
docs: update README with setup instructions
```

---
