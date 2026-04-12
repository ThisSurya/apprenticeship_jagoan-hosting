<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bills extends Model
{
    protected $fillable = [
        'resident_id',
        'house_id',
        'payment_type_id',
        'period_start',
        'period_end',
        'amount',
        'status',
    ];

    public function resident()
    {
        return $this->belongsTo(Residents::class, 'resident_id');
    }

    public function house()
    {
        return $this->belongsTo(Houses::class, 'house_id');
    }

    public function paymentType()
    {
        return $this->belongsTo(PaymentTypes::class, 'payment_type_id');
    }

    public function paymentDetails()
    {
        return $this->hasMany(PaymentDetails::class, 'bill_id');
    }
}
