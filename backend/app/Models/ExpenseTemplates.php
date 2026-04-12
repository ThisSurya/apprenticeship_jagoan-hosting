<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpenseTemplates extends Model
{
    protected $fillable = [
        'title',
        'amount',
        'recurrence',
        'description',
        'is_active',
    ];

    public function expenses()
    {
        return $this->hasMany(Expenses::class, 'template_id');
    }
}
