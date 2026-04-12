<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExpensesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Expenses::insert([
            [
                'title' => 'Alat Kebersihan',
                'description' => 'Beli sapu dan pengki',
                'amount' => 50000,
                'expense_date' => '2026-01-10',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Gaji Keamanan',
                'description' => 'Gaji petugas keamanan',
                'amount' => 2000000,
                'expense_date' => '2026-01-31',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}


