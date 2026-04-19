import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Edit2,
  Phone,
  UserCheck,
  UserX,
  Loader2,
  Upload,
  ImageIcon,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { useResident } from "@/context/ResidentContext";
import type { Resident, ResidentStatus, APIResponse } from "@/types";
import ConfirmModal from "@/components/ConfirmModal";

export default function Residents() {
  const { residents, isLoading, fetchResidents } = useResident();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingResidentId, setEditingResidentId] = useState<number | null>(
    null,
  );

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    status: "tetap" as ResidentStatus,
    is_married: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchResidents(); // Will only fetch if not loaded yet
  }, [fetchResidents]);

  const filteredResidents = residents.filter(
    (r) =>
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery),
  );

  const openAddDialog = () => {
    setEditingResidentId(null);
    setFormData({
      full_name: "",
      phone: "",
      status: "tetap",
      is_married: false,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = async (residentId: number) => {
    setEditingResidentId(residentId);
    setIsDialogOpen(true);
    setIsSubmitting(true);

    // Reset form while loading
    setFormData({
      full_name: "",
      phone: "",
      status: "tetap",
      is_married: false,
    });
    setPreviewUrl(null);
    setSelectedFile(null);

    try {
      const response = await api.get<APIResponse<Resident>>(
        `/residents/${residentId}`,
      );
      if (response.data.success) {
        const r = response.data.data;
        setFormData({
          full_name: r.full_name,
          phone: r.phone,
          status: r.status,
          is_married: Boolean(r.is_married),
        });
        setPreviewUrl(r.ktp_photo || null);
      }
    } catch (error) {
      console.error("Error fetching resident detail:", error);
      toast.error("Gagal mengambil detail warga");
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = (id: number) => {
    setDeleteId(id);
    setIsConfirmDelete(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/residents/${deleteId}`);
      toast.success("Data warga berhasil dihapus");
      fetchResidents(true);
    } catch (error) {
      console.error("Error deleting resident:", error);
      toast.error(error.response?.data?.message || "Gagal menghapus data");
    } finally {
      setIsSubmitting(false);
      setIsConfirmDelete(false);
      setDeleteId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 2MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.full_name.trim() || !formData.phone.trim()) {
      toast.error("Nama lengkap dan nomor telepon wajib diisi");
      return;
    }

    if (!editingResidentId && !selectedFile) {
      toast.error("Foto KTP wajib diunggah untuk warga baru");
      return;
    }

    setIsSubmitting(true);

    const body = new FormData();
    body.append("full_name", formData.full_name);
    body.append("phone", formData.phone);
    body.append("status", formData.status);
    body.append("is_married", formData.is_married ? "1" : "0");

    if (selectedFile) {
      body.append("ktp_photo", selectedFile);
    }

    try {
      if (editingResidentId) {
        // Update Resident - Using POST with _method=PUT as required by Laravel handle multipart/form-data for PUT
        body.append("_method", "PUT");
        await api.post(`/residents/${editingResidentId}`, body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(`Data ${formData.full_name} berhasil diperbarui`);
      } else {
        // Create Resident
        await api.post("/residents", body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(`${formData.full_name} berhasil ditambahkan`);
      }
      setIsDialogOpen(false);
      fetchResidents(true); // Force refetch after change
    } catch (error: any) {
      console.error("Error submitting resident:", error);
      const message =
        error.response?.data?.message || "Terjadi kesalahan pada server";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl border-[#DBE2EF] focus-visible:ring-[#3F72AF]/30 bg-white"
          />
        </div>

        <Button
          onClick={openAddDialog}
          className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Warga
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl border-[#DBE2EF] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#112D4E]">
                {editingResidentId ? "Edit Data Warga" : "Tambah Warga Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingResidentId
                  ? "Perbarui informasi data warga."
                  : "Isi formulir di bawah untuk menambahkan warga baru."}
              </DialogDescription>
            </DialogHeader>

            {isSubmitting && editingResidentId && !formData.full_name ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#3F72AF]" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Mengambil data...
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-[#112D4E]">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="Masukkan nama lengkap"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="rounded-xl border-[#DBE2EF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#112D4E]">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, phone: value });
                    }}
                    className="rounded-xl border-[#DBE2EF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#112D4E]">Status Penghuni</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({ ...formData, status: v as ResidentStatus })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-[#DBE2EF]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="tetap">Tetap</SelectItem>
                      <SelectItem value="kontrak">Kontrak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#DBE2EF] p-3">
                  <Label
                    htmlFor="is_married"
                    className="text-[#112D4E] cursor-pointer"
                  >
                    Sudah Menikah
                  </Label>
                  <Switch
                    id="is_married"
                    checked={formData.is_married}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_married: v })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#112D4E]">
                    Foto KTP{" "}
                    <span className="text-red-500 text-xs">
                      {editingResidentId ? "(Opsional)" : "*"}
                    </span>
                  </Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex flex-col items-center justify-center border-2 border-dashed border-[#DBE2EF] rounded-xl p-4 cursor-pointer hover:border-[#3F72AF]/40 transition-all bg-slate-50/50 overflow-hidden min-h-[140px]"
                  >
                    {previewUrl ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center bg-black/5">
                        <img
                          src={previewUrl}
                          alt="Preview KTP"
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-[#3F72AF]/10 transition-colors">
                          <ImageIcon className="h-5 w-5 text-muted-foreground group-hover:text-[#3F72AF]" />
                        </div>
                        <p className="text-sm text-[#112D4E] font-medium">
                          Klik untuk unggah KTP
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG (Maks. 2MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl border-[#DBE2EF]"
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl min-w-[120px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingResidentId ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah Warga"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Residents Table */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#112D4E]">
            Daftar Warga {residents.length > 0 && `(${residents.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-[#3F72AF]/40" />
              <p className="mt-4 text-sm text-muted-foreground">
                Memuat data warga...
              </p>
            </div>
          ) : filteredResidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-[#DBE2EF]/40 flex items-center justify-center mb-4">
                <UserX className="h-8 w-8 text-[#3F72AF]/50" />
              </div>
              <p className="text-[#112D4E] font-medium mb-1">
                Belum ada data warga
              </p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {searchQuery
                  ? "Tidak ditemukan warga yang sesuai pencarian."
                  : 'Klik tombol "Tambah Warga" untuk menambahkan data warga baru.'}
              </p>
            </div>
          ) : (
            <div className="rounded-xl overflow-x-auto border border-[#DBE2EF]/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F9F7F7] hover:bg-[#F9F7F7] border-[#DBE2EF]/60">
                    <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                      Nama
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                      Telepon
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                      Pernikahan
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResidents.map((resident) => (
                    <TableRow
                      key={resident.id}
                      className="border-[#DBE2EF]/60 hover:bg-[#DBE2EF]/15 transition-colors"
                    >
                      <TableCell className="font-medium text-[#112D4E]">
                        {resident.full_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {resident.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`rounded-lg text-[10px] uppercase font-bold tracking-tight px-2 py-0.5 ${
                            resident.status === "tetap"
                              ? "bg-[#3F72AF]/10 text-[#3F72AF] hover:bg-[#3F72AF]/10"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-50"
                          }`}
                        >
                          {resident.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <UserCheck
                            className={`h-4 w-4 ${
                              Boolean(resident.is_married)
                                ? "text-emerald-500"
                                : "text-gray-300"
                            }`}
                          />
                          <span className="text-sm text-muted-foreground">
                            {Boolean(resident.is_married) ? "Menikah" : "Belum"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(resident.id)}
                          className="h-8 w-8 p-0 rounded-lg text-[#3F72AF] hover:bg-[#3F72AF]/10 hover:text-[#3F72AF]"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConfirmDelete(resident.id)}
                          className="rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-500"
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
      <ConfirmModal
        isOpen={isConfirmDelete}
        onClose={() => !isSubmitting && setIsConfirmDelete(false)}
        onConfirm={handleDelete}
        header={
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Hapus Warga
          </div>
        }
        body="Apakah Anda yakin ingin menghapus data warga ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus riwayat yang terkait."
        footer={
          <DialogFooter className="gap-2 sm:gap-0 mt-4 space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDelete(false)}
              disabled={isSubmitting}
              className="rounded-xl border-[#DBE2EF] flex-1 sm:flex-none"
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
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
