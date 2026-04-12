<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expenses extends Model
{
    protected $fillable = [
        'template_id',
        'title',
        'amount',
        'expense_date',
        'description',
    ];

    public function template()
    {
        return $this->belongsTo(ExpenseTemplates::class, 'template_id');
    }
}
