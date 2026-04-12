<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expenses;
use App\Models\Payments;
use App\Models\PaymentDetails;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponse;

    /**
     * Menampilkan summary (Pemasukan, Pengeluaran, Saldo) berdasarkan bulan.
     */
    public function summary(Request $request)
    {
        $year = $request->query('year', Carbon::now()->year);

        // Ambil pemasukan dari PaymentDetails (join dengan Payments untuk tanggal)
        $paymentDetails = PaymentDetails::whereHas('payment', function ($query) use ($year) {
            $query->whereYear('payment_date', $year);
        })->with('payment')->get();

        // Ambil pengeluaran dari Expenses
        $expenses = Expenses::whereYear('expense_date', $year)->get();

        $report = [];
        $totalIncome = $paymentDetails->sum('amount');
        $totalExpenses = $expenses->sum('amount');
        $yearlyBalance = $totalIncome - $totalExpenses;

        for ($month = 1; $month <= 12; $month++) {
            $monthString = str_pad($month, 2, '0', STR_PAD_LEFT);
            $monthName = Carbon::create($year, $month, 1)->format('F');

            $incomesForMonth = $paymentDetails->filter(function ($detail) use ($monthString, $year) {
                return Carbon::parse($detail->payment->payment_date)->format('m-Y') === "{$monthString}-{$year}";
            })->sum('amount');

            $expensesForMonth = $expenses->filter(function ($expense) use ($monthString, $year) {
                return Carbon::parse($expense->expense_date)->format('m-Y') === "{$monthString}-{$year}";
            })->sum('amount');

            $balance = $incomesForMonth - $expensesForMonth;

            if ($month > Carbon::now()->month && $year == Carbon::now()->year) {
                continue;
            }

            $report[] = [
                'month' => $monthName,
                'year' => (int)$year,
                'pemasukan' => $incomesForMonth,
                'pengeluaran' => $expensesForMonth,
                'saldo' => $balance
            ];
        }

        return $this->success_response([
            'year' => (int)$year,
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'balance' => $yearlyBalance,
            'report' => $report,
        ]);
    }

    /**
     * Menampilkan detail pemasukan dan pengeluaran pada bulan dan tahun tertentu.
     */
    public function detail(Request $request)
    {
        $month = $request->query('month', Carbon::now()->month);
        $year = $request->query('year', Carbon::now()->year);

        $monthString = str_pad($month, 2, '0', STR_PAD_LEFT);

        // Ambil detail pemasukan via PaymentDetails
        $paymentDetails = PaymentDetails::whereHas('payment', function ($query) use ($monthString, $year) {
            $query->whereMonth('payment_date', $monthString)
                  ->whereYear('payment_date', $year);
        })->with(['payment.resident', 'bill.house', 'bill.paymentType'])->get();

        $formattedIncomes = $paymentDetails->map(function ($detail) {
            return [
                'payment_id' => $detail->payment_id,
                'resident_name' => $detail->payment->resident->full_name ?? 'N/A',
                'house_number' => $detail->bill->house->house_number ?? 'N/A',
                'payment_type' => $detail->bill->paymentType->name ?? 'N/A',
                'amount' => $detail->amount,
                'payment_date' => $detail->payment->payment_date,
            ];
        });

        // Ambil semua detail expenses di bulan tersebut
        $expenses = Expenses::whereMonth('expense_date', $monthString)
            ->whereYear('expense_date', $year)
            ->get();

        $totalIncome = $paymentDetails->sum('amount');
        $totalExpenses = $expenses->sum('amount');
        $balance = $totalIncome - $totalExpenses;

        return $this->success_response([
            'period' => Carbon::create($year, $month, 1)->format('F Y'),
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'balance' => $balance,
            'pemasukan' => $formattedIncomes,
            'pengeluaran' => $expenses
        ]);
    }
}
