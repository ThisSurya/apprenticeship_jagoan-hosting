# API Documentation - House Resident Histories

Dokumentasi API untuk mengelola riwayat dan status penghuni rumah. Seluruh response menggunakan format standar dari `ApiResponse` trait.

---

### 1. Get All Houses with Active Residents
Mengambil daftar seluruh rumah beserta informasi penghuni yang sedang aktif saat ini.

- **Route**: `/api/house-resident-histories`
- **Method**: `GET`
- **Parameters (Query)**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Success",
      "data": [
        {
          "id": 1,
          "house_number": "A1",
          "status": "dihuni",
          "active_resident": {
            "id": 1,
            "full_name": "Budi Santoso",
            "ktp_photo": "https://...",
            "status": "tetap",
            "phone": "081234567890",
            "is_married": 1,
            "created_at": "...",
            "updated_at": "..."
          },
          "history_id": 1,
          "start_date": "2026-01-01"
        },
        {
          "id": 2,
          "house_number": "A2",
          "status": "tidak_dihuni",
          "active_resident": null,
          "history_id": null,
          "start_date": null
        }
      ]
    }
    ```

---

### 2. Get Histories by House
Mengambil riwayat seluruh penghuni (aktif maupun lama) untuk rumah tertentu.

- **Route**: `/api/house-resident-histories/house/{houseId}`
- **Method**: `GET`
- **Parameters**:
  - `houseId` (path): ID rumah.
  - `is_past` (query): Jika `true`, hanya menampilkan penghuni lama. Default menampilkan semua.
  - `search` (query): Pencarian berberdasarkan nama penghuni.
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Success",
      "data": [
        {
          "id": 1,
          "house_id": 1,
          "resident_id": 1,
          "start_date": "2026-01-01",
          "end_date": null,
          "house": { ... },
          "resident": { ... }
        }
      ]
    }
    ```

---

### 3. Add Resident to House (Store)
Mencatat penghuni baru ke dalam sebuah rumah.

- **Route**: `/api/house-resident-histories`
- **Method**: `POST`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `house_id` | integer | Yes | ID Rumah |
  | `resident_id` | integer | Yes | ID Penghuni |
  | `start_date` | date | Yes | Tanggal mulai huni (YYYY-MM-DD) |
  | `end_date`| date | No | Tanggal selesai huni (opsional) |

- **Logika**: Mengubah status rumah menjadi `dihuni`.
- **Response**:
  - **Success (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Resident added to house successfully",
      "data": { ... }
    }
    ```

---

### 4. End Resident Stay (Remove)
Mengakhiri masa huni seorang penduduk (tandai sebagai penghuni lama).

- **Route**: `/api/house-resident-histories/{id}`
- **Method**: `DELETE`
- **Parameters**:
  - `id` (path): ID riwayat (History ID).
- **Logika**:
  - Mengisi `end_date` dengan tanggal hari ini.
  - Jika tidak ada penghuni aktif lain di rumah tersebut, status rumah berubah menjadi `tidak_dihuni`.
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Resident removed from house (end_date set)",
      "data": null
    }
    ```

---

### 5. Change Resident (Transition)
Mengganti penghuni aktif dengan penghuni baru dalam satu aksi tunggal.

- **Route**: `/api/house-resident-histories/change`
- **Method**: `POST`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `house_id` | integer | Yes | ID Rumah |
  | `new_resident_id` | integer | Yes | ID Penghuni Baru |
  | `start_date` | date | Yes | Tanggal mulai huni baru |

- **Logika**:
  1. Mencari penghuni aktif saat ini di rumah tersebut.
  2. Set `end_date` penghuni lama menjadi hari ini.
  3. Insert riwayat baru untuk penghuni baru.
  4. Operasi dijalankan dalam Database Transaction.
- **Response**:
  - **Success (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Resident changed successfully",
      "data": { ... }
    }
    ```
