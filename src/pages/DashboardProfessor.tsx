import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { BuildingLibraryIcon, UsersIcon, DocumentTextIcon, ChartPieIcon, CalculatorIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
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

// Dados fakes para o Dashboard
const stats = {
  total_turmas: 264,
  total_alunos: 6430,
  total_provas: 5,
  participacao: 87.44,
  media_geral: 5.26,
};

// Dados das Habilidades BNCC
const habilidadesBNCC = [
  {
    bncc_id: 1,
    bncc_codigo: "2LP-A.2",
    bncc_descricao: "Compreensão e produção de textos.",
    bncc_serie: "2ª Série",
    componente_curricular_nome: "Linguagens",
    total_questoes: 3,
    total_respostas: 3,
    total_acertos: 3,
    percentual_acertos: 89.08,
  },
  {
    bncc_id: 2,
    bncc_codigo: "2LP-L.3",
    bncc_descricao: "Leitura e interpretação de textos.",
    bncc_serie: "2ª Série",
    componente_curricular_nome: "Linguagens",
    total_questoes: 1,
    total_respostas: 1,
    total_acertos: 1,
    percentual_acertos: 79.45,
  },
  {
    bncc_id: 3,
    bncc_codigo: "5G1.3",
    bncc_descricao: "Raciocínio lógico e resolução de problemas.",
    bncc_serie: "5ª Série",
    componente_curricular_nome: "Matemática",
    total_questoes: 3,
    total_respostas: 3,
    total_acertos: 2,
    percentual_acertos: 74.23,
  },
  {
    bncc_id: 4,
    bncc_codigo: "5G1.4",
    bncc_descricao: "Compreensão e resolução de problemas matemáticos.",
    bncc_serie: "5ª Série",
    componente_curricular_nome: "Matemática",
    total_questoes: 4,
    total_respostas: 4,
    total_acertos: 3,
    percentual_acertos: 82.5,
  },
  {
    bncc_id: 5,
    bncc_codigo: "8LP-B.1",
    bncc_descricao: "Análise de textos literários.",
    bncc_serie: "8ª Série",
    componente_curricular_nome: "Linguagens",
    total_questoes: 5,
    total_respostas: 5,
    total_acertos: 4,
    percentual_acertos: 95.6,
  },
  {
    bncc_id: 6,
    bncc_codigo: "8G1.2",
    bncc_descricao: "Sistemas numéricos e suas aplicações.",
    bncc_serie: "8ª Série",
    componente_curricular_nome: "Matemática",
    total_questoes: 5,
    total_respostas: 5,
    total_acertos: 3,
    percentual_acertos: 60.0,
  },
];

// Dados do gráfico de desempenho das provas
const desempenhoProvas = [
  { prova_nome: "Prova 1", percentual_acertos: 72 },
  { prova_nome: "Prova 2", percentual_acertos: 76 },
  { prova_nome: "Prova 3", percentual_acertos: 70 },
  { prova_nome: "Prova 4", percentual_acertos: 80 },
  { prova_nome: "Prova 5", percentual_acertos: 85 },
];

const chartData = {
  labels: desempenhoProvas.map((item) => item.prova_nome),
  datasets: [
    {
      label: "Percentual de Acertos (%)",
      data: desempenhoProvas.map((item) => item.percentual_acertos),
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

export default function DashboardProfessor() {
  const [selecionada, setSelecionada] = useState(null);
  const [filtroOrdem, setFiltroOrdem] = useState<"acertos" | "erros">("acertos");

  // Cards de Turmas, Alunos, etc.
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

        {/* Seção de Habilidades BNCC */}
        <div className="p-6 bg-white rounded-xl shadow-md mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Habilidades BNCC / SAEB</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFiltroOrdem("erros");
                }}
                className={`px-3 py-1 text-sm rounded ${
                  filtroOrdem === "erros"
                    ? "bg-red-500 text-white"
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
              >
                Mais Críticas
              </button>
              <button
                onClick={() => {
                  setFiltroOrdem("acertos");
                }}
                className={`px-3 py-1 text-sm rounded ${
                  filtroOrdem === "acertos"
                    ? "bg-green-500 text-white"
                    : "bg-green-100 text-green-600 hover:bg-green-200"
                }`}
              >
                Melhores Resultados
              </button>
            </div>
          </div>

          {/* Cards de habilidades BNCC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {habilidadesBNCC.map((h) => {
              const percentual = parseFloat(h.percentual_acertos as any);
              const pct = isNaN(percentual) ? "0.00%" : percentual.toFixed(2) + "%";

              let bgColor = "bg-green-100 text-green-800";
              if (percentual < 70) {
                bgColor = "bg-yellow-100 text-yellow-800";
              }

              return (
                <button
                  key={h.bncc_id}
                  onClick={() => setSelecionada(h)}
                  className={`${bgColor} p-4 rounded-lg text-left shadow hover:shadow-md transition`}
                >
                  <p className="font-bold text-sm">{h.bncc_codigo}</p>
                  <p className="text-2xl font-extrabold">{pct}</p>
                  <p className="text-xs text-gray-600">
                    {h.total_questoes} {h.total_questoes > 1 ? "questões" : "questão"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gráfico de desempenho das provas */}
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Notas Médias por Avaliação
          </h2>
          <Bar data={chartData} options={options} />
        </div>

        {/* Modal de detalhes da habilidade BNCC */}
        {selecionada && (
          <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg" role="dialog" aria-modal="true">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{selecionada.bncc_codigo}</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelecionada(null)}
                >
                  ✕
                </button>
              </div>

              <p><strong>Componente:</strong> {selecionada.componente_curricular_nome}</p>
              <p><strong>Série:</strong> {selecionada.bncc_serie}</p>
              <p><strong>Descrição:</strong> {selecionada.bncc_descricao}</p>
              <p><strong>Total de Questões:</strong> {selecionada.total_questoes}</p>
              <p><strong>Média de Desempenho:</strong> {parseFloat(selecionada.percentual_acertos as any).toFixed(2)}%</p>

              <div className="mt-4">
                <h4 className="font-semibold">Evolução do Desempenho</h4>
                <p className="text-gray-500 italic py-4 border rounded">
                  Não há dados históricos suficientes para exibir a evolução.
                </p>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold">Histórico Detalhado</h4>
                <table className="w-full text-sm text-left text-gray-700 mt-2">
                  <thead>
                    <tr>
                      <th className="py-2">Avaliação</th>
                      <th className="py-2">Data</th>
                      <th className="py-2">Desempenho</th>
                      <th className="py-2">Evolução</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">Média de {selecionada.total_questoes} questões</td>
                      <td className="py-2">Data não disponível</td>
                      <td className="py-2 text-green-600">
                        {parseFloat(selecionada.percentual_acertos as any).toFixed(2)}%
                      </td>
                      <td className="py-2">Primeira avaliação</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setSelecionada(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
