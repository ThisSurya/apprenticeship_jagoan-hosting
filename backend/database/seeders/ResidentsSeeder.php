<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ResidentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('id_ID');

        for ($i = 0; $i < 15; $i++) {
            \App\Models\Residents::create([
                'full_name' => $faker->name,
                'ktp_photo' => 'ktp_' . ($i + 1) . '.jpg',
                'status' => $faker->randomElement(['tetap', 'kontrak']),
                'phone' => $faker->phoneNumber,
                'is_married' => $faker->boolean,
            ]);
        }
    }
}

