import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Wallet,
  RefreshCw,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatRupiah, formatDateShort } from "@/lib/format";
import type { Expense, APIResponse } from "@/types";
import { toast } from "sonner";
import api from "@/lib/api";

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    description: "",
    isRecurring: false,
  });

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<APIResponse<Expense[]>>("/expenses");
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Gagal mengambil data pengeluaran");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: "",
      amount: "",
      expense_date: new Date().toISOString().split("T")[0],
      description: "",
      isRecurring: false,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      title: expense.title,
      amount: String(expense.amount),
      expense_date: expense.expense_date,
      description: expense.description || "",
      isRecurring: false, // We don't link existing expense back to template status for now as per instructions
    });
    setIsDialogOpen(true);
  };

  const validate = () => {
    if (!formData.title.trim()) {
      toast.error("Judul wajib diisi");
      return false;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Jumlah pengeluaran tidak valid");
      return false;
    }
    if (!formData.expense_date) {
      toast.error("Tanggal wajib diisi");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formData.title,
        amount: Number(formData.amount),
        expense_date: formData.expense_date,
        description: formData.description,
      };

      if (editingId) {
        // Update logic: POST with _method=PUT
        await api.post(`/expenses/${editingId}`, {
          ...payload,
          _method: "PUT",
        });
        toast.success(`Pengeluaran berhasil diperbarui`);
      } else {
        // Create logic
        await api.post("/expenses", payload);

        // If recurring is checked, also save to templates
        if (formData.isRecurring) {
          await api.post("/expense-templates", {
            title: formData.title,
            amount: Number(formData.amount),
            description: formData.description,
            recurrence: "monthly",
            is_active: true,
          });
          toast.success(
            "Pengeluaran dicatat dan disimpan sebagai template rutin",
          );
        } else {
          toast.success("Pengeluaran berhasil ditambahkan");
        }
      }

      setIsDialogOpen(false);
      fetchExpenses();
    } catch (error: any) {
      console.error("Error saving expense:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteId) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/expenses/${deleteId}`);
      toast.success("Data pengeluaran berhasil dihapus");
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Gagal menghapus data");
    } finally {
      setIsSubmitting(false);
      setDeleteId(null);
    }
  };

  const handleGenerateExpenses = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post("/expenses/generate");
      if (response.data.success) {
        toast.success(
          response.data.message || "Pengeluaran rutin berhasil di-generate",
        );
        setIsGenerateDialogOpen(false);
        fetchExpenses();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal otomatisasi pengeluaran rutin",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-orange-50">
              <Wallet className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
              <p className="text-xl font-bold text-orange-600">
                {isLoading ? "..." : formatRupiah(totalExpenses)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-2xl bg-[#3F72AF]/5 border-dashed border-[#3F72AF]/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-[#3F72AF]/10">
              <RefreshCw className="h-5 w-5 text-[#3F72AF]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Kelola Anggaran</p>
              <p className="text-xs text-[#3F72AF]/80 italic">
                Data pengeluaran tercatat real-time
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => setIsGenerateDialogOpen(true)}
          className="rounded-xl border-[#DBE2EF]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tambah Pengeluaran Rutin
        </Button>
        <Button
          onClick={handleOpenCreate}
          className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pengeluaran
        </Button>
      </div>

      {/* Expenses Table */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b border-[#DBE2EF]/50">
          <CardTitle className="text-base font-semibold text-[#112D4E]">
            Daftar Pengeluaran {isLoading ? "" : `(${expenses.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#3F72AF]/40" />
              <p className="text-sm text-muted-foreground mt-2">
                Memuat data pengeluaran...
              </p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-[#DBE2EF]/40 flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-[#3F72AF]/50" />
              </div>
              <p className="text-[#112D4E] font-medium mb-1">
                Belum ada pengeluaran
              </p>
              <p className="text-sm text-muted-foreground">
                Klik tombol "Tambah Pengeluaran" untuk mencatat pengeluaran.
              </p>
            </div>
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
                  <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                    Keterangan
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider text-right pr-6">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow
                    key={expense.id}
                    className="border-[#DBE2EF]/60 hover:bg-[#DBE2EF]/10 transition-colors"
                  >
                    <TableCell className="font-medium text-[#112D4E] pl-6">
                      {expense.title}
                    </TableCell>
                    <TableCell className="text-orange-600 font-semibold">
                      {formatRupiah(expense.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateShort(expense.expense_date)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {expense.description || "-"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(expense)}
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-[#3F72AF] hover:bg-[#3F72AF]/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isSubmitting}
                          onClick={() => handleDelete(expense.id)}
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Handle Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl border-[#DBE2EF] shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-[#112D4E] flex items-center gap-2">
              {editingId ? (
                <Pencil className="h-5 w-5 text-[#3F72AF]" />
              ) : (
                <Plus className="h-5 w-5 text-[#3F72AF]" />
              )}
              {editingId ? "Ubah Pengeluaran" : "Tambah Pengeluaran"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Perbarui informasi data pengeluaran yang telah dicatat."
                : "Catat pengeluaran baru untuk lingkungan RT."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[#112D4E] font-medium">
                  Judul <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Contoh: Gaji Satpam"
                  value={formData.title}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="rounded-xl border-[#DBE2EF] focus:ring-[#3F72AF]/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#112D4E] font-medium">
                  Tanggal <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.expense_date}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setFormData({ ...formData, expense_date: e.target.value })
                  }
                  className="rounded-xl border-[#DBE2EF] focus:ring-[#3F72AF]/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#112D4E] font-medium">
                Jumlah <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  Rp
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="rounded-xl border-[#DBE2EF] pl-10 focus:ring-[#3F72AF]/30 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#112D4E] font-medium">Keterangan</Label>
              <Textarea
                placeholder="Tambahkan deskripsi atau catatan..."
                value={formData.description}
                disabled={isSubmitting}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-xl border-[#DBE2EF] focus:ring-[#3F72AF]/30 min-h-[100px] resize-none"
              />
            </div>

            {!editingId && (
              <div className="flex items-center justify-between rounded-2xl border border-[#3F72AF]/20 bg-[#3F72AF]/5 p-4 transition-all hover:border-[#3F72AF]/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <RefreshCw
                      className={`h-4 w-4 ${formData.isRecurring ? "text-[#3F72AF] animate-spin-slow" : "text-slate-400"}`}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="isRecurring"
                      className="text-[#112D4E] font-semibold cursor-pointer block"
                    >
                      Jadikan Pengeluaran Rutin
                    </Label>
                    <p className="text-[10px] text-muted-foreground italic">
                      Otomatis simpan sebagai template bulanan
                    </p>
                  </div>
                </div>
                <Switch
                  id="isRecurring"
                  checked={formData.isRecurring}
                  disabled={isSubmitting}
                  onCheckedChange={(v) =>
                    setFormData({ ...formData, isRecurring: v })
                  }
                />
              </div>
            )}

            {isSubmitting && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Sedang memproses permintaan...</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 space-x-2">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl border-[#DBE2EF] flex-1 sm:flex-none"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl shadow-md min-w-[120px] flex-1 sm:flex-none"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                "Simpan Data"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Handle Generate Routine Expense Dialog */}
      <Dialog
        open={isGenerateDialogOpen}
        onOpenChange={(open) => {
          if (!isGenerating) setIsGenerateDialogOpen(open);
        }}
      >
        <DialogContent
          className="sm:max-w-md rounded-2xl border-[#DBE2EF] shadow-lg"
          onPointerDownOutside={(e) => {
            if (isGenerating) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[#112D4E] flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-[#3F72AF]" />
              Konfirmasi Pengeluaran Rutin
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin memproses dan mencatat semua pengeluaran
              rutin secara otomatis berdasarkan template yang aktif?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4 space-x-2">
            <Button
              variant="outline"
              disabled={isGenerating}
              onClick={() => setIsGenerateDialogOpen(false)}
              className="rounded-xl border-[#DBE2EF] flex-1 sm:flex-none"
            >
              Batal
            </Button>
            <Button
              onClick={handleGenerateExpenses}
              disabled={isGenerating}
              className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl shadow-md min-w-[140px] flex-1 sm:flex-none"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Mencatat...
                </>
              ) : (
                "Proses Pengeluaran"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => !isSubmitting && setIsDeleteConfirmOpen(false)}
        onConfirm={executeDelete}
        header={
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Hapus Pengeluaran
          </div>
        }
        body="Apakah Anda yakin ingin menghapus data pengeluaran ini? Tindakan ini tidak dapat dibatalkan."
        footer={
          <DialogFooter className="gap-2 sm:gap-0 mt-4 space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={isSubmitting}
              className="rounded-xl border-[#DBE2EF] flex-1 sm:flex-none"
            >
              Batal
            </Button>
            <Button
              onClick={executeDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md min-w-[120px] flex-1 sm:flex-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menghapus...
                </>
              ) : (
                "Ya, Hapus"
              )}
            </Button>
          </DialogFooter>
        }
      />
    </div>
  );
}
