# API Documentation

## Houses

Dokumentasi API untuk mengelola data rumah.

---

### 1. Get All Houses
Mengambil semua data rumah yang terdaftar.

- **Route**: `/api/houses`
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
          "house_number": "A1",
          "status": "dihuni",
          "created_at": "2024-03-20T00:00:00.000000Z",
          "updated_at": "2024-03-20T00:00:00.000000Z"
        }
      ]
    }
    ```

---

### 2. Store House
Menambahkan data rumah baru.

- **Route**: `/api/houses`
- **Method**: `POST`
- **Parameters**: `None`
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `house_number` | string | Yes | Nomor rumah (harus unik) |
  | `status` | string | Yes | Status rumah (`dihuni` atau `tidak_dihuni`) |

- **Response**:
  - **Success (201 Created)**:
    ```json
    {
      "success": true,
      "message": "House created successfully",
      "data": {
        "id": 2,
        "house_number": "A2",
        "status": "tidak_dihuni",
        "updated_at": "...",
        "created_at": "..."
      }
    }
    ```
  - **Error (422 Unprocessable Content)**:
    ```json
    {
      "message": "The house number has already been taken.",
      "errors": {
        "house_number": ["The house number has already been taken."]
      }
    }
    ```

---

### 3. Show House
Mengambil detail satu data rumah berdasarkan ID.

- **Route**: `/api/houses/{id}`
- **Method**: `GET`
- **Parameters**:
  - `id` (path parameter): ID dari rumah yang ingin dilihat.
- **Body**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "house_number": "A1",
        "status": "dihuni",
        "created_at": "...",
        "updated_at": "..."
      }
    }
    ```
  - **Error (404 Not Found)**:
    ```json
    {
      "success": false,
      "message": "House not found"
    }
    ```

---

### 4. Update House
Mengupdate data rumah yang sudah ada.

- **Route**: `/api/houses/{id}`
- **Method**: `PUT` / `PATCH`
- **Parameters**:
  - `id` (path parameter): ID dari rumah yang ingin diupdate.
- **Body (JSON)**:
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `house_number` | string | Optional | Nomor rumah baru |
  | `status` | string | Optional | Status rumah (`dihuni` atau `tidak_dihuni`) |

- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "House updated successfully",
      "data": {
        "id": 1,
        "house_number": "A1-Edit",
        "status": "tidak_dihuni",
        "updated_at": "...",
        "created_at": "..."
      }
    }
    ```
  - **Error (404 Not Found)**:
    ```json
    {
      "success": false,
      "message": "House not found"
    }
    ```

---

### 5. Delete House
Menghapus data rumah.

- **Route**: `/api/houses/{id}`
- **Method**: `DELETE`
- **Parameters**:
  - `id` (path parameter): ID dari rumah yang ingin dihapus.
- **Body**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "message": "House deleted successfully"
    }
    ```
  - **Error (404 Not Found)**:
    ```json
    {
      "success": false,
      "message": "House not found"
    }
    ```
