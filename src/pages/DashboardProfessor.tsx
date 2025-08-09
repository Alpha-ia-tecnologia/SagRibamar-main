import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { BuildingLibraryIcon, UsersIcon, DocumentTextIcon, ChartPieIcon, CalculatorIcon } from "@heroicons/react/24/solid";
import { Bar } from "react-chartjs-2";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardProfessor() {
  // Dados fakes
  const stats = {
    total_turmas: 264,
    total_alunos: 6430,
    total_provas: 3,
    participacao: 87.44,
    media_geral: 5.26,
  };

  const cards = [
    {
      label: "Turmas",
      valor: stats.total_turmas ?? 0,
      icon: <BuildingLibraryIcon className="w-6 h-6 text-blue-700" />,
      bg: "bg-blue-100"
    },
    {
      label: "Alunos",
      valor: stats.total_alunos ?? 0,
      icon: <UsersIcon className="w-6 h-6 text-green-700" />,
      bg: "bg-green-100"
    },
    {
      label: "Provas",
      valor: stats.total_provas ?? 0,
      icon: <DocumentTextIcon className="w-6 h-6 text-yellow-700" />,
      bg: "bg-yellow-100"
    },
    {
      label: "Participação",
      valor: `${stats.participacao.toFixed(2)}%`,
      icon: <ChartPieIcon className="w-6 h-6 text-red-700" />,
      bg: "bg-red-100"
    },
    {
      label: "Média Geral",
      valor: stats.media_geral.toFixed(2),
      icon: <CalculatorIcon className="w-6 h-6 text-indigo-700" />,
      bg: "bg-indigo-100"
    }
  ];

  // Dados falsos para o gráfico
  const [dados, setDados] = useState([
    { prova_nome: "Prova 1", percentual_acertos: 72 },
    { prova_nome: "Prova 2", percentual_acertos: 76 },
    { prova_nome: "Prova 3", percentual_acertos: 70 },
  ]);

  const chartData = {
    labels: dados.map((item) => item.prova_nome),
    datasets: [
      {
        label: "Percentual de Acertos (%)",
        data: dados.map((item) => item.percentual_acertos),
        backgroundColor: "rgba(139, 92, 246, 0.5)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: false,
        text: "Desempenho por Avaliação",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Percentual de acertos (%)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Avaliações",
        },
      },
    },
  };

  return (
    <>
      <Header />
      <div className="pt-20 p-12 bg-gray-100 min-h-screen">
        <PageHeader
          title="Dashboard"
          description="Visão geral do Sistema de Avaliação e Gerenciamento"
        />
        
        {/* Seção de resumo (Turmas, Alunos, Provas, Participação, Média Geral) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bg}`}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="text-xl font-semibold text-gray-800">{card.valor}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico de Desempenho das Avaliações */}
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Notas Médias por Avaliação
          </h2>
          {dados.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum dado encontrado com os filtros aplicados.</p>
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>
      </div>
    </>
  );
}
