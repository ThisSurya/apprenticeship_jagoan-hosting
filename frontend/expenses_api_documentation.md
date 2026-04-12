# API Documentation - Expenses & Expense Templates

## 1. Expenses

Dokumentasi API untuk mengelola data pengeluaran (expenses).

### 1.1 Get All Expenses
Mengambil semua daftar pengeluaran.

- **Route**: `/api/expenses`
- **Method**: `GET`
- **Parameters**: `None`
- **Body**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "title": "Bayar Listrik",
          "amount": 500000,
          "expense_date": "2024-03-20",
          "description": "Tagihan listrik bulan Maret",
          "created_at": "...",
          "updated_at": "..."
        }
      ]
    }
    ```

### 1.2 Store Expense
Mencatat pengeluaran baru.

- **Route**: `/api/expenses`
- **Method**: `POST`
- **Parameters**: `None`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `title` | string | Yes | Judul pengeluaran |
  | `amount` | numeric | Yes | Jumlah nominal (min: 0) |
  | `expense_date`| date | Yes | Tanggal pengeluaran (YYYY-MM-DD) |
  | `description` | string | No | Deskripsi tambahan |

- **Response**:
  - **Success (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Expense created successfully",
      "data": { ... }
    }
    ```

### 1.3 Show Expense
Melihat detail pengeluaran berdasarkan ID.

- **Route**: `/api/expenses/{id}`
- **Method**: `GET`
- **Parameters**:
  - `id` (path): ID pengeluaran.
- **Body**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": { ... }
    }
    ```

### 1.4 Update Expense
Mengubah data pengeluaran.

- **Route**: `/api/expenses/{id}`
- **Method**: `PUT/PATCH`
- **Parameters**:
  - `id` (path): ID pengeluaran.
- **Body (JSON)**: Sama seperti Store (semua field optional).

### 1.5 Generate Expenses from Templates
Membangun data pengeluaran secara otomatis berdasarkan template yang aktif. Sistem akan melewati proses jika pengeluaran untuk template tersebut sudah ada pada bulan yang sama.

- **Route**: `/api/expenses/generate`
- **Method**: `POST`
- **Parameters**: `None`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `date` | date | No | Bulan target (YYYY-MM-DD). Default: bulan saat ini. |

- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Successfully generated 3 expenses for March 2024",
      "data": {
        "generated_count": 3
      }
    }
    ```

### 1.6 Delete Expense
Menghapus data pengeluaran.

- **Route**: `/api/expenses/{id}`
- **Method**: `DELETE`
- **Parameters**:
  - `id` (path): ID pengeluaran.
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Expense deleted successfully"
    }
    ```

---

## 2. Expense Templates

Dokumentasi API untuk mengelola template pengeluaran rutin.

### 2.1 Get All Templates
Mengambil semua daftar template pengeluaran.

- **Route**: `/api/expense-templates`
- **Method**: `GET`
- **Parameters**: `None`
- **Body**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "title": "Keamanan Gated Community",
          "amount": 200000,
          "recurrence": "monthly",
          "is_active": true,
          "description": "Iuran rutin",
          ...
        }
      ]
    }
    ```

### 2.2 Store Template
Membuat template pengeluaran baru.

- **Route**: `/api/expense-templates`
- **Method**: `POST`
- **Parameters**: `None`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `title` | string | Yes | Judul template |
  | `amount` | numeric | Yes | Nominal |
  | `recurrence` | string | Yes | `monthly`, `yearly`, `one_time` |
  | `description` | string | No | Deskripsi |
  | `is_active` | boolean | No | Status aktif (default: true) |

- **Response**:
  - **Success (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Expense template created successfully",
      "data": { ... }
    }
    ```

### 2.3 Show Template
Detail template berdasarkan ID.

- **Route**: `/api/expense-templates/{id}`
- **Method**: `GET`
- **Parameters**:
  - `id` (path): ID template.

### 2.4 Update Template
Mengupdate template.

- **Route**: `/api/expense-templates/{id}`
- **Method**: `PUT/PATCH`
- **Parameters**:
  - `id` (path): ID template.
- **Body (JSON)**: Sama seperti Store (semua field optional).

### 2.5 Delete Template
Menghapus template.

- **Route**: `/api/expense-templates/{id}`
- **Method**: `DELETE`
- **Parameters**:
  - `id` (path): ID template.
