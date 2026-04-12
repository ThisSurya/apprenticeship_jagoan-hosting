<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentTypes;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaymentTypeController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $types = PaymentTypes::all();
        return $this->success_response($types);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
        ]);

        $type = PaymentTypes::create($validated);

        return $this->success_response($type, 'Payment type created successfully', Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $type = PaymentTypes::find($id);

        if (!$type) {
            return $this->error_response('Payment type not found', Response::HTTP_NOT_FOUND);
        }

        return $this->success_response($type);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $type = PaymentTypes::find($id);

        if (!$type) {
            return $this->error_response('Payment type not found', Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric|min:0',
        ]);

        $type->update($validated);

        return $this->success_response($type, 'Payment type updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $type = PaymentTypes::find($id);

        if (!$type) {
            return $this->error_response('Payment type not found', Response::HTTP_NOT_FOUND);
        }

        $type->delete();

        return $this->success_response(null, 'Payment type deleted successfully');
    }
}
