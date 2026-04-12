<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HouseResidentHistoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('id_ID');

        // Assign first 15 residents to first 15 houses
        for ($i = 1; $i <= 15; $i++) {
            \App\Models\HouseResidentHistories::create([
                'house_id' => $i,
                'resident_id' => $i,
                'start_date' => $faker->date('Y-m-d', 'now'),
            ]);

            // Update house status to 'dihuni'
            \App\Models\Houses::find($i)->update(['status' => 'dihuni']);
        }
    }
}

