<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Residents;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class ResidentController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $residents = Residents::all();
        return $this->success_response($residents);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'ktp_photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:tetap,kontrak',
            'phone' => 'required|string|max:20|regex:/^[0-9]+$/',
            'is_married' => 'required|boolean',
        ]);

        if ($request->hasFile('ktp_photo')) {
            $path = $request->file('ktp_photo')->store('residents', 'public');
            $validated['ktp_photo'] = Storage::disk('public')->url($path);
        }

        $resident = Residents::create($validated);

        return $this->success_response($resident, 'Resident created successfully', Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $resident = Residents::find($id);

        if (!$resident) {
            return $this->error_response('Resident not found', Response::HTTP_NOT_FOUND);
        }

        return $this->success_response($resident);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $resident = Residents::find($id);

        if (!$resident) {
            return $this->error_response('Resident not found', Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'full_name' => 'sometimes|required|string|max:255',
            'ktp_photo' => 'sometimes|required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'sometimes|required|in:tetap,kontrak',
            'phone' => 'sometimes|required|string|max:20|regex:/^[0-9]+$/',
            'is_married' => 'sometimes|required|boolean',
        ]);

        if ($request->hasFile('ktp_photo')) {
            // Delete old photo if exists
            if ($resident->ktp_photo) {
                // Extract relative path from URL to delete from disk
                $baseUrl = Storage::disk('public')->url('');
                $oldPath = str_replace($baseUrl, '', $resident->ktp_photo);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('ktp_photo')->store('residents', 'public');
            $validated['ktp_photo'] = Storage::disk('public')->url($path);
        }

        $resident->update($validated);

        return $this->success_response($resident, 'Resident updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $resident = Residents::find($id);

        if (!$resident) {
            return $this->error_response('Resident not found', Response::HTTP_NOT_FOUND);
        }

        $resident->delete();

        return $this->success_response(null, 'Resident deleted successfully');
    }
}
