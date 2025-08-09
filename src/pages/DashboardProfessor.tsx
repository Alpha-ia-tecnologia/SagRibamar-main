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

// Dados fictícios para ranking de alunos
const alunosFakes = Array.from({ length: 100 }, (_, index) => ({
  aluno_id: index + 1,
  aluno_nome: `Aluno ${index + 1}`,
  turma_id: 1,
  turma_nome: "Turma A",
  escola_id: 1,
  escola_nome: `Escola ${index % 5 + 1}`,
  regiao_id: 1,
  grupo_id: 1,
  regiao_nome: "Região 1",
  grupo_nome: "Grupo 1",
  total_desempenhos: Math.floor(Math.random() * 10) + 1,
  media_geral: Math.random() * 100,
  maior_nota: Math.random() * 10,
  menor_nota: Math.random() * 10,
}));

export default function DashboardProfessor() {
  const [selecionada, setSelecionada] = useState(null);
  const [filtroOrdem, setFiltroOrdem] = useState<"acertos" | "erros">("acertos");

  // Filtros
  const [escolaId, setEscolaId] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [alunoId, setAlunoId] = useState("");
  const [provaId, setProvaId] = useState("");

  const [page, setPage] = useState(1);
  const itemsPerPage = 10; // Altere o número de alunos por página, se necessário
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const alunosParaExibir = alunosFakes.slice(startIndex, endIndex);

  const renderPagination = () => {
    const totalPages = Math.ceil(alunosFakes.length / itemsPerPage);
    const buttons = [];

    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 rounded-md text-sm border transition ${
            page === i
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  const handleAplicarFiltros = () => {
    console.log("Filtros aplicados:", {
      escolaId,
      turmaId,
      alunoId,
      provaId,
    });
  };

  return (
    <>
      <Header />
      <div className="pt-20 p-12 bg-gray-100 min-h-screen">
        <PageHeader
          title="Dashboard"
          description="Visão geral do Sistema de Avaliação e Gerenciamento"
        />

        {/* Filtros Fake Implementados Aqui */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h3 className="text-lg font-semibold mb-2">Filtro de Avaliações</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro de Escola */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Escola</label>
              <select
                className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={escolaId}
                onChange={(e) => setEscolaId(e.target.value)}
              >
                <option value="">Selecione uma escola</option>
                <option value="1">Escola A</option>
                <option value="2">Escola B</option>
              </select>
            </div>

            {/* Filtro de Turma */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Turma</label>
              <select
                className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={turmaId}
                onChange={(e) => setTurmaId(e.target.value)}
              >
                <option value="">Selecione uma turma</option>
                <option value="1">Turma A</option>
                <option value="2">Turma B</option>
              </select>
            </div>

            {/* Filtro de Alunos */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Aluno</label>
              <select
                className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value)}
              >
                <option value="">Selecione um aluno</option>
                {alunosFakes.map((aluno) => (
                  <option key={aluno.aluno_id} value={aluno.aluno_id}>
                    {aluno.aluno_nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Provas */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Prova</label>
              <select
                className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={provaId}
                onChange={(e) => setProvaId(e.target.value)}
              >
                <option value="">Selecione uma prova</option>
                <option value="1">Prova 1</option>
                <option value="2">Prova 2</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAplicarFiltros}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Aplicar Filtros
          </button>
        </div>

        {/* Seção de resumo (Turmas, Alunos, Provas, Participação, Média Geral) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
          {[
            { label: "Turmas", valor: stats.total_turmas ?? 0, icon: <BuildingLibraryIcon className="w-6 h-6 text-blue-700" />, bg: "bg-blue-100" },
            { label: "Alunos", valor: stats.total_alunos ?? 0, icon: <UsersIcon className="w-6 h-6 text-green-700" />, bg: "bg-green-100" },
            { label: "Provas", valor: stats.total_provas ?? 0, icon: <DocumentTextIcon className="w-6 h-6 text-yellow-700" />, bg: "bg-yellow-100" },
            { label: "Participação", valor: `${stats.participacao.toFixed(2)}%`, icon: <ChartPieIcon className="w-6 h-6 text-red-700" />, bg: "bg-red-100" },
            { label: "Média Geral", valor: stats.media_geral.toFixed(2), icon: <CalculatorIcon className="w-6 h-6 text-indigo-700" />, bg: "bg-indigo-100" }
          ].map((card, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bg}`}>
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
          </div>

          {/* Cards de habilidades BNCC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {habilidadesBNCC.map((h) => {
              const percentual = parseFloat(h.percentual_acertos as any);
              const pct = isNaN(percentual) ? "0.00%" : percentual.toFixed(2) + "%";
              let bgColor = "bg-green-100 text-green-800";
              if (percentual < 70) bgColor = "bg-yellow-100 text-yellow-800";

              return (
                <button
                  key={h.bncc_id}
                  onClick={() => setSelecionada(h)}
                  className={`${bgColor} p-4 rounded-lg text-left shadow hover:shadow-md transition`}
                >
                  <p className="font-bold text-sm">{h.bncc_codigo}</p>
                  <p className="text-2xl font-extrabold">{pct}</p>
                  <p className="text-xs text-gray-600">{h.total_questoes} {h.total_questoes > 1 ? "questões" : "questão"}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gráfico de desempenho das provas */}
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Notas Médias por Avaliação</h2>
          <Bar data={chartData} options={options} />
        </div>

        {/* Ranking de Alunos */}
        <div className="p-6 bg-white rounded-xl shadow mt-6">
          <h2 className="text-xl font-semibold mb-5 text-gray-800">🏅 Ranking de Alunos</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Posição</th>
                  <th className="px-4 py-3">Aluno</th>
                  <th className="px-4 py-3">Escola</th>
                  <th className="px-4 py-3">Turma</th>
                  <th className="px-4 py-3">Desempenho</th>
                  <th className="px-4 py-3">Notas</th>
                </tr>
              </thead>
              <tbody>
                {alunosParaExibir.map((aluno, index) => {
                  const posicao = startIndex + index + 1;
                  const bg = posicao === 1 ? "bg-yellow-100" : posicao <= 3 ? "bg-yellow-50" : "hover:bg-gray-50";
                  return (
                    <tr key={aluno.aluno_id} className={`${bg} border-b transition`}>
                      <td className="px-4 py-3 font-medium text-gray-800">{posicao}º</td>
                      <td className="px-4 py-3">{aluno.aluno_nome}</td>
                      <td className="px-4 py-3">{aluno.escola_nome}</td>
                      <td className="px-4 py-3">{aluno.turma_nome}</td>
                      <td className="px-4 py-3 text-blue-700 font-semibold">
                        {aluno.media_geral.toFixed(1)}%
                        <span className="text-gray-400 text-xs ml-1">({aluno.total_desempenhos} avaliações)</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {aluno.maior_nota} / {aluno.menor_nota}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
            <p className="text-sm text-gray-500">
              Mostrando {(startIndex + 1)} a {Math.min(endIndex, alunosFakes.length)} de {alunosFakes.length} alunos
            </p>
            <div className="flex gap-1 items-center">{renderPagination()}</div>
          </div>
        </div>
      </div>
    </>
  );
}
