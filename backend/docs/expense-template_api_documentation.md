# API Documentation - Expense Templates

Dokumentasi API untuk mengelola template pengeluaran rutin.

---

### 1. List Templates
Mengambil seluruh daftar template pengeluaran.

- **Route**: `/api/expense-templates`
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
          "title": "Gaji Satpam",
          "amount": 2000000,
          "recurrence": "monthly",
          "description": "Gaji rutin satpam kompleks",
          "is_active": true,
          "created_at": "...",
          "updated_at": "..."
        }
      ]
    }
    ```

---

### 2. Store Template
Menambahkan template pengeluaran baru.

- **Route**: `/api/expense-templates`
- **Method**: `POST`
- **Parameters**: `None`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `title` | string | Yes | Judul pengeluaran |
  | `amount` | numeric | Yes | Nominal pengeluaran |
  | `recurrence` | string | Yes | Frekuensi (`monthly`, `yearly`, `one_time`) |
  | `description` | string | No | Keterangan tambahan |
  | `is_active` | boolean | No | Status aktif template. Default: `true` |

- **Response**:
  - **Success (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Expense template created successfully",
      "data": { ... }
    }
    ```

---

### 3. Show Template
Mengambil detail satu template pengeluaran.

- **Route**: `/api/expense-templates/{id}`
- **Method**: `GET`
- **Parameters**:
  - `id` (path): ID Template.
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": { ... }
    }
    ```

---

### 4. Update Template
Mengubah data template pengeluaran yang sudah ada.

- **Route**: `/api/expense-templates/{id}`
- **Method**: `PUT/PATCH`
- **Parameters**:
  - `id` (path): ID Template.
- **Body (JSON)**: Sama seperti Store (semua field opsional/sometimes).

- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Expense template updated successfully",
      "data": { ... }
    }
    ```

---

### 5. Delete Template
Menghapus template pengeluaran.

- **Route**: `/api/expense-templates/{id}`
- **Method**: `DELETE`
- **Parameters**:
  - `id` (path): ID Template.
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Expense template deleted successfully"
    }
    ```
