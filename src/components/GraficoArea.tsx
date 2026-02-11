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
import type { ChartOptions, TooltipItem } from "chart.js";
import NoData from "./NoData";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const dados = {
  areas: [
    { nome: "Humanas", desempenho: 80 },
    { nome: "Exatas", desempenho: 50 },
    { nome: "Natureza", desempenho: 20 },
    { nome: "Linguagens", desempenho: 30 },
  ],
};

const semdados = {
  areas2: [] as { nome: string; desempenho: number }[]
};

export default function GraficoArea() {
  const chartData = {
    labels: dados.areas.map((area) => area.nome),
    datasets: [
      {
        label: "Percentual de Acertos (%)",
        data: dados.areas.map((area) => area.desempenho),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            return `${context.dataset.label}: ${context.formattedValue}%`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        title: {
          display: true,
          text: "Percentual de acertos (%)",
          color: "#6b7280",
        },
      },
      y: {
        grid: {
          display: false,
        },
        title: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <AcademicCapIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Desempenho por Área</h2>
            <p className="text-sm text-gray-500">Áreas de conhecimento</p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {semdados.areas2.length === 0 ? (
          <NoData />
        ) : (
          <div className="h-64">
            <Bar data={chartData} options={options} />
          </div>
        )}
      </div>
    </div>
  );
}
