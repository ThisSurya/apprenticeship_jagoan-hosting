# API Documentation - Payment Types

Dokumentasi API untuk mengelola kategori jenis pembayaran (iuran).

---

### 1. List Payment Types
Mengambil seluruh daftar jenis pembayaran yang tersedia.

- **Route**: `/api/payment-types`
- **Method**: `GET`
- **Parameters**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "name": "Iuran Kebersihan",
          "amount": 50000,
          "created_at": "...",
          "updated_at": "..."
        },
        {
          "id": 2,
          "name": "Iuran Keamanan",
          "amount": 100000,
          "created_at": "...",
          "updated_at": "..."
        }
      ]
    }
    ```

---

### 2. Store Payment Type
Menambahkan jenis pembayaran baru.

- **Route**: `/api/payment-types`
- **Method**: `POST`
- **Parameters**: `None`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `name` | string | Yes | Nama jenis pembayaran (e.g. Iuran Kebersihan) |
  | `amount` | numeric | Yes | Nominal standar untuk jenis pembayaran ini |

- **Response**:
  - **Success (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Payment type created successfully",
      "data": { ... }
    }
    ```

---

### 3. Show Payment Type
Mengambil detail satu jenis pembayaran.

- **Route**: `/api/payment-types/{id}`
- **Method**: `GET`
- **Parameters**:
  - `id` (path): ID Jenis Pembayaran.
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": { ... }
    }
    ```

---

### 4. Update Payment Type
Mengubah data jenis pembayaran yang sudah ada.

- **Route**: `/api/payment-types/{id}`
- **Method**: `PUT/PATCH`
- **Parameters**:
  - `id` (path): ID Jenis Pembayaran.
- **Body (JSON)**: Sama seperti Store (semua field opsional/sometimes).

- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Payment type updated successfully",
      "data": { ... }
    }
    ```

---

### 5. Delete Payment Type
Menghapus jenis pembayaran.

- **Route**: `/api/payment-types/{id}`
- **Method**: `DELETE`
- **Parameters**:
  - `id` (path): ID Jenis Pembayaran.
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Payment type deleted successfully"
    }
    ```
