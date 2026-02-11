import { useEffect, useState } from "react";
import {
  BuildingLibraryIcon,
  UsersIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ChartPieIcon,
  CalculatorIcon
} from "@heroicons/react/24/outline";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";
import { useApi } from "../utils/api";

interface Statistics {
  total_escolas: number;
  total_turmas: number;
  total_alunos: number;
  total_provas: number;
  participacao: number;
  media_geral: number;
}

export const DashboardResumo = () => {
  const { filtros } = useFiltroDashboard();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    const queryParams = new URLSearchParams();

    if (filtros.regiaoId) queryParams.append("regiao_id", filtros.regiaoId);
    if (filtros.grupoId) queryParams.append("grupo_id", filtros.grupoId);
    if (filtros.escolaId) queryParams.append("escola_id", filtros.escolaId);
    if (filtros.serie) queryParams.append("serie", filtros.serie);
    if (filtros.turmaId) queryParams.append("turma_id", filtros.turmaId);
    if (filtros.provaId) queryParams.append("prova_id", filtros.provaId);

    setLoading(true);

    api.get(`/api/dashboard/statistics?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar estatísticas:", err);
        setLoading(false);
      });
  }, [filtros]);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded mb-2" />
            <div className="w-16 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Escolas",
      valor: stats.total_escolas ?? 0,
      icon: BuildingLibraryIcon,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      trend: null
    },
    {
      label: "Turmas",
      valor: stats.total_turmas ?? 0,
      icon: UsersIcon,
      gradient: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
      trend: null
    },
    {
      label: "Alunos",
      valor: stats.total_alunos ?? 0,
      icon: AcademicCapIcon,
      gradient: "from-violet-500 to-violet-600",
      bgLight: "bg-violet-50",
      textColor: "text-violet-600",
      trend: null
    },
    {
      label: "Provas",
      valor: stats.total_provas ?? 0,
      icon: DocumentTextIcon,
      gradient: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
      trend: null
    },
    {
      label: "Participação",
      valor: typeof stats.participacao === "number" ? stats.participacao.toFixed(1) : "0",
      suffix: "%",
      icon: ChartPieIcon,
      gradient: "from-rose-500 to-rose-600",
      bgLight: "bg-rose-50",
      textColor: "text-rose-600",
      trend: stats.participacao >= 70 ? "up" : "down"
    },
    {
      label: "Média Geral",
      valor: typeof stats.media_geral === "number" ? stats.media_geral.toFixed(1) : "0.0",
      icon: CalculatorIcon,
      gradient: "from-indigo-500 to-indigo-600",
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-600",
      trend: Math.round(stats.media_geral * 10) / 10 >= 7 ? "up" : "down"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bgLight} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              {card.trend && (
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  card.trend === "up"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}>
                  {card.trend === "up" ? (
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-3 h-3" />
                  )}
                  {card.trend === "up" ? "Bom" : "Baixo"}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {typeof card.valor === "number" ? card.valor.toLocaleString("pt-BR") : card.valor}
                {card.suffix && <span className="text-lg text-gray-500 ml-0.5">{card.suffix}</span>}
              </p>
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
