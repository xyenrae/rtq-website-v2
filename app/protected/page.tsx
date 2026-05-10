import { ChartSebaranRekomendasi } from "@/components/card/ChartSebaranRekomendasi";
import { ChartVisitor } from "@/components/card/ChartVisitor";
import { DashboardStatsCards } from "@/components/card/DashboardStatsCards";
import { TableKontenTerkini } from "@/components/card/TableKontenTerkini";
import { TableSantriPerhatian } from "@/components/card/TableSantriPerhatian";

export default function ProtectedPage() {
  return (
    <div className="flex flex-col gap-4 pb-8 lg:gap-6">
      {/* ── Header ── */}
      <div className="px-4 lg:px-6">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Ringkasan operasional&nbsp;
          <span className="font-medium text-foreground">hari ini</span>
        </p>
      </div>

      {/* ── Section 1: Kartu Statistik ── */}
      <DashboardStatsCards />

      {/* ── Section 2: Grafik utama (Rekomendasi + Visitor) ── */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:gap-6 lg:px-6">
        <ChartSebaranRekomendasi />
        <ChartVisitor />
      </div>

      {/* ── Section 3: Tabel (Santri Perhatian + Konten Terkini) ── */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:gap-6 lg:px-6">
        <TableSantriPerhatian />
        <TableKontenTerkini />
      </div>
    </div>
  )
}
