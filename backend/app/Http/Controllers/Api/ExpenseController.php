<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expenses;
use App\Models\ExpenseTemplates;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ExpenseController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $expenses = Expenses::with('template')->get();
        return $this->success_response($expenses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'template_id' => 'nullable|exists:expense_templates,id',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $expense = Expenses::create($validated);

        return $this->success_response($expense, 'Expense created successfully', Response::HTTP_CREATED);
    }

    /**
     * Generate expenses automatically from templates.
     */
    public function generate(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date',
        ]);

        $targetDate = $request->date ? Carbon::parse($request->date) : Carbon::now();
        $startOfMonth = $targetDate->copy()->startOfMonth();
        $endOfMonth = $targetDate->copy()->endOfMonth();

        $templates = ExpenseTemplates::where('is_active', true)->get();
        $generatedCount = 0;

        foreach ($templates as $template) {
            // Check if expense already exists for this template in this month
            $exists = Expenses::where('template_id', $template->id)
                ->whereBetween('expense_date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
                ->exists();

            if (!$exists) {
                Expenses::create([
                    'template_id' => $template->id,
                    'title' => $template->title,
                    'amount' => $template->amount,
                    'expense_date' => $startOfMonth->toDateString(), // Default to 1st of month
                    'description' => $template->description,
                ]);
                $generatedCount++;
            }
        }

        return $this->success_response(
            ['generated_count' => $generatedCount],
            "Successfully generated {$generatedCount} expenses for " . $targetDate->format('F Y')
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $expense = Expenses::with('template')->find($id);

        if (!$expense) {
            return $this->error_response('Expense not found', Response::HTTP_NOT_FOUND);
        }

        return $this->success_response($expense);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $expense = Expenses::find($id);

        if (!$expense) {
            return $this->error_response('Expense not found', Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'template_id' => 'nullable|exists:expense_templates,id',
            'title' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric|min:0',
            'expense_date' => 'sometimes|required|date',
            'description' => 'nullable|string',
        ]);

        $expense->update($validated);

        return $this->success_response($expense, 'Expense updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $expense = Expenses::find($id);

        if (!$expense) {
            return $this->error_response('Expense not found', Response::HTTP_NOT_FOUND);
        }

        $expense->delete();

        return $this->success_response(null, 'Expense deleted successfully');
    }
}
