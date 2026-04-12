<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bills;
use App\Models\PaymentDetails;
use App\Models\Payments;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    use ApiResponse;

    /**
     * READ — Menampilkan seluruh data pembayaran.
     */
    public function index()
    {
        $payments = Payments::with(['resident', 'details.bill.paymentType'])->get();
        return $this->success_response($payments);
    }

    /**
     * READ — Menampilkan rincian pembayaran berdasarkan ID.
     */
    public function show($id)
    {
        $payment = Payments::with(['resident', 'details.bill.paymentType'])->find($id);

        if (!$payment) {
            return $this->error_response('Data pembayaran tidak ditemukan.', 404);
        }

        return $this->success_response($payment);
    }

    /**
     * CREATE — Melakukan Pembayaran
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resident_id' => 'required|integer|exists:residents,id',
            'payment_date' => 'required|date',
            'details' => 'required|array|min:1',
            'details.*.bill_id' => 'required|integer|exists:bills,id',
            'details.*.amount' => 'required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return $this->error_response('Validation Error', 422, $validator->errors());
        }

        try {
            DB::beginTransaction();

            $totalAmount = array_sum(array_column($request->details, 'amount'));

            $payment = Payments::create([
                'resident_id' => $request->resident_id,
                'total_amount' => $totalAmount,
                'payment_date' => $request->payment_date,
            ]);

            foreach ($request->details as $detail) {
                $bill = Bills::lockForUpdate()->findOrFail($detail['bill_id']);
                
                // Cek apakah tagihan sudah lunas
                if ($bill->status === 'paid') {
                    throw new \Exception("Tagihan ID {$bill->id} sudah dibayar!");
                }

                // Pastikan resident_id bill sama dengan yang bayar (opsional untuk keamanan)
                if ($bill->resident_id != $request->resident_id) {
                    throw new \Exception("Tagihan ID {$bill->id} bukan milik penghuni tersebut.");
                }

                PaymentDetails::create([
                    'payment_id' => $payment->id,
                    'bill_id' => $bill->id,
                    'amount' => $detail['amount'],
                ]);

                // Update status bill
                $totalPaid = PaymentDetails::where('bill_id', $bill->id)->sum('amount');
                if ($totalPaid >= $bill->amount) {
                    $bill->status = 'paid';
                } else if ($totalPaid > 0) {
                    $bill->status = 'partial';
                }
                $bill->save();
            }

            DB::commit();

            return $this->success_response($payment->load('details.bill.paymentType'), 'Pembayaran berhasil dicatat.', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error_response('Gagal memproses pembayaran: ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE — Hapus Pembayaran
     */
    public function destroy($id)
    {
        $payment = Payments::with('details')->find($id);

        if (!$payment) {
            return $this->error_response('Data pembayaran tidak ditemukan.', 404);
        }

        try {
            DB::beginTransaction();

            $billIds = $payment->details->pluck('bill_id')->unique();
            
            // Hapus payment (payment_details akan ikut terhapus via cascade)
            $payment->delete();

            // Recalculate status untuk setiap bill yang terdampak
            foreach ($billIds as $billId) {
                $bill = Bills::find($billId);
                if ($bill) {
                    $totalPaid = PaymentDetails::where('bill_id', $bill->id)->sum('amount');
                    if ($totalPaid >= $bill->amount) {
                        $bill->status = 'paid';
                    } else if ($totalPaid > 0) {
                        $bill->status = 'partial';
                    } else {
                        $bill->status = 'unpaid';
                    }
                    $bill->save();
                }
            }

            DB::commit();

            return $this->success_response(null, 'Data pembayaran berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error_response('Gagal menghapus pembayaran: ' . $e->getMessage(), 500);
        }
    }
}
