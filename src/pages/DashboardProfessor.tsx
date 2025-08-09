import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { BuildingLibraryIcon, UsersIcon, DocumentTextIcon, ChartPieIcon, CalculatorIcon } from "@heroicons/react/24/solid";

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
      </div>
    </>
  );
}
