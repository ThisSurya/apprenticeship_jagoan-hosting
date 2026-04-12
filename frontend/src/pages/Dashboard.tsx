import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Home,
  Users,
  TrendingUp,
  TrendingDown,
  Scale,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatRupiah } from "@/lib/format";
import api from "@/lib/api";
import type {
  APIResponse,
  FinancialSummaryResponse,
  HouseWithActiveResident,
} from "@/types";
import { toast } from "sonner";

export default function Dashboard() {
  const [houseStats, setHouseStats] = useState({ total: 0, occupied: 0 });
  const [financialSummary, setFinancialSummary] =
    useState<FinancialSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch House Stats
      const housesRes = await api.get<APIResponse<HouseWithActiveResident[]>>(
        "/house-resident-histories",
      );
      if (housesRes.data.success) {
        const rawData = housesRes.data.data;
        setHouseStats({
          total: rawData.length,
          occupied: rawData.filter((h) => h.active_resident !== null).length,
        });
      }

      // Fetch Financial Summary (default year)
      const summaryRes = await api.get<FinancialSummaryResponse>(
        "/reports/summary",
        {
          params: { year: new Date().getFullYear() },
        },
      );
      if (summaryRes.data.success) {
        setFinancialSummary(summaryRes.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Gagal mengambil data dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Find current month data for cards
  const currentMonthData = useMemo(() => {
    if (!financialSummary?.data?.report) return null;
    const currentMonthName = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(new Date());
    return (
      financialSummary.data.report.find((d) => d.month === currentMonthName) ||
      financialSummary.data.report[financialSummary.data.report.length - 1]
    );
  }, [financialSummary]);

  const summaryCards = [
    {
      title: "Total Rumah",
      value: houseStats.total,
      icon: Home,
      color: "bg-[#3F72AF]",
      textColor: "text-[#3F72AF]",
      bgLight: "bg-[#3F72AF]/10",
      format: "number" as const,
    },
    {
      title: "Rumah Dihuni",
      value: houseStats.occupied,
      icon: Users,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bgLight: "bg-emerald-50",
      format: "number" as const,
    },
    {
      title: "Pemasukan Bulan Ini",
      value: currentMonthData?.pemasukan || 0,
      icon: TrendingUp,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgLight: "bg-blue-50",
      format: "currency" as const,
    },
    {
      title: "Pengeluaran Bulan Ini",
      value: currentMonthData?.pengeluaran || 0,
      icon: TrendingDown,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgLight: "bg-orange-50",
      format: "currency" as const,
    },
    {
      title: "Saldo Bulan Ini",
      value: currentMonthData?.saldo || 0,
      icon: Scale,
      color: "bg-[#112D4E]",
      textColor: "text-[#112D4E]",
      bgLight: "bg-[#112D4E]/10",
      format: "currency" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {summaryCards.map((card) => (
          <Card
            key={card.title}
            className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl bg-white"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${card.bgLight}`}>
                  <card.icon className={`h-5 w-5 ${card.textColor}`} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
              <p className={`text-xl font-bold ${card.textColor}`}>
                {isLoading ? (
                  <span className="opacity-20 animate-pulse">...</span>
                ) : card.format === "currency" ? (
                  formatRupiah(card.value)
                ) : (
                  card.value
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[#112D4E]">
            Pemasukan vs Pengeluaran (Tahun{" "}
            {financialSummary?.year || new Date().getFullYear()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#3F72AF]/20" />
                <p className="text-sm text-muted-foreground mt-2">
                  Memuat grafik...
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialSummary?.data?.report || []} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#DBE2EF"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#112D4E" }}
                    axisLine={{ stroke: "#DBE2EF" }}
                    tickFormatter={(v) => v.substring(0, 3)}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#112D4E" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      `${(v / 1000000).toFixed(1)}jt`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      padding: "12px 16px",
                    }}
                    formatter={(value) => [formatRupiah(Number(value)), ""]}
                    labelStyle={{
                      fontWeight: 600,
                      color: "#112D4E",
                      marginBottom: 4,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
                  />
                  <Bar
                    dataKey="pemasukan"
                    name="Pemasukan"
                    fill="#3F72AF"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="pengeluaran"
                    name="Pengeluaran"
                    fill="#F97316"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
