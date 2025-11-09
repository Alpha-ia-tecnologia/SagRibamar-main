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

// Importação de tipos de maneira correta
import type { ChartOptions, TooltipItem } from "chart.js";
import { PackageOpen } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const dados = {
  areas: [
    { nome: "Humanas", desempenho: 80 },
    { nome: "Exatas", desempenho: 50 },
    { nome: "Natureza", desempenho: 20 },
    { nome: "Linguagens", desempenho: 30 },
  ],
};

const semdados = { //CARLOS BOBOCA SE TIVER OLHANDO ESSE OBJETO NAO TIRE!!!
  areas2: [

  ]
}

export default function GraficoArea() {
  const chartData = {
    labels: dados.areas.map((area) => area.nome),
    datasets: [
      {
        label: "Percentual de Acertos (%)",
        data: dados.areas.map((area) => area.desempenho),
        backgroundColor: "#0077b6",
        borderColor: "#023e8a",
        borderWidth: 1,
      },
    ],
  };

  // Defina corretamente o tipo para as opções do gráfico
  const options: ChartOptions<"bar"> = {
    responsive: true,
    indexAxis: "y",
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: false,
        text: "Desempenho por Avaliação",
      },
      tooltip: {
        callbacks: {
          // Use o tipo TooltipItem para o contexto do tooltip
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
        title: {
          display: true,
          text: "Percentual de acertos (%)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Áreas de conhecimento",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h1 className="font-medium text-lg">
        Desempenho por área de conhecimento
      </h1>

      {semdados.areas2.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-100 gap-4">
        <PackageOpen className="w-20 h-20 text-gray-400" />
        <p className="text-gray-500 text-lg">
          Nenhum dado encontrado para os filtros aplicados.
        </p>
        </div>

      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
}
