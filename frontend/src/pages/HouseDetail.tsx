import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  UserMinus,
  UserPlus,
  Trash2,
  Edit2,
  AlertTriangle,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useResident } from "@/context/ResidentContext";
import type { House, HouseResidentHistory, Bill, APIResponse } from "@/types";
import { formatRupiah, formatDate } from "@/lib/format";
import api from "@/lib/api";
import { toast } from "sonner";

export default function HouseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [house, setHouse] = useState<House | null>(null);
  const [histories, setHistories] = useState<HouseResidentHistory[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const { residents, fetchResidents } = useResident();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Forms state
  const [removeDate, setRemoveDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [editForm, setEditForm] = useState({
    house_number: "",
  });
  const [assignForm, setAssignForm] = useState({
    resident_id: "",
    duration: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch House Details and History
      const historyResponse = await api.get<
        APIResponse<HouseResidentHistory[]>
      >(`/house-resident-histories/house/${id}?is_past=true`);

      if (historyResponse.data.success) {
        setHistories(historyResponse.data.data);
        if (historyResponse.data.data.length > 0) {
          setHouse(historyResponse.data.data[0].house);
          setEditForm({
            house_number: historyResponse.data.data[0].house.house_number,
          });
        } else {
          const houseResponse = await api.get<APIResponse<House>>(
            `/houses/${id}`,
          );
          if (houseResponse.data.success) {
            setHouse(houseResponse.data.data);
            setEditForm({ house_number: houseResponse.data.data.house_number });
          }
        }
      }

      // 2. Fetch Payment History (Bills)
      const billsResponse = await api.get<APIResponse<Bill[]>>(
        `/bills/house/${id}`,
      );
      if (billsResponse.data.success) {
        setBills(billsResponse.data.data);
      }

      // 3. Fetch Residents via Context (it handles avoiding redundant requests internally)
      await fetchResidents();
    } catch (error) {
      console.error("Error fetching house detail:", error);
      toast.error("Gagal mengambil detail rumah");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const today = new Date().toISOString().split("T")[0];
  const currentHistory = histories.find(
    (h) => h.end_date === null || h.end_date > today,
  );

  const handleEditHouse = async () => {
    if (!editForm.house_number.trim()) {
      toast.error("Nomor rumah tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    try {
      // Consume API POST with _method=PUT
      const response = await api.post<APIResponse<House>>(`/houses/${id}`, {
        _method: "PUT",
        house_number: editForm.house_number,
      });

      if (response.data.success) {
        toast.success("Informasi rumah berhasil diupdate");
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (error: any) {
      console.error("Error updating house:", error);
      toast.error(error.response?.data?.message || "Gagal mengupdate rumah");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveResident = async () => {
    if (!currentHistory) return;

    setIsSubmitting(true);
    try {
      const response = await api.delete(
        `/house-resident-histories/${currentHistory.id}`,
        {
          data: { end_date: removeDate },
        },
      );

      if (response.data.success) {
        toast.success("Penghuni berhasil dihapus");
        setIsRemoveModalOpen(false);
        fetchData();
      }
    } catch (error: any) {
      console.error("Error removing resident:", error);
      toast.error(error.response?.data?.message || "Gagal menghapus penghuni");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignResident = async () => {
    if (!assignForm.resident_id) {
      toast.error("Harap isi semua data");
      return;
    }

    if (
      filteredResidents.find((r) => r.id === Number(assignForm.resident_id))
        .status == "kontrak" &&
      !assignForm.duration
    ) {
      toast.error("Harap isi durasi kontrak");
      return;
    }

    if (
      currentHistory &&
      (currentHistory.end_date > today || !currentHistory.end_date)
    ) {
      setIsConfirmModalOpen(true);
      return;
    }

    executeAssign();
  };

  const executeAssign = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        house_id: Number(id),
        resident_id: Number(assignForm.resident_id),
        duration: Number(assignForm.duration) || undefined,
      };

      let response;
      if (currentHistory) {
        // Swap resident
        response = await api.post("/house-resident-histories/change", payload);
      } else {
        // New assignment
        response = await api.post("/house-resident-histories", payload);
      }

      if (response.data.success) {
        toast.success(
          currentHistory
            ? "Penghuni berhasil diubah"
            : "Penghuni berhasil ditetapkan",
        );
        setIsAssignModalOpen(false);
        setAssignForm({ resident_id: "", duration: "" });
        fetchData();
      }
    } catch (error: any) {
      console.error("Error assigning resident:", error);
      toast.error(error.response?.data?.message || "Gagal menetapkan penghuni");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#3F72AF]/40" />
        <p className="mt-4 text-sm text-muted-foreground">
          Memuat detail rumah...
        </p>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-[#DBE2EF]/40 flex items-center justify-center mb-4">
          <Home className="h-8 w-8 text-[#3F72AF]/50" />
        </div>
        <p className="text-[#112D4E] font-medium mb-1">Rumah tidak ditemukan</p>
        <p className="text-sm text-muted-foreground mb-4">
          Data rumah yang Anda cari tidak tersedia.
        </p>
        <Button
          onClick={() => navigate("/rumah")}
          className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl"
        >
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "partial":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
      partial: "bg-amber-50 text-amber-700 hover:bg-amber-50",
      unpaid: "bg-red-50 text-red-700 hover:bg-red-50",
    };
    const labels: Record<string, string> = {
      paid: "Lunas",
      partial: "Sebagian",
      unpaid: "Belum Bayar",
    };
    return (
      <Badge
        variant="secondary"
        className={`rounded-lg text-[10px] uppercase font-bold tracking-tight px-2 py-0.5 ${styles[status]}`}
      >
        {labels[status] || status}
      </Badge>
    );
  };

  const filteredResidents = residents.filter(
    (resident) => resident.id !== currentHistory?.resident_id,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/rumah")}
          className="rounded-xl text-[#112D4E]/60 hover:text-[#112D4E] hover:bg-[#DBE2EF]/40"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-2xl bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`h-14 w-14 rounded-2xl flex items-center justify-center ${house.status === "dihuni" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"}`}
              >
                <Home className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#112D4E]">
                    Rumah {house.house_number}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-[#3F72AF] hover:bg-[#3F72AF]/10"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={`rounded-lg text-[10px] uppercase font-bold tracking-tight px-2 py-0.5 ${house.status === "dihuni" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-orange-50 text-orange-700 hover:bg-orange-50"}`}
                  >
                    {house.status === "dihuni" ? "Dihuni" : "Kosong"}
                  </Badge>
                  {currentHistory && (
                    <span className="text-sm text-muted-foreground">
                      • {currentHistory.resident.full_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {currentHistory && (
                <Button
                  variant="outline"
                  className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  onClick={() => setIsRemoveModalOpen(true)}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Hapus Penghuni
                </Button>
              )}
              <Button
                className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl shadow-sm"
                onClick={() => setIsAssignModalOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {currentHistory ? "Ubah Penghuni" : "Tetapkan Penghuni"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm rounded-2xl bg-white h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#112D4E]">
              Riwayat Penghuni
            </CardTitle>
          </CardHeader>
          <CardContent>
            {histories.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <User className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Belum ada riwayat penghuni.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-[#DBE2EF]" />
                {histories.map((entry) => (
                  <div key={entry.id} className="relative last:pb-0">
                    <div
                      className={`absolute left-[-17px] top-1.5 h-3.5 w-3.5 rounded-full border-2 ${!entry.end_date || entry.end_date > new Date().toISOString() ? "bg-emerald-500 border-emerald-200 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" : "bg-white border-[#DBE2EF]"}`}
                    />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#112D4E]">
                          {entry.resident.full_name}
                        </p>
                        {!entry.end_date ||
                          (entry.end_date > new Date().toISOString() && (
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 rounded-lg text-[10px] font-bold px-1.5">
                              AKTIF
                            </Badge>
                          ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(entry.start_date)}
                        {entry.end_date
                          ? ` — ${formatDate(entry.end_date)}`
                          : " — Sekarang"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl bg-white h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#112D4E]">
              Riwayat Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Belum ada data pembayaran.
                </p>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-[#DBE2EF]/60">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F9F7F7] hover:bg-[#F9F7F7] border-[#DBE2EF]/60">
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                        Nama
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                        Periode
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                        Jenis
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider text-right">
                        Tagihan
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider text-right">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.slice(0, 10).map((bill) => (
                      <TableRow
                        key={bill.bill_id}
                        className="border-[#DBE2EF]/60 hover:bg-[#DBE2EF]/15"
                      >
                        <TableCell className="text-sm text-[#112D4E] whitespace-nowrap">
                          {bill.resident_name}
                        </TableCell>
                        <TableCell className="text-sm text-[#112D4E] whitespace-nowrap">
                          {bill.period}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {bill.payment_type}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-[#112D4E] text-right">
                          {formatRupiah(bill.amount_due)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {getStatusIcon(bill.status)}
                            {statusBadge(bill.status)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit House Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-[#DBE2EF]">
          <DialogHeader>
            <DialogTitle className="text-[#112D4E]">
              Edit Informasi Rumah
            </DialogTitle>
            <DialogDescription>
              Ubah nomor rumah. Pastikan nomor rumah belum terdaftar di sistem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="house_number">Nomor Rumah</Label>
              <Input
                id="house_number"
                value={editForm.house_number}
                onChange={(e) =>
                  setEditForm({ ...editForm, house_number: e.target.value })
                }
                className="rounded-xl border-[#DBE2EF]"
                placeholder="Contoh: A-01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl border-[#DBE2EF]"
            >
              Batal
            </Button>
            <Button
              onClick={handleEditHouse}
              disabled={isSubmitting}
              className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl min-w-[100px]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Resident Modal */}
      <Dialog open={isRemoveModalOpen} onOpenChange={setIsRemoveModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-[#DBE2EF]">
          <DialogHeader>
            <DialogTitle className="text-[#112D4E] flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Hapus Penghuni Aktif
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Apakah yakin ingin menghapus penghuni aktif saat ini? Masa huni akan
            diakhiri pada tanggal yang Anda pilih.
          </DialogDescription>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="remove_date">Tanggal Keluar</Label>
              <Input
                id="remove_date"
                type="date"
                max={today}
                value={removeDate}
                onChange={(e) => setRemoveDate(e.target.value)}
                className="rounded-xl border-[#DBE2EF]"
              />
              <p className="text-[10px] text-muted-foreground mt-1 italic">
                * Maksimal tanggal hari ini
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRemoveModalOpen(false)}
              className="rounded-xl border-[#DBE2EF]"
            >
              Batal
            </Button>
            <Button
              onClick={handleRemoveResident}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl min-w-[100px]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Hapus Penghuni"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign/Change Resident Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-[#DBE2EF]">
          <DialogHeader>
            <DialogTitle className="text-[#112D4E]">
              {currentHistory
                ? "Ubah Penghuni Rumah"
                : "Tetapkan Penghuni Baru"}
            </DialogTitle>
            <DialogDescription>
              {currentHistory
                ? "Informasi: Penghuni aktif saat ini akan otomatis diakhiri masa huninya hari ini."
                : "Pilih penghuni yang akan menempati rumah ini."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resident_id">Pilih Warga</Label>
              <Select
                value={assignForm.resident_id}
                onValueChange={(v) =>
                  setAssignForm({ ...assignForm, resident_id: v })
                }
              >
                <SelectTrigger className="rounded-xl border-[#DBE2EF]">
                  <SelectValue placeholder="Pilih warga..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {filteredResidents?.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.full_name} ({r.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {filteredResidents.find(
                (r) => r.id === Number(assignForm.resident_id),
              )?.status == "kontrak" && (
                <div className="space-y-2">
                  <Label htmlFor="durasi">Durasi Hunian</Label>

                  <Select
                    onValueChange={(v) =>
                      setAssignForm({ ...assignForm, duration: v })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-[#DBE2EF]">
                      <SelectValue placeholder="Pilih durasi..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="1">1 Bulan</SelectItem>
                      <SelectItem value="2">2 Bulan</SelectItem>
                      <SelectItem value="3">3 Bulan</SelectItem>
                      <SelectItem value="4">4 Bulan</SelectItem>
                      <SelectItem value="5">5 Bulan</SelectItem>
                      <SelectItem value="6">6 Bulan</SelectItem>
                      <SelectItem value="7">7 Bulan</SelectItem>
                      <SelectItem value="8">8 Bulan</SelectItem>
                      <SelectItem value="9">9 Bulan</SelectItem>
                      <SelectItem value="10">10 Bulan</SelectItem>
                      <SelectItem value="11">11 Bulan</SelectItem>
                      <SelectItem value="12">12 Bulan</SelectItem>
                    </SelectContent>
                  </Select>

                  <p className="text-[10px] text-muted-foreground mt-1 italic">
                    * Minimal 1 bulan
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
              className="rounded-xl border-[#DBE2EF]"
            >
              Batal
            </Button>
            <Button
              onClick={handleAssignResident}
              disabled={isSubmitting}
              className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl min-w-[100px]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={executeAssign}
        header={
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Konfirmasi Perubahan
          </div>
        }
        body="Penghuni saat ini masih memiliki masa huni yang aktif. Apakah Anda yakin ingin mengakhiri masa huni mereka dan menggantinya dengan penghuni baru?"
      />
    </div>
  );
}
