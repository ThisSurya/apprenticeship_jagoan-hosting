<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HousesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 1; $i <= 10; $i++) {
            \App\Models\Houses::create(['house_number' => 'A' . $i, 'status' => 'tidak_dihuni']);
        }
        for ($i = 1; $i <= 10; $i++) {
            \App\Models\Houses::create(['house_number' => 'B' . $i, 'status' => 'tidak_dihuni']);
        }
    }
}

