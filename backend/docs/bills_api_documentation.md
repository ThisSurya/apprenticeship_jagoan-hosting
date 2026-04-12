# API Documentation - Bills

Dokumentasi API untuk mengelola tagihan (bills) warga.

---

### 1. Get All Bills
Mengambil semua daftar tagihan yang ada di sistem.

- **Route**: `/api/bills`
- **Method**: `GET`
- **Parameters (Query)**: 
  - `active_only` (boolean, optional): Jika `true`, hanya mengambil tagihan yang belum lunas (status != 'paid').
- **Body**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "bill_id": 1,
          "resident_name": "Jhon Doe",
          "house_number": "A1",
          "payment_type": "Iuran Keamanan",
          "period": "March 2024",
          "amount_due": 100000,
          "total_paid": 50000,
          "status": "partial"
        }
      ]
    }
    ```

---

### 2. Get Bills by House
Mengambil riwayat tagihan khusus untuk satu rumah tertentu.

- **Route**: `/api/bills/house/{houseId}`
- **Method**: `GET`
- **Parameters**:
  - `houseId` (path): ID rumah.
- **Body**: `None`
- **Response**: Sama seperti format Get All Bills.

---

### 3. Get Bills by Resident
Mengambil seluruh daftar tagihan untuk warga tertentu.

- **Route**: `/api/bills/resident/{residentId}`
- **Method**: `GET`
- **Parameters**: 
  - `residentId` (path): ID warga.
  - `active_only` (query): Jika `true`, hanya mengambil yang belum lunas.
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Success",
      "data": [
        {
          "bill_id": 1,
          "resident_name": "...",
          ...
        }
      ]
    }
    ```

---

### 4. Generate Bills (Store)
Menampilkan tagihan baru secara otomatis untuk seluruh warga yang aktif pada periode tertentu.

- **Route**: `/api/bills/generate` (atau `/api/bills` via POST)
- **Method**: `POST`
- **Parameters**: `None`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `period_start` | date | Yes | Awal bulan tagihan (contoh: `2024-03-01`) |

- **Logika Internal**:
  - Sistem akan mencari semua penghuni yang aktif pada bulan tersebut.
  - Sistem akan membuat data tagihan untuk setiap jenis pembayaran (`payment_types`) yang aktif.
  - Tagihan tidak akan dibuat double jika sudah pernah digenerate sebelumnya untuk periode yang sama.

- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Successfully generated 15 bills for March 2024",
      "data": null
    }
    ```

---

### 4. Manual Generate Bill (Store Manual)
Membuat tagihan secara manual untuk seorang warga tertentu dengan durasi beberapa bulan ke depan.

- **Route**: `/api/bills/manual`
- **Method**: `POST`
- **Parameters**: `None`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `resident_id` | integer | Yes | ID Warga |
  | `duration` | integer | Yes | Durasi bulan (1 - 12) |

- **Logika Internal**:
  - Sistem akan mencari rumah yang sedang ditempati warga tersebut.
  - Tagihan dibuat mulai dari bulan ini hingga durasi yang ditentukan.
  - Melewati (skip) tagihan yang sudah ada untuk menghindari duplikat.

- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Successfully generated 6 bills for the next 2 month(s).",
      "data": null
    }
    ```

---

### 5. Show Bill Detail
Mengambil detail lengkap satu tagihan, termasuk riwayat pembayarannya.

- **Route**: `/api/bills/{id}`
- **Method**: `GET`
- **Parameters**:
  - `id` (path): ID tagihan.
- **Body**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Success",
      "data": {
        "id": 1,
        "resident_id": 5,
        ...
      }
    }
    ```
  - **Error (404 Not Found)**:
    ```json
    {
      "success": false,
      "message": "Bill not found"
    }
    ```

---

### 6. Delete Bill
Menghapus tagihan dari sistem. Tagihan hanya dapat dihapus jika statusnya masih `unpaid`.

- **Route**: `/api/bills/{id}`
- **Method**: `DELETE`
- **Parameters**: 
  - `id` (path): ID tagihan.
- **Body**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Bill deleted successfully",
      "data": null
    }
    ```
  - **Error (422 Unprocessable Entity)**:
    - Jika tagihan sudah lunas atau dicicil (status != 'unpaid').
    ```json
    {
      "success": false,
      "message": "Only unpaid bills can be deleted."
    }
    ```
  - **Error (404 Not Found)**: 
    - Jika ID tagihan tidak ditemukan.
