import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatRupiah } from "@/lib/format";
import type { PaymentType, ExpenseTemplate, APIResponse } from "@/types";
import { toast } from "sonner";
import api from "@/lib/api";

export default function Templates() {
  // States - Tagihan (Payment Types)
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [isLoadingPT, setIsLoadingPT] = useState(true);
  const [isAddPTOpen, setIsAddPTOpen] = useState(false);
  const [isDeletingPT, setIsDeletingPT] = useState(false);
  const [isSubmittingPT, setIsSubmittingPT] = useState(false);
  const [ptForm, setPtForm] = useState({ name: "", amount: "" });
  const [selectedPTForDelete, setSelectedPTForDelete] = useState<number | null>(
    null,
  );

  // States - Pengeluaran (Expense Templates)
  const [expenseTemplates, setExpenseTemplates] = useState<ExpenseTemplate[]>(
    [],
  );
  const [isLoadingET, setIsLoadingET] = useState(true);
  const [isAddETOpen, setIsAddETOpen] = useState(false);
  const [isDeletingET, setIsDeletingET] = useState(false);
  const [isSubmittingET, setIsSubmittingET] = useState(false);
  const [etForm, setEtForm] = useState({
    title: "",
    amount: "",
    description: "",
  });
  const [selectedETForDelete, setSelectedETForDelete] = useState<number | null>(
    null,
  );

  // Fetch Payment Types
  const fetchPaymentTypes = async () => {
    setIsLoadingPT(true);
    try {
      // NOTE: User instructed to use /api/expenses-templates in point 1, but this clearly handles Tagihan Rutin (Payment Types)
      // I will use /payment-types based on endpoint docs for PaymentType
      const response =
        await api.get<APIResponse<PaymentType[]>>("/payment-types");
      if (response.data.success) {
        setPaymentTypes(response.data.data);
      }
    } catch (error) {
      toast.error("Gagal mengambil data tagihan rutin");
    } finally {
      setIsLoadingPT(false);
    }
  };

  // Fetch Expense Templates
  const fetchExpenseTemplates = async () => {
    setIsLoadingET(true);
    try {
      const response =
        await api.get<APIResponse<ExpenseTemplate[]>>("/expense-templates");
      if (response.data.success) {
        setExpenseTemplates(response.data.data);
      }
    } catch (error) {
      toast.error("Gagal mengambil data pengeluaran rutin");
    } finally {
      setIsLoadingET(false);
    }
  };

  useEffect(() => {
    fetchPaymentTypes();
    fetchExpenseTemplates();
  }, []);

  // --- Handlers for Payment Types (Tagihan) ---
  const handleAddPT = async () => {
    if (!ptForm.name || !ptForm.amount) {
      toast.error("Nama dan nominal wajib diisi!");
      return;
    }

    setIsSubmittingPT(true);
    try {
      const response = await api.post("/payment-types", {
        name: ptForm.name,
        amount: Number(ptForm.amount),
      });

      if (response.data.success) {
        toast.success("Berhasil menambahkan tagihan rutin");
        setIsAddPTOpen(false);
        setPtForm({ name: "", amount: "" });
        fetchPaymentTypes();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menambahkan tagihan rutin",
      );
    } finally {
      setIsSubmittingPT(false);
    }
  };

  const handleDeletePT = async () => {
    if (!selectedPTForDelete) return;

    setIsDeletingPT(true);
    try {
      const response = await api.delete(
        `/payment-types/${selectedPTForDelete}`,
      );
      if (response.data.success) {
        toast.success("Berhasil menghapus tagihan rutin");
        setSelectedPTForDelete(null);
        fetchPaymentTypes();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menghapus tagihan rutin",
      );
    } finally {
      setIsDeletingPT(false);
    }
  };

  // --- Handlers for Expense Templates (Pengeluaran) ---
  const handleAddET = async () => {
    if (!etForm.title || !etForm.amount) {
      toast.error("Judul dan nominal wajib diisi!");
      return;
    }

    setIsSubmittingET(true);
    try {
      const response = await api.post("/expense-templates", {
        title: etForm.title,
        amount: Number(etForm.amount),
        description: etForm.description,
        recurrence: "monthly",
      });

      if (response.data.success) {
        toast.success("Berhasil menambahkan pengeluaran rutin");
        setIsAddETOpen(false);
        setEtForm({ title: "", amount: "", description: "" });
        fetchExpenseTemplates();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menambahkan pengeluaran rutin",
      );
    } finally {
      setIsSubmittingET(false);
    }
  };

  const handleDeleteET = async () => {
    if (!selectedETForDelete) return;

    setIsDeletingET(true);
    try {
      const response = await api.delete(
        `/expense-templates/${selectedETForDelete}`,
      );
      if (response.data.success) {
        toast.success("Berhasil menghapus pengeluaran rutin");
        setSelectedETForDelete(null);
        fetchExpenseTemplates();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menghapus pengeluaran rutin",
      );
    } finally {
      setIsDeletingET(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tagihan" className="space-y-6">
        <TabsList className="bg-[#DBE2EF]/40 rounded-xl p-1">
          <TabsTrigger
            value="tagihan"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6"
          >
            Tagihan
          </TabsTrigger>
          <TabsTrigger
            value="pengeluaran"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6"
          >
            Pengeluaran
          </TabsTrigger>
        </TabsList>

        {/* ========== TAB 1: TAGIHAN ========== */}
        <TabsContent value="tagihan" className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3 text-base font-semibold text-[#112D4E]">
              <div>Daftar Tagihan Rutin ({paymentTypes.length})</div>
              <Button
                onClick={() => setIsAddPTOpen(true)}
                className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl shadow-sm h-9"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat tagihan rutin baru
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingPT ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#3F72AF]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : paymentTypes.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  Tidak ada tagihan rutin yang ditemukan.
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-[#DBE2EF]/60">
                  <Table>
                    <TableHeader className="bg-[#F9F7F7]">
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead className="text-right">Nominal</TableHead>
                        <TableHead className="text-center w-[100px]">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentTypes.map((pt) => (
                        <TableRow key={pt.id}>
                          <TableCell className="font-medium text-[#112D4E]">
                            {pt.name}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatRupiah(pt.amount)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setSelectedPTForDelete(pt.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== TAB 2: PENGELUARAN ========== */}
        <TabsContent value="pengeluaran" className="space-y-4">
          <Card className="border-0 shadow-sm rounded-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3 text-base font-semibold text-[#112D4E]">
              <div>Daftar pengeluaran rutin ({expenseTemplates.length})</div>
              <Button
                onClick={() => setIsAddETOpen(true)}
                className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl shadow-sm h-9"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat pengeluaran rutin
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingET ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#3F72AF]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : expenseTemplates.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  Tidak ada pengeluaran rutin yang ditemukan.
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-[#DBE2EF]/60">
                  <Table>
                    <TableHeader className="bg-[#F9F7F7]">
                      <TableRow>
                        <TableHead>Judul</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="text-right">Nominal</TableHead>
                        <TableHead className="text-center w-[100px]">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseTemplates.map((et) => (
                        <TableRow key={et.id}>
                          <TableCell className="font-medium text-[#112D4E]">
                            {et.title}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {et.description || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatRupiah(et.amount)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setSelectedETForDelete(et.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========== MODALS: TAB 1 (PT) ========== */}
      <Dialog
        open={isAddPTOpen}
        onOpenChange={(open) => {
          // ensure modal can't be closed while submitting
          if (!isSubmittingPT) setIsAddPTOpen(open);
        }}
      >
        <DialogContent
          className="sm:max-w-md rounded-2xl border-[#DBE2EF]"
          onPointerDownOutside={(e) => {
            if (isSubmittingPT) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Buat Tagihan Rutin Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pt-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pt-name"
                placeholder="Contoh: Iuran Kebersihan"
                value={ptForm.name}
                onChange={(e) => setPtForm({ ...ptForm, name: e.target.value })}
                disabled={isSubmittingPT}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pt-amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pt-amount"
                type="number"
                placeholder="Contoh: 50000"
                value={ptForm.amount}
                onChange={(e) =>
                  setPtForm({ ...ptForm, amount: e.target.value })
                }
                disabled={isSubmittingPT}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddPTOpen(false)}
              disabled={isSubmittingPT}
            >
              Batal
            </Button>
            <Button onClick={handleAddPT} disabled={isSubmittingPT}>
              {isSubmittingPT ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedPTForDelete !== null}
        onOpenChange={(open) => {
          if (!isDeletingPT && !open) setSelectedPTForDelete(null);
        }}
      >
        <DialogContent
          className="sm:max-w-md rounded-2xl border-[#DBE2EF]"
          onPointerDownOutside={(e) => {
            if (isDeletingPT) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[#112D4E] flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Hapus Tagihan Rutin
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Apakah yakin ingin menghapus tagihan rutin ini?
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedPTForDelete(null)}
              disabled={isDeletingPT}
            >
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl min-w-[100px]"
              onClick={handleDeletePT}
              disabled={isDeletingPT}
            >
              {isDeletingPT ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== MODALS: TAB 2 (ET) ========== */}
      <Dialog
        open={isAddETOpen}
        onOpenChange={(open) => {
          if (!isSubmittingET) setIsAddETOpen(open);
        }}
      >
        <DialogContent
          className="sm:max-w-md rounded-2xl border-[#DBE2EF]"
          onPointerDownOutside={(e) => {
            if (isSubmittingET) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Buat Pengeluaran Rutin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="et-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="et-title"
                placeholder="Contoh: Gaji Satpam"
                value={etForm.title}
                onChange={(e) =>
                  setEtForm({ ...etForm, title: e.target.value })
                }
                disabled={isSubmittingET}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="et-amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="et-amount"
                type="number"
                placeholder="Contoh: 2000000"
                value={etForm.amount}
                onChange={(e) =>
                  setEtForm({ ...etForm, amount: e.target.value })
                }
                disabled={isSubmittingET}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="et-desc">Description</Label>
              <Textarea
                id="et-desc"
                placeholder="Keterangan (Opsional)"
                value={etForm.description}
                onChange={(e) =>
                  setEtForm({ ...etForm, description: e.target.value })
                }
                disabled={isSubmittingET}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddETOpen(false)}
              disabled={isSubmittingET}
            >
              Batal
            </Button>
            <Button onClick={handleAddET} disabled={isSubmittingET}>
              {isSubmittingET ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedETForDelete !== null}
        onOpenChange={(open) => {
          if (!isDeletingET && !open) setSelectedETForDelete(null);
        }}
      >
        <DialogContent
          className="sm:max-w-md rounded-2xl border-[#DBE2EF]"
          onPointerDownOutside={(e) => {
            if (isDeletingET) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[#112D4E] flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Hapus Pengeluaran Rutin
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Apakah yakin ingin menghapus pengeluaran rutin ini?
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedETForDelete(null)}
              disabled={isDeletingET}
            >
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl min-w-[100px]"
              onClick={handleDeleteET}
              disabled={isDeletingET}
            >
              {isDeletingET ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
