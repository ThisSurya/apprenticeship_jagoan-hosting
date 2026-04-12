<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Houses extends Model
{
    protected $fillable = [
        'house_number',
        'status',
    ];

    public function histories()
    {
        return $this->hasMany(HouseResidentHistories::class, 'house_id');
    }

    public function bills()
    {
        return $this->hasMany(Bills::class, 'house_id');
    }
}
