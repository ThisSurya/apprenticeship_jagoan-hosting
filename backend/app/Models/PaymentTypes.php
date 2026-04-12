<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentTypes extends Model
{
    protected $table = 'payment_types';

    protected $fillable = [
        'name',
        'amount',
    ];

    public function bills()
    {
        return $this->hasMany(Bills::class, 'payment_type_id');
    }
}
