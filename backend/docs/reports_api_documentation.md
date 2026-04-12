# API Documentation - Reports

Dokumentasi API untuk mengambil laporan keuangan (Pemasukan vs Pengeluaran).

---

### 1. Financial Summary
Mengambil ringkasan keuangan bulanan dalam satu tahun tertentu.

- **Route**: `/api/reports/summary`
- **Method**: `GET`
- **Parameters (Query)**:
  - `year` (year, optional): Tahun yang ingin ditampilkan. Default: tahun saat ini.
- **Body**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "year": 2024,
      "total_income": 12000000,
      "total_expenses": 5000000,
      "balance": 7000000,
      "data": [
        {
          "month": "January",
          "year": 2024,
          "pemasukan": 1500000,
          "pengeluaran": 500000,
          "saldo": 1000000
        },
        ...
      ]
    }
    ```

---

### 2. Monthly Detail
Mengambil rincian transaksi pemasukan dan pengeluaran pada bulan dan tahun spesifik.

- **Route**: `/api/reports/detail`
- **Method**: `GET`
- **Parameters (Query)**:
  - `month` (integer, optional): Bulan (1-12). Default: bulan saat ini.
  - `year` (integer, optional): Tahun (YYYY). Default: tahun saat ini.
- **Body**: `None`
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "period": "March 2024",
        "total_income": 1000000,
        "total_expenses": 500000,
        "balance": 500000,
        "pemasukan": [
          {
            "payment_id": 1,
            "resident_name": "Budi Santoso",
            "house_number": "A1",
            "payment_type": "Iuran Kebersihan",
            "amount": 100000,
            "payment_date": "2024-03-05"
          }
        ],
        "pengeluaran": [
          {
            "id": 10,
            "name": "Service Lampu Jalan",
            "amount": 50000,
            "expense_date": "2024-03-10",
            ...
          }
        ]
      }
    }
    ```
