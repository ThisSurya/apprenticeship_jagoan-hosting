# documentation for Residents API

This documentation details the API endpoints related to **Residents**. All routes are protected by Sanctum authentication and require an `Authorization: Bearer <token>` header.

## Base URL
`/api/residents`

---

## 1. List All Residents

Retrieve a list of all registered residents.

- **Route:** `/api/residents`
- **Method:** `GET`
- **Parameters:** None
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "full_name": "John Doe",
          "ktp_photo": "http://localhost/storage/residents/abcdef.jpg",
          "status": "tetap",
          "phone": "08123456789",
          "is_married": true
        }
      ]
    }
    ```

---

## 2. Create New Resident

Register a new resident in the system with an uploaded KTP photo.

- **Route:** `/api/residents`
- **Method:** `POST`
- **Body (multipart/form-data):**
  | Key | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `full_name` | String | Yes | Full name of the resident. |
  | `ktp_photo` | File (Image) | Yes | Image of KTP (max 2MB). |
  | `status` | Enum | Yes | `tetap` or `kontrak`. |
  | `phone` | String | Yes | Contact number. |
  | `is_married` | Boolean/Int | Yes | `1` for married, `0` for single. |
- **Response:**
  - **Status:** `201 Created`
  - **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Resident created successfully",
      "data": {
        "id": 2,
        "full_name": "Jane Smith",
        "ktp_photo": "http://localhost/storage/residents/xyz123.jpg",
        "status": "kontrak",
        "phone": "08987654321",
        "is_married": 0
      }
    }
    ```

---

## 3. Show Resident Details

Get detailed information about a specific resident by ID.

- **Route:** `/api/residents/{id}`
- **Method:** `GET`
- **Parameters:**
  - `id` (path): The unique ID of the resident.
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "full_name": "John Doe",
        "ktp_photo": "http://localhost/storage/residents/abcdef.jpg",
        "status": "tetap",
        "phone": "08123456789",
        "is_married": true
      }
    }
    ```
  - **Error (404 Not Found):**
    ```json
    {
      "success": false,
      "message": "Resident not found"
    }
    ```

---

## 4. Update Resident

Update existing resident information.

- **Route:** `/api/residents/{id}`
- **Method:** `POST` (with `_method=PUT` if uploading file) or `PUT`
- **Parameters:**
  - `id` (path): The unique ID of the resident.
- **Body (multipart/form-data / JSON):**
  | Key | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `full_name` | String | Optional | Updated full name. |
  | `ktp_photo` | File (Image)| Optional | Updated KTP image. |
  | `status` | Enum | Optional | `tetap` or `kontrak`. |
  | `phone` | String | Optional | Updated contact number. |
  | `is_married` | Boolean/Int | Optional | Updated marriage status. |

  > [!NOTE]
  > Since this route may handle file uploads, use `POST` with a hidden field `_method=PUT` to mimic a `PUT` request in PHP/Laravel multipart forms.

- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Resident updated successfully",
      "data": {
        "id": 1,
        "full_name": "John Doe Updated",
        "ktp_photo": "http://localhost/storage/residents/new_photo.jpg",
        "status": "tetap",
        "phone": "08123456789",
        "is_married": true
      }
    }
    ```

---

## 5. Delete Resident

Remove a resident from the system.

- **Route:** `/api/residents/{id}`
- **Method:** `DELETE`
- **Parameters:**
  - `id` (path): The unique ID of the resident.
- **Response:**
  - **Status:** `200 OK`
  - **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Resident deleted successfully"
    }
    ```
