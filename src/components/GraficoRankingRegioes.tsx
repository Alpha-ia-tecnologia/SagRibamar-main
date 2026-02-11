import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";
import { useApi } from "../utils/api";
import NoData from "./NoData";
import { Loading } from "./Loading";
import { MapPinIcon } from "@heroicons/react/24/outline";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RegiaoDesempenho {
  regiao_id: number;
  regiao_nome: string;
  media_desempenho: number;
}

interface EstatisticasGerais {
  total_regioes: number;
  media_geral: number;
  melhor_regiao: string;
  pior_regiao?: string;
}

export const GraficoRankingRegioes = () => {
  const [dadosRegioes, setDadosRegioes] = useState<RegiaoDesempenho[]>([]);
  const [loading, setLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais>({
    total_regioes: 0,
    media_geral: 0,
    melhor_regiao: "",
  });

  const { filtros } = useFiltroDashboard();
  const api = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
        if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
        if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
        if (filtros.serie) params.append("serie", filtros.serie);
        if (filtros.turmaId) params.append("turma_id", filtros.turmaId);
        if (filtros.provaId) params.append("prova_id", filtros.provaId); // ✅ corrigido

        const res = await api.get(
          `/api/dashboard/regional-performance?${params.toString()}`
        );
        const data = await res.json();

        setDadosRegioes(data.dados_grafico || []);
        setEstatisticas(data.estatisticas_gerais || {});
      } catch (error) {
        setLoading(false);
        console.error("Erro ao buscar dados de desempenho por região", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filtros]);

  const chartData = {
    labels: dadosRegioes.map((r) => r.regiao_nome),
    datasets: [
      {
        label: "Desempenho por Região",
        data: dadosRegioes.map((r) => r.media_desempenho),
        backgroundColor: "rgba(251, 191, 36, 0.7)",
        borderColor: "rgba(251, 191, 36, 1)",
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        title: { display: true, text: "Desempenho", color: "#6b7280" },
      },
      x: {
        grid: { display: false },
        title: { display: false },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <MapPinIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Ranking das Regioes</h2>
            <p className="text-sm text-gray-500">Desempenho por localidade</p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {loading ? (
          <Loading />
        ) : dadosRegioes.length === 0 ? (
          <NoData />
        ) : (
          <>
            <div className="h-48 mb-6">
              <Bar data={chartData} options={chartOptions} />
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-lg font-bold text-gray-900">{estatisticas.total_regioes}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Média Geral</p>
                <p className="text-lg font-bold text-blue-600">
                  {estatisticas.media_geral?.toFixed(1) || "0.0"}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Melhor</p>
                <p className="text-sm font-bold text-emerald-600 truncate">
                  {estatisticas.melhor_regiao || "-"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
