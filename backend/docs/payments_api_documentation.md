# API Documentation - Payments

Dokumentasi API untuk mengelola transaksi pembayaran warga.

---

### 1. Get All Payments
Mengambil seluruh data riwayat pembayaran secara global.

- **Route**: `/api/payments`
- **Method**: `GET`
- **Parameters**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Success",
      "data": [
        {
          "id": 1,
          "resident_id": 5,
          "total_amount": 150000,
          "payment_date": "2024-03-05",
          "resident": { ... },
          "details": [
             {
               "id": 1,
               "bill": { ... }
             }
          ]
        }
      ]
    }
    ```

---

### 2. Get Payment Detail
Mengambil rincian pembayaran untuk satu transaksi spesifik.

- **Route**: `/api/payments/{id}`
- **Method**: `GET`
- **Parameters**:
  - `id` (path): ID Pembayaran.
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Success",
      "data": {
        "id": 1,
        "resident_id": 5,
        "total_amount": 150000,
        "payment_date": "2024-03-05",
        "resident": { ... },
        "details": [
          {
            "id": 1,
            "payment_id": 1,
            "bill_id": 10,
            "amount": 100000,
            "bill": {
               "id": 10,
               "payment_type": { "name": "Iuran Kebersihan", ... }
            }
          }
        ]
      }
    }
    ```

---

### 3. Store Payment
Mencatat transaksi pembayaran baru untuk satu atau beberapa tagihan sekaligus. Status tagihan akan otomatis ter-update menjadi `paid` atau `partial`.

- **Route**: `/api/payments`
- **Method**: `POST`
- **Parameters**: `None`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `resident_id` | integer | Yes | ID Warga yang membayar |
  | `payment_date` | date | Yes | Tanggal pembayaran dilakukan (YYYY-MM-DD) |
  | `details` | array | Yes | Daftar rincian pembayaran untuk tagihan |
  | `details.*.bill_id` | integer | Yes | ID Tagihan yang dibayar |
  | `details.*.amount` | numeric | Yes | Jumlah uang yang dibayarkan untuk tagihan tersebut |

- **Response**:
  - **Success (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Pembayaran berhasil dicatat.",
      "data": { ... }
    }
    ```

---

### 4. Delete Payment
Menghapus transaksi pembayaran. Status tagihan yang terkait akan otomatis dihitung ulang (`recalculated`).

- **Route**: `/api/payments/{id}`
- **Method**: `DELETE`
- **Parameters**:
  - `id` (path): ID Pembayaran.
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Data pembayaran berhasil dihapus."
    }
    ```
