import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Scale, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRupiah, formatDateShort } from '@/lib/format';
import api from '@/lib/api';
import type { APIResponse, FinancialDetail } from '@/types';
import { toast } from 'sonner';

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const years = ['2024', '2025', '2026'];

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [reportData, setReportData] = useState<FinancialDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReportDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const monthIndex = months.indexOf(selectedMonth) + 1;
      const response = await api.get<APIResponse<FinancialDetail>>('/reports/detail', {
        params: {
          month: monthIndex,
          year: parseInt(selectedYear),
        },
      });

      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Gagal mengambil detail laporan');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchReportDetail();
  }, [fetchReportDetail]);

  const totalIncome = reportData?.total_income || 0;
  const totalExpense = reportData?.total_expenses || 0;
  const balance = reportData?.balance || 0;

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="space-y-2 w-full sm:w-auto">
              <Label className="text-[#112D4E] text-sm font-medium">Bulan</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={isLoading}>
                <SelectTrigger className="w-full sm:w-44 rounded-xl border-[#DBE2EF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 w-full sm:w-auto">
              <Label className="text-[#112D4E] text-sm font-medium">Tahun</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear} disabled={isLoading}>
                <SelectTrigger className="w-full sm:w-32 rounded-xl border-[#DBE2EF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 self-end">
               {isLoading && <Loader2 className="h-4 w-4 animate-spin text-[#3F72AF]" />}
               <Badge
                variant="secondary"
                className="rounded-lg bg-[#DBE2EF]/40 text-[#112D4E] hover:bg-[#DBE2EF]/40"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Laporan {selectedMonth} {selectedYear}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-50">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-sm text-muted-foreground">Total Pemasukan</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {isLoading ? '...' : formatRupiah(totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-orange-50">
                <TrendingDown className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {isLoading ? '...' : formatRupiah(totalExpense)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-[#3F72AF]/10">
                <Scale className="h-5 w-5 text-[#3F72AF]" />
              </div>
              <p className="text-sm text-muted-foreground">Saldo</p>
            </div>
            <p
              className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
            >
              {isLoading ? '...' : formatRupiah(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Tables */}
      <Tabs defaultValue="pemasukan" className="space-y-4">
        <TabsList className="bg-[#DBE2EF]/40 rounded-xl p-1">
          <TabsTrigger
            value="pemasukan"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6"
          >
            Daftar Pemasukan
          </TabsTrigger>
          <TabsTrigger
            value="pengeluaran"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6"
          >
            Daftar Pengeluaran
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pemasukan">
          <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardContent className="p-0">
               {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                     <Loader2 className="h-8 w-8 animate-spin text-[#3F72AF]/20" />
                  </div>
               ) : !reportData?.pemasukan.length ? (
                  <div className="py-20 text-center text-muted-foreground">Tidak ada data pemasukan</div>
               ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F9F7F7] hover:bg-[#F9F7F7] border-[#DBE2EF]/60">
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider pl-6">
                        Warga
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                        Jumlah
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                        Tanggal
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider pr-6">
                        Tipe
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.pemasukan.map((payment) => (
                      <TableRow
                        key={payment.payment_id}
                        className="border-[#DBE2EF]/60 hover:bg-[#DBE2EF]/15 transition-colors"
                      >
                        <TableCell className="font-medium text-[#112D4E] pl-6">
                          {payment.resident_name}
                          <span className="block text-[10px] text-muted-foreground font-normal">
                             No. Rumah: {payment.house_number}
                          </span>
                        </TableCell>
                        <TableCell className="text-emerald-600 font-medium">
                          {formatRupiah(payment.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDateShort(payment.payment_date)}
                        </TableCell>
                        <TableCell className="pr-6">
                           <Badge
                              variant="secondary"
                              className="rounded-md text-xs bg-[#DBE2EF]/40 text-[#112D4E] hover:bg-[#DBE2EF]/40"
                           >
                              {payment.payment_type}
                           </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pengeluaran">
          <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardContent className="p-0">
               {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                     <Loader2 className="h-8 w-8 animate-spin text-[#3F72AF]/20" />
                  </div>
               ) : !reportData?.pengeluaran.length ? (
                  <div className="py-20 text-center text-muted-foreground">Tidak ada data pengeluaran</div>
               ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F9F7F7] hover:bg-[#F9F7F7] border-[#DBE2EF]/60">
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider pl-6">
                        Judul
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                        Jumlah
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                        Tanggal
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider pr-6">
                        Deskripsi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.pengeluaran.map((expense) => (
                      <TableRow
                        key={expense.id}
                        className="border-[#DBE2EF]/60 hover:bg-[#DBE2EF]/15 transition-colors"
                      >
                        <TableCell className="font-medium text-[#112D4E] pl-6">
                          {expense.title}
                        </TableCell>
                        <TableCell className="text-orange-600 font-medium">
                          {formatRupiah(expense.amount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDateShort(expense.expense_date)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate pr-6">
                          {expense.description || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
