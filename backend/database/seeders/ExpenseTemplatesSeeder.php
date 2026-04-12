<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExpenseTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\ExpenseTemplates::insert([
            [
                'title' => 'Gaji Satpam',
                'amount' => 2000000,
                'recurrence' => 'monthly',
                'description' => 'Gaji rutin petugas keamanan komplek',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Gaji Petugas Kebersihan',
                'amount' => 1500000,
                'recurrence' => 'monthly',
                'description' => 'Gaji rutin petugas kebersihan komplek',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Perawatan Taman Tahunan',
                'amount' => 5000000,
                'recurrence' => 'yearly',
                'description' => 'Biaya peremajaan tanaman komplek setahun sekali',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Fogging Nyamuk',
                'amount' => 1000000,
                'recurrence' => 'one_time',
                'description' => 'Biaya fogging darurat',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
