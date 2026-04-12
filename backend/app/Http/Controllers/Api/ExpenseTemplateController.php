<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpenseTemplates;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ExpenseTemplateController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $templates = ExpenseTemplates::all();
        return $this->success_response($templates);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'recurrence' => 'required|in:monthly,yearly,one_time',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $template = ExpenseTemplates::create($validated);

        return $this->success_response($template, 'Expense template created successfully', Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $template = ExpenseTemplates::find($id);

        if (!$template) {
            return $this->error_response('Expense template not found', Response::HTTP_NOT_FOUND);
        }

        return $this->success_response($template);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $template = ExpenseTemplates::find($id);

        if (!$template) {
            return $this->error_response('Expense template not found', Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric|min:0',
            'recurrence' => 'sometimes|required|in:monthly,yearly,one_time',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return $this->success_response($template, 'Expense template updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $template = ExpenseTemplates::find($id);

        if (!$template) {
            return $this->error_response('Expense template not found', Response::HTTP_NOT_FOUND);
        }

        $template->delete();

        return $this->success_response(null, 'Expense template deleted successfully');
    }
}
