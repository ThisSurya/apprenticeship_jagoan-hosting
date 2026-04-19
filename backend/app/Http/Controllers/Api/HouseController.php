<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HouseResidentHistories;
use App\Models\Houses;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class HouseController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $houses = Houses::with('residents')->get();
        return $this->success_response($houses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'house_number' => 'required|string|unique:houses,house_number',
            'status' => 'required|in:dihuni,tidak_dihuni',
        ]);

        $house = Houses::create($validated);

        return $this->success_response($house, 'House created successfully', Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $house = Houses::find($id);

        if (!$house) {
            return $this->error_response('House not found', Response::HTTP_NOT_FOUND);
        }

        return $this->success_response($house);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $house = Houses::find($id);

        if (!$house) {
            return $this->error_response('House not found', Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'house_number' => 'sometimes|required|string|unique:houses,house_number,' . $id,
            'status' => 'sometimes|required|in:dihuni,tidak_dihuni',
        ]);

        $house->update($validated);

        return $this->success_response($house, 'House updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $house = Houses::find($id);

        if (!$house) {
            return $this->error_response('House not found', Response::HTTP_NOT_FOUND);
        }

        $is_active = HouseResidentHistories::where('house_id', $id)->first();

        if ($is_active) {
            return $this->error_response('House was occupied', Response::HTTP_BAD_REQUEST);
        }

        $house->delete();

        return $this->success_response(null, 'House deleted successfully');
    }
}
