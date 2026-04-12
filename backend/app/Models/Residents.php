<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Residents extends Model
{
    protected $table = 'residents';

    protected $fillable = [
        'full_name',
        'ktp_photo',
        'status',
        'phone',
        'is_married',
    ];
    public $timestamps = false;
    public function histories()
    {
        return $this->hasMany(HouseResidentHistories::class, 'resident_id');
    }
    public function payments()
    {
        return $this->hasMany(Payments::class, 'resident_id');
    }
}
