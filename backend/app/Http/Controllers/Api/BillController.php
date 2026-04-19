<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bills;
use App\Models\HouseResidentHistories;
use App\Models\PaymentTypes;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of all bills.
     */
    public function index(Request $request)
    {
        $query = Bills::with(['resident', 'house', 'paymentType', 'paymentDetails']);

        // Filter for active bills (not paid)
        if ($request->has('active_only') && $request->active_only === 'true') {
            $query->where('status', '!=', 'paid');
        }

        $bills = $query->get();

        return $this->success_response($this->formatBills($bills));
    }

    /**
     * Get billing history by house_id.
     */
    public function byHouse($houseId)
    {
        $bills = Bills::where('house_id', $houseId)
            ->with(['resident', 'house', 'paymentType', 'paymentDetails'])
            ->get();

        return $this->success_response($this->formatBills($bills));
    }

    /**
     * Get billing history by resident_id.
     */
    public function byResident($residentId, Request $request)
    {
        $query = Bills::where('resident_id', $residentId)
            ->with(['resident', 'house', 'paymentType', 'paymentDetails']);

        if ($request->has('active_only') && $request->active_only === 'true') {
            $query->where('status', '!=', 'paid');
        }

        $bills = $query->get();

        return $this->success_response($this->formatBills($bills));
    }

    /**
     * Helper to format bill records.
     */
    private function formatBills($bills)
    {
        return $bills->map(function ($bill) {
            $totalPaid = $bill->paymentDetails->sum('amount');
            return [
                'bill_id' => $bill->id,
                'resident_id' => $bill->resident_id,
                'resident_name' => $bill->resident->full_name ?? 'N/A',
                'house_number' => $bill->house->house_number ?? 'N/A',
                'payment_type' => $bill->paymentType->name ?? 'N/A',
                'period' => \Carbon\Carbon::parse($bill->period_start)->format('F Y'),
                'amount_due' => $bill->amount,
                'total_paid' => $totalPaid,
                'status' => $bill->status,
            ];
        });
    }

    /**
     * Generate bills automatically for all active residents.
     */
    public function store(Request $request)
    {
        $request->validate([
            'period_start' => 'required|date',
        ]);

        $periodStart = Carbon::parse($request->period_start)->startOfMonth();
        $periodEnd = $periodStart->copy()->endOfMonth();

        // Get all active resident histories for this period
        $activeHistories = HouseResidentHistories::where('start_date', '<=', $periodEnd)
            ->where(function ($query) use ($periodStart) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', $periodStart);
            })
            ->get();

        $paymentTypes = PaymentTypes::all();
        $generatedCount = 0;

        foreach ($activeHistories as $history) {
            foreach ($paymentTypes as $type) {
                // Check if bill already exists
                $existingBill = Bills::where('resident_id', $history->resident_id)
                    ->where('house_id', $history->house_id)
                    ->where('payment_type_id', $type->id)
                    ->where('period_start', $periodStart->toDateString())
                    ->first();

                if (!$existingBill) {
                    Bills::create([
                        'resident_id' => $history->resident_id,
                        'house_id' => $history->house_id,
                        'payment_type_id' => $type->id,
                        'period_start' => $periodStart->toDateString(),
                        'period_end' => $periodEnd->toDateString(),
                        'amount' => $type->amount,
                        'status' => 'unpaid',
                    ]);
                    $generatedCount++;
                }
            }
        }

        return $this->success_response(null, "Successfully generated {$generatedCount} bills for " . $periodStart->format('F Y'));
    }

    /**
     * Manual bill generation for a specific resident with duration.
     */
    public function manualStore(Request $request)
    {
        $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'duration' => 'required|integer|min:1|max:12',
        ]);

        // Find current active house for the resident
        $activeHistory = HouseResidentHistories::where('resident_id', $request->resident_id)
            ->active()
            ->first();

        if (!$activeHistory) {
            return $this->error_response('Resident is not currently occupying any house.', 422);
        }

        $paymentTypes = PaymentTypes::all();
        $generatedCount = 0;
        $startMonth = Carbon::now()->startOfMonth();

        try {
            DB::beginTransaction();
            for ($i = 0; $i < $request->duration; $i++) {
                $currentPeriodStart = $startMonth->copy()->addMonths($i);
                $currentPeriodEnd = $currentPeriodStart->copy()->endOfMonth();

                foreach ($paymentTypes as $type) {
                    $existingBill = Bills::where('resident_id', $request->resident_id)
                        ->where('house_id', $activeHistory->house_id)
                        ->where('payment_type_id', $type->id)
                        ->where('period_start', $currentPeriodStart->toDateString())
                        ->first();

                    if (!$existingBill) {
                        Bills::create([
                            'resident_id' => $request->resident_id,
                            'house_id' => $activeHistory->house_id,
                            'payment_type_id' => $type->id,
                            'period_start' => $currentPeriodStart->toDateString(),
                            'period_end' => $currentPeriodEnd->toDateString(),
                            'amount' => $type->amount,
                            'status' => 'unpaid',
                        ]);
                        $generatedCount++;
                    }
                }
            }
            DB::commit();

            return $this->success_response(null, "Successfully generated {$generatedCount} bills for the next {$request->duration} month(s).");
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error_response('Failed to generate bills: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $bill = Bills::with(['resident', 'house', 'paymentType', 'paymentDetails.payment'])->find($id);

        if (!$bill) {
            return $this->error_response('Bill not found', 404);
        }

        return $this->success_response($bill);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $bill = Bills::find($id);

        if (!$bill) {
            return $this->error_response('Bill not found', 404);
        }

        // Validation: only unpaid bills can be deleted
        if ($bill->status !== 'unpaid') {
            return $this->error_response('Only unpaid bills can be deleted.', 422);
        }

        $bill->delete();

        return $this->success_response(null, 'Bill deleted successfully');
    }
}
