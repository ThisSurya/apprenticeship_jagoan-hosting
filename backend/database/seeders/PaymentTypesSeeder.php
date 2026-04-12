<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\PaymentTypes::insert([
            ['name' => 'Iuran Kebersihan', 'amount' => 15000, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Iuran Keamanan', 'amount' => 100000, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}

