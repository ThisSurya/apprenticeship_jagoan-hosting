# API Documentation - House Resident Histories

Dokumentasi API untuk mengelola riwayat penghuni rumah.

---

### 1. Get All Histories
Mengambil semua riwayat penghuni rumah.

- **Route**: `/api/house-resident-histories`
- **Method**: `GET`
- **Parameters (Query)**:
  | Parameter | Type | Required | Description |
  |-----------|------|----------|-------------|
  | `is_past` | string | No | Filter data penghuni lama. Gunakan `true` untuk penghuni lama (sudah keluar), `false` untuk penghuni aktif. |
  | `search` | string | No | Pencarian berdasarkan nama lengkap (`full_name`) atau status penghuni (`status`). |

- **Body**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "house_id": 1,
          "resident_id": 5,
          "start_date": "2024-01-01",
          "end_date": null,
          "house": { "id": 1, "house_number": "A1", ... },
          "resident": { "id": 5, "full_name": "Jhon Doe", ... }
        }
      ]
    }
    ```

---

### 2. Get Histories by House
Mengambil riwayat penghuni untuk rumah tertentu.

- **Route**: `/api/house-resident-histories/house/{houseId}`
- **Method**: `GET`
- **Parameters**:
  - `houseId` (path): ID rumah.
  - `is_past` (query): Filter penghuni lama (`true`/`false`).
  - `search` (query): Pencarian pada data penghuni.

- **Response**: Mirip dengan Get All Histories, namun hanya untuk satu rumah.

---

### 3. Store History (Add Resident to House)
Menambahkan penghuni ke dalam rumah.

- **Route**: `/api/house-resident-histories`
- **Method**: `POST`
- **Parameters**: `None`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `house_id` | integer | Yes | ID rumah yang ada di database |
  | `resident_id` | integer | Yes | ID penghuni yang ada di database |
  | `start_date` | date | Yes | Tanggal mulai menghuni (YYYY-MM-DD) |
  | `end_date` | date | No | Tanggal selesai menghuni (YYYY-MM-DD) |

- **Side Effect**: Status rumah akan otomatis berubah menjadi `dihuni`.
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

### 4. End Resident Stay (Remove Resident)
Mengakhiri masa huni seorang penghuni di sebuah rumah.

- **Route**: `/api/house-resident-histories/{id}`
- **Method**: `DELETE`
- **Parameters**:
  - `id` (path): ID riwayat (bukan ID penghuni).
- **Body**: `None`
- **Description**: Endpoint ini tidak benar-benar menghapus data dari database, melainkan mengisi kolom `end_date` dengan tanggal saat ini (soft remove).
- **Side Effect**: Jika setelah penghapusan ini tidak ada penghuni aktif lain di rumah tersebut, status rumah akan berubah menjadi `tidak_dihuni`.
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Resident removed from house (end_date set)"
    }
    ```

---

### 5. Change Resident
Mengganti penghuni di sebuah rumah dalam satu aksi. Secara otomatis mengakhiri masa huni penghuni aktif saat ini dan memulai masa huni penghuni baru.

- **Route**: `/api/house-resident-histories/change`
- **Method**: `POST`
- **Parameters**: `None`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `house_id` | integer | Yes | ID rumah |
  | `new_resident_id` | integer | Yes | ID penghuni baru |
  | `start_date` | date | Yes | Tanggal mulai menghuni penghuni baru (YYYY-MM-DD) |

- **Logika**:
  1. Mencari data riwayat aktif (di mana `end_date` is null) untuk rumah tersebut.
  2. Jika ada, set `end_date` menjadi hari ini.
  3. Membuat baris riwayat baru untuk `new_resident_id`.
  4. Memastikan status rumah adalah `dihuni`.

- **Response**:
  - **Success (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Resident changed successfully",
      "data": { ... }
    }
    ```
