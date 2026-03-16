import { useEffect, useState, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";
import { useApi } from "../utils/api";
import NoData from "./NoData";
import { Loading } from "./Loading";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DesempenhoArea {
  area_conhecimento: string;
  area_conhecimento_label: string;
  total_questoes: number;
  total_respostas: number;
  total_acertos: number;
  percentual_acertos: number;
  percentual_erros: number;
}

const BAR_COLOR = {
  bg: "rgba(59, 130, 246, 0.8)",
  border: "rgba(59, 130, 246, 1)",
};

export default function GraficoArea() {
  const [dados, setDados] = useState<DesempenhoArea[]>([]);
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
      .get(`/api/dashboard/area-conhecimento-desempenho?${params.toString()}`)
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
        console.error("Erro ao carregar desempenho por área de conhecimento", err);
        setDados([]);
        setLoading(false);
      });
  }, [filtros]);

  const getChartData = useCallback(() => {
    return {
      labels: dados.map((area) => area.area_conhecimento_label),
      datasets: [
        {
          label: "Percentual de Acertos (%)",
          data: dados.map((area) => area.percentual_acertos),
          backgroundColor: BAR_COLOR.bg,
          borderColor: BAR_COLOR.border,
          borderWidth: 0,
          borderRadius: { topRight: 8, bottomRight: 8, topLeft: 0, bottomLeft: 0 },
          borderSkipped: false as const,
          barPercentage: 0.7,
          categoryPercentage: 0.85,
          hoverBackgroundColor: BAR_COLOR.border,
        },
      ],
    };
  }, [dados]);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },
    onHover: (_event, elements, chart) => {
      chart.canvas.style.cursor = elements.length > 0 ? "pointer" : "default";
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      datalabels: {
        anchor: "end",
        align: "end",
        offset: 4,
        color: "#374151",
        font: {
          weight: "bold",
          size: 13,
        },
        formatter: (value: unknown) => {
          const num = Number(value);
          return isNaN(num) ? "" : `${num.toFixed(1)}%`;
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 14,
        cornerRadius: 10,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex;
            if (idx !== undefined && dados[idx]) {
              return dados[idx].area_conhecimento_label;
            }
            return "";
          },
          label: (context: TooltipItem<"bar">) => {
            const idx = context.dataIndex;
            const area = dados[idx];
            if (!area) return "";
            return ` Acertos: ${area.percentual_acertos.toFixed(1)}%`;
          },
          afterLabel: (context) => {
            const idx = context.dataIndex;
            const area = dados[idx];
            if (!area) return "";
            return [
              ` Erros: ${area.percentual_erros.toFixed(1)}%`,
              ` Questoes: ${area.total_questoes}`,
              ` Respostas: ${area.total_respostas}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Percentual de acertos (%)",
          color: "#9ca3af",
          font: { size: 11 },
        },
        ticks: {
          color: "#9ca3af",
          font: { size: 11 },
          callback: (value) => `${value}%`,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#374151",
          font: {
            size: 13,
            weight: "bold",
          },
          padding: 8,
        },
      },
    },
    layout: {
      padding: {
        right: 50,
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
      {/* Header */}
      <div className="px-7 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <AcademicCapIcon className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Desempenho por Area
            </h2>
            <p className="text-sm text-gray-400">
              Areas de conhecimento
            </p>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="px-7 py-6">
        {loading ? (
          <Loading />
        ) : dados.length === 0 ? (
          <NoData />
        ) : (
          <div style={{ height: Math.max(200, dados.length * 64) }}>
            <Bar data={getChartData()} options={options} plugins={[ChartDataLabels]} />
          </div>
        )}
      </div>
    </div>
  );
}
