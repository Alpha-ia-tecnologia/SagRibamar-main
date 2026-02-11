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
import { BookOpenIcon } from "@heroicons/react/24/outline";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DesempenhoComponente {
  componente_id: number;
  componente_nome: string;
  total_questoes: number;
  total_respostas: number;
  total_acertos: number;
  percentual_acertos: number;
}

export const GraficoComponentesCurriculares = () => {
  const [dados, setDados] = useState<DesempenhoComponente[]>([]);
  const [loading, setLoading] = useState(false);
  const { filtros } = useFiltroDashboard();
  const api = useApi();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
    if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
    if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
    if (filtros.serie) params.append("serie", filtros.serie);
    if (filtros.turmaId) params.append("turma_id", filtros.turmaId);
    if (filtros.provaId) params.append("prova_id", filtros.provaId);

    api
      .get(
        `/api/dashboard/componentes-curriculares-desempenho?${params.toString()}`
      )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDados(data);
        } else {
          setDados([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          "Erro ao carregar desempenho de componentes curriculares",
          err
        );
        setDados([]);
        setLoading(false);
      });
  }, [filtros]);

  const chartData = {
    labels: dados.map((item) => item.componente_nome),
    datasets: [
      {
        label: "Percentual de Acertos (%)",
        data: dados.map((item) => item.percentual_acertos),
        backgroundColor: "rgba(236, 72, 153, 0.7)",
        borderColor: "rgba(236, 72, 153, 1)",
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
        max: 100,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        title: { display: true, text: "Percentual de Acertos (%)", color: "#6b7280" },
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
          <div className="p-2 bg-pink-50 rounded-lg">
            <BookOpenIcon className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Componentes Curriculares</h2>
            <p className="text-sm text-gray-500">Análise por disciplina</p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {loading ? (
          <Loading />
        ) : dados.length === 0 ? (
          <NoData />
        ) : (
          <div className="h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};
