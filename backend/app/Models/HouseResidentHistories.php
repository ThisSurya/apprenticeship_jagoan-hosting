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
        return $this->belongsTo(Houses::class, 'house_id');
    }

    public function resident()
    {
        return $this->belongsTo(Residents::class, 'resident_id');
    }

    /**
     * Scope a query to only include active residents.
     * Active is defined as end_date is null or end_date > now().
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('end_date')
              ->orWhere('end_date', '>', now()->toDateString());
        });
    }
}
