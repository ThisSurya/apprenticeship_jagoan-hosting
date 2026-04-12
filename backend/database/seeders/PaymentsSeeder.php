<?php

namespace Database\Seeders;

use App\Models\Bills;
use App\Models\PaymentDetails;
use App\Models\Payments;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PaymentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Buat Bills Dummy
        // Bill 1: Budi (Resident 1) di Rumah 1 - Kebersihan Jan 2026 (15000)
        $bill1 = Bills::create([
            'resident_id' => 1,
            'house_id' => 1,
            'payment_type_id' => 1, // Kebersihan
            'period_start' => '2026-01-01',
            'period_end' => '2026-01-31',
            'amount' => 15000,
            'status' => 'paid',
        ]);

        // Bill 2: Budi (Resident 1) di Rumah 1 - Kebersihan Feb 2026 (15000)
        $bill2 = Bills::create([
            'resident_id' => 1,
            'house_id' => 1,
            'payment_type_id' => 1, // Kebersihan
            'period_start' => '2026-02-01',
            'period_end' => '2026-02-28',
            'amount' => 15000,
            'status' => 'unpaid', // Sengaja belum dibayar buat di-test
        ]);

        // Bill 3: Siti (Resident 2) di Rumah 3 - Keamanan Feb 2026 (100000)
        $bill3 = Bills::create([
            'resident_id' => 2,
            'house_id' => 3,
            'payment_type_id' => 2, // Keamanan (Asumsi 100k)
            'period_start' => '2026-02-01',
            'period_end' => '2026-02-28',
            'amount' => 100000,
            'status' => 'partial',
        ]);

        // 2. Buat Transaksi Payments & PaymentDetails
        // Payment 1: Budi bayar Bill 1 full lunas
        $payment1 = Payments::create([
            'resident_id' => 1,
            'total_amount' => 15000,
            'payment_date' => '2026-01-05',
        ]);
        PaymentDetails::create([
            'payment_id' => $payment1->id,
            'bill_id' => $bill1->id,
            'amount' => 15000,
        ]);

        // Payment 2: Siti nyicil Bill 3 (Bayar 50.000 dari 100.000)
        $payment2 = Payments::create([
            'resident_id' => 2,
            'total_amount' => 50000,
            'payment_date' => '2026-02-20',
        ]);
        PaymentDetails::create([
            'payment_id' => $payment2->id,
            'bill_id' => $bill3->id,
            'amount' => 50000,
        ]);
    }
}
