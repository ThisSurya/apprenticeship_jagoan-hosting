<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentDetails extends Model
{
    protected $fillable = [
        'payment_id',
        'bill_id',
        'amount',
    ];

    public function payment()
    {
        return $this->belongsTo(Payments::class, 'payment_id');
    }

    public function bill()
    {
        return $this->belongsTo(Bills::class, 'bill_id');
    }
}
