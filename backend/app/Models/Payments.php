<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payments extends Model
{
    protected $table = 'payments';

    protected $fillable = [
        'resident_id',
        'total_amount',
        'payment_date',
    ];

    public function resident()
    {
        return $this->belongsTo(Residents::class, 'resident_id');
    }

    public function details()
    {
        return $this->hasMany(PaymentDetails::class, 'payment_id');
    }
}
