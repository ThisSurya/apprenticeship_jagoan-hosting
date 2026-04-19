import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  LayoutGrid,
  List,
  Users,
  ArrowRight,
  Plus,
  Loader2,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  House,
  HouseWithActiveResident,
  APIResponse,
  HouseStatus,
} from "@/types";
import api from "@/lib/api";
import { toast } from "sonner";
import ConfirmModal from "@/components/ConfirmModal";

export default function Houses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [houses, setHouses] = useState<HouseWithActiveResident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newHouse, setNewHouse] = useState({
    house_number: "",
    status: "tidak_dihuni" as HouseStatus,
  });

  const handleConfirmDelete = (id: number) => {
    setDeleteId(id);
    setIsConfirmDelete(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/houses/${deleteId}`);
      toast.success("Rumah berhasil dihapus");
      fetchHouses();
    } catch (error: any) {
      console.error("Error deleting house:", error);
      toast.error(error.response?.data?.message || "Gagal menghapus rumah");
    } finally {
      setIsSubmitting(false);
      setIsConfirmDelete(false);
      setDeleteId(null);
    }
  };

  const fetchHouses = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<APIResponse<HouseWithActiveResident[]>>(
        "/house-resident-histories",
      );
      if (response.data.success) {
        setHouses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching houses:", error);
      toast.error("Gagal mengambil data rumah");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const handleAddHouse = async () => {
    if (!newHouse.house_number.trim()) {
      toast.error("Nomor rumah wajib diisi");
      return;
    }

    setIsAdding(true);
    try {
      const response = await api.post<APIResponse<House>>("/houses", newHouse);
      if (response.data.success) {
        toast.success("Rumah berhasil ditambahkan");
        setIsDialogOpen(false);
        setNewHouse({ house_number: "", status: "tidak_dihuni" });
        fetchHouses();
      }
    } catch (error: any) {
      console.error("Error adding house:", error);
      const message =
        error.response?.data?.message || "Nomor rumah mungkin sudah terdaftar";
      toast.error(message);
    } finally {
      setIsAdding(false);
    }
  };

  const filteredHouses = houses.filter(
    (h) =>
      h.house_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.active_resident?.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const occupiedCount = houses.filter((h) => h.status === "dihuni").length;
  const emptyCount = houses.filter((h) => h.status === "tidak_dihuni").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-[#3F72AF]/10">
              <Home className="h-5 w-5 text-[#3F72AF]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Rumah</p>
              <p className="text-xl font-bold text-[#112D4E]">
                {houses.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-50">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dihuni</p>
              <p className="text-xl font-bold text-emerald-600">
                {occupiedCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-orange-50">
              <Home className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kosong</p>
              <p className="text-xl font-bold text-orange-500">{emptyCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor rumah atau penghuni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-[#DBE2EF] focus-visible:ring-[#3F72AF]/30 bg-white"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Rumah
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl border-[#DBE2EF]">
              <DialogHeader>
                <DialogTitle className="text-[#112D4E]">
                  Tambah Rumah Baru
                </DialogTitle>
                <DialogDescription>
                  Masukkan detail rumah baru untuk ditambahkan ke dalam sistem.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="house_number">Nomor Rumah</Label>
                  <Input
                    id="house_number"
                    placeholder="Contoh: A-01"
                    value={newHouse.house_number}
                    onChange={(e) =>
                      setNewHouse({ ...newHouse, house_number: e.target.value })
                    }
                    className="rounded-xl border-[#DBE2EF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status Awal</Label>
                  <Select
                    value={newHouse.status}
                    disabled
                    onValueChange={(v) =>
                      setNewHouse({ ...newHouse, status: v as HouseStatus })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-[#DBE2EF]">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="dihuni">Dihuni</SelectItem>
                      <SelectItem value="tidak_dihuni">Kosong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-xl border-[#DBE2EF]"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleAddHouse}
                  disabled={isAdding}
                  className="bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white rounded-xl min-w-[100px]"
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "grid" | "table")}
        >
          <TabsList className="bg-[#DBE2EF]/40 rounded-xl">
            <TabsTrigger
              value="grid"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-[#3F72AF]/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            Memuat data rumah...
          </p>
        </div>
      ) : /* Grid View */
      viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredHouses.map((house) => (
            <Card
              key={house.id}
              className="border-0 shadow-sm rounded-2xl bg-white hover:shadow-md transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/rumah/${house.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        house.status === "dihuni"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-orange-50 text-orange-500"
                      }`}
                    >
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#112D4E]">
                        {house.house_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={house.status === "dihuni"}
                      className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmDelete(house.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Badge
                      variant="secondary"
                      className={`rounded-lg text-[10px] uppercase font-bold px-2 py-0.5 ${
                        house.status === "dihuni"
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                          : "bg-orange-50 text-orange-700 hover:bg-orange-50"
                      }`}
                    >
                      {house.status === "dihuni" ? "Dihuni" : "Kosong"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    {house.active_resident ? (
                      <p className="text-sm text-muted-foreground truncate">
                        {house.active_resident.full_name}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic">
                        Belum ada penghuni
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-[#3F72AF] transition-colors shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#112D4E]">
              Daftar Rumah ({filteredHouses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl overflow-hidden border border-[#DBE2EF]/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F9F7F7] hover:bg-[#F9F7F7] border-[#DBE2EF]/60">
                    <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                      Nomor Rumah
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider">
                      Penghuni
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#112D4E]/70 uppercase tracking-wider text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHouses.map((house) => (
                    <TableRow
                      key={house.id}
                      className="border-[#DBE2EF]/60 hover:bg-[#DBE2EF]/15 transition-colors cursor-pointer"
                      onClick={() => navigate(`/rumah/${house.id}`)}
                    >
                      <TableCell className="font-medium text-[#112D4E]">
                        {house.house_number}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`rounded-lg text-[10px] uppercase font-bold px-2 py-0.5 ${
                            house.status === "dihuni"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                              : "bg-orange-50 text-orange-700 hover:bg-orange-50"
                          }`}
                        >
                          {house.status === "dihuni" ? "Dihuni" : "Kosong"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {house.active_resident ? (
                          house.active_resident.full_name
                        ) : (
                          <span className="text-muted-foreground/50 italic">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmDelete(house.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-[#3F72AF] hover:bg-[#3F72AF]/10 hover:text-[#3F72AF]"
                            onClick={() => navigate(`/rumah/${house.id}`)}
                          >
                            Detail
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmModal
        isOpen={isConfirmDelete}
        onClose={() => !isSubmitting && setIsConfirmDelete(false)}
        onConfirm={handleDelete}
        header={
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Hapus Rumah
          </div>
        }
        body="Apakah Anda yakin ingin menghapus data rumah ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua riwayat yang terkait."
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
