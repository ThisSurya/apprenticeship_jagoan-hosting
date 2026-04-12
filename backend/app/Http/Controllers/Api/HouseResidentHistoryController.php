<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HouseResidentHistories;
use App\Models\Houses;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class HouseResidentHistoryController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of houses with their current active residents.
     */
    public function index(Request $request)
    {
        $houses = Houses::with(['histories' => function ($q) {
            $q->whereNull('end_date')->with('resident');
        }])->get();

        $data = $houses->map(function ($house) {
            $activeHistory = $house->histories->first();
            return [
                'id' => $house->id,
                'house_number' => $house->house_number,
                'status' => $house->status,
                'active_resident' => $activeHistory ? $activeHistory->resident : null,
                'history_id' => $activeHistory ? $activeHistory->id : null,
                'start_date' => $activeHistory ? $activeHistory->start_date : null,
            ];
        });

        return $this->success_response($data);
    }

    /**
     * Display a listing of history for a specific house.
     */
    public function byHouse($houseId, Request $request)
    {
        $query = HouseResidentHistories::where('house_id', $houseId)->with(['house', 'resident']);

        // Filter lampau (past residents)
        if ($request->has('is_past')) {
            if ($request->is_past !== 'true') {
                $query->whereNull('end_date');
            }
        }

        // Search by full_name and status (resident status)
        if ($request->search) {
            $search = $request->search;
            $query->whereHas('resident', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('status', 'like', "%{$search}%");
            });
        }

        $histories = $query->get();

        return $this->success_response($histories);
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'house_id' => 'required|exists:houses,id',
            'resident_id' => 'required|exists:residents,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return $this->error_response('Validation Error', 422, $validator->errors());
        }

        // Requirement: Resident cannot live in 2 houses at the same time
        if ($this->isResidentActive($request->resident_id)) {
            return $this->error_response('Resident is already active in another house', 422);
        }

        $history = HouseResidentHistories::create($request->all());

        // Update house status to 'dihuni'
        Houses::where('id', $request->house_id)->update(['status' => 'dihuni']);

        return $this->success_response($history, 'Resident added to house successfully', 201);
    }

    /**
     * Helper to check if resident is already active in any house.
     */
    private function isResidentActive($residentId)
    {
        return HouseResidentHistories::where('resident_id', $residentId)
            ->whereNull('end_date')
            ->exists();
    }

    /**
     * Soft delete/End resident stay.
     */
    public function destroy(Request $request, $id)
    {
        $history = HouseResidentHistories::find($id);

        if (!$history) {
            return $this->error_response('History not found', 404);
        }

        $request->validate([
            'end_date' => 'nullable|date',
        ]);

        // Set end_date to mark as past resident (default to today if not provided)
        $endDate = $request->end_date ?? now()->toDateString();

        // validate if end_date is before start_date
        if ($endDate < $history->start_date) {
            return $this->error_response('End date cannot be before start date', 422);
        }

        $history->update([
            'end_date' => $endDate
        ]);

        $houseId = $history->house_id;

        // Check if there are other active residents in the same house
        $activeResidentsCount = HouseResidentHistories::where('house_id', $houseId)
            ->whereNull('end_date')
            ->count();

        if ($activeResidentsCount === 0) {
            // Update house status to 'tidak_dihuni' if no one else is living there
            Houses::where('id', $houseId)->update(['status' => 'tidak_dihuni']);
        }

        return $this->success_response(null, 'Resident removed from house (end_date set)');
    }

    /**
     * Change resident in a house (End current stay and Start new stay).
     */
    public function changeResident(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'house_id' => 'required|exists:houses,id',
            'resident_id' => 'required|exists:residents,id',
            'start_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return $this->error_response('Validation Error', 422, $validator->errors());
        }

        // Get current active resident for this house
        $activeHistory = HouseResidentHistories::where('house_id', $request->house_id)
            ->whereNull('end_date')
            ->first();

        // Validation: Cannot change to the same resident currently active
        if ($activeHistory && $activeHistory->resident_id == $request->resident_id) {
            return $this->error_response('Resident is already active in this house', 422);
        }

        // Validation: Resident cannot live in 2 houses at the same time
        if ($this->isResidentActive($request->resident_id)) {
            return $this->error_response('Resident is already active in another house', 422);
        }

        try {
            return DB::transaction(function () use ($request, $activeHistory) {
                // 1. End current active resident stay
                if ($activeHistory) {
                    $activeHistory->update([
                        'end_date' => now()->toDateString() // Mark as finished today
                    ]);
                }

                // 2. Start new resident stay
                $newHistory = HouseResidentHistories::create([
                    'house_id' => $request->house_id,
                    'resident_id' => $request->resident_id,
                    'start_date' => $request->start_date,
                    'end_date' => null
                ]);

                // 3. Ensure house status is 'dihuni'
                Houses::where('id', $request->house_id)->update(['status' => 'dihuni']);

                return $this->success_response($newHistory, 'Resident changed successfully', 201);
            });
        } catch (\Exception $e) {
            return $this->error_response('Failed to change resident: ' . $e->getMessage(), 500);
        }
    }
}
