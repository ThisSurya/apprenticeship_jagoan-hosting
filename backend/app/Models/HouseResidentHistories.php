<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HouseResidentHistories extends Model
{
    /** @use HasFactory<\Database\Factories\HouseResidentHistoriesFactory> */
    use HasFactory;

    protected $table = 'house_resident_histories';

    protected $fillable = [
        'house_id',
        'resident_id',
        'start_date',
        'end_date',
    ];

    public function house()
    {
        return $this->belongsTo(houses::class, 'house_id');
    }

    public function resident()
    {
        return $this->belongsTo(residents::class, 'resident_id');
    }
}
