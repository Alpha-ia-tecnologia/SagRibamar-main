import { useEffect, useState } from "react";
import { useApi } from "../utils/api";

interface Escola {
  id: number;
  nome: string;
}

interface Turma {
  id: number;
  nome: string;
}

interface AlunoFilterProps {
  onFilter: (nome: string, escolaId: number | null, turmaId: number | null, serieId: string | null) => void;
}

export const AlunoFilter = ({ onFilter }: AlunoFilterProps) => {
  const [nome, setNome] = useState("");
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [escolaId, setEscolaId] = useState<number | "">("");
  const [turmaId, setTurmaId] = useState<number | "">("");
  const [serieId, setSerieId] = useState<string | "">("");
  const api = useApi();

  const serieNomes: Record<string, string> = {
    PRIMEIRO_ANO: "1° ano",
    SEGUNDO_ANO: "2° ano",
    TERCEIRO_ANO: "3° ano",
    QUARTO_ANO: "4° ano",
    QUINTO_ANO: "5° ano",
    SEXTO_ANO: "6° ano",
    SETIMO_ANO: "7° ano",
    OITAVO_ANO: "8° ano",
    NONO_ANO: "9° ano",
    PRIMEIRA_SERIE: "1ª série",
    SEGUNDA_SERIE: "2ª série",
    TERCEIRA_SERIE: "3ª série",
    EJA: "EJA",
    INFANTIL_I: "Infantil I",
    INFANTIL_II: "Infantil II",
    INFANTIL_III: "Infantil III",
    PRE_I: "Pré I",
    PRE_II: "Pré II",
    PRE_III: "Pré III",
    CRECHE: "Creche",
    TURMA_DE_HABILIDADES: "Turma Habilidades"
  };

  const todasSeries = Object.keys(serieNomes);

  useEffect(() => {
    const fetchEscolas = async () => {
      const res = await api.get(`/api/escolas?page=1&limit=200`);
      const data = await res.json();
      setEscolas(Array.isArray(data.data) ? data.data : data);
    };

    fetchEscolas();
  }, [api]);

  useEffect(() => {
    if (escolaId === "") {
      setTurmas([]);
      setTurmaId("");
      return;
    }

    const fetchTurmas = async () => {
      const res = await api.get(`/api/turmas?escola_id=${escolaId}&limit=2000`);
      const data = await res.json();
      setTurmas(Array.isArray(data.data) ? data.data : data);
    };

    fetchTurmas();
  }, [escolaId]);

  // Aplica filtro automaticamente quando qualquer valor mudar
  useEffect(() => {
    onFilter(
      nome.trim(),
      escolaId !== "" ? escolaId : null,
      turmaId !== "" ? turmaId : null,
      serieId !== "" ? serieId : null
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nome, escolaId, turmaId, serieId]);

  const handleFilter = () => {
    onFilter(
      nome.trim(),
      escolaId !== "" ? escolaId : null,
      turmaId !== "" ? turmaId : null,
      serieId !== "" ? serieId : null
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Buscar Alunos</h2>
      <div className="flex gap-3 items-end flex-nowrap overflow-x-auto">
        <div className="flex items-center flex-1 min-w-[200px] relative">
          <span className="absolute left-3 text-gray-400">
            <i className="fas fa-search" />
          </span>
          <input
            type="text"
            placeholder="Digite o nome do aluno..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px] flex-shrink-0"
          value={escolaId}
          onChange={(e) => setEscolaId(e.target.value === "" ? "" : parseInt(e.target.value))}
        >
          <option value="">Todas as escolas</option>
          {escolas.map((escola) => (
            <option key={escola.id} value={escola.id}>
              {escola.nome}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px] flex-shrink-0"
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value === "" ? "" : parseInt(e.target.value))}
        >
          <option value="">Todas as turmas</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px] flex-shrink-0"
          value={serieId}
          onChange={(e) => setSerieId(e.target.value === "" ? "" : e.target.value)}
        >
          <option value="">Todas as séries</option>
          {todasSeries.map((serie) => (
            <option key={serie} value={serie}>
              {serieNomes[serie]}
            </option>
          ))}
        </select>

        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200 flex-shrink-0 whitespace-nowrap"
        >
          Filtrar
        </button>
      </div>
    </div>
  );
};
