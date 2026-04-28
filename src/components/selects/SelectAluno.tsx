import { useEffect, useState, useRef } from "react";
import { useApi } from "../../utils/api";

interface Aluno {
  id: number;
  nome: string;
}

interface Props {
  escolaId?: string;
  turmaId?: string;
  value: string[];
  onChange: (ids: string[]) => void;
}

export const SelectAluno = ({ escolaId, turmaId, value, onChange }: Props) => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const api = useApi();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams({ page: "1", limit: "200" });

    if (escolaId) params.append("escola_id", escolaId);
    if (turmaId) params.append("turma_id", turmaId);

    api.get(`/api/alunos?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const lista = Array.isArray(data?.data) ? data.data : [];
        setAlunos(lista);
      })
      .catch(() => setAlunos([]));
  }, [escolaId, turmaId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (alunoId: string) => {
    if (value.includes(alunoId)) {
      onChange(value.filter(id => id !== alunoId));
    } else {
      onChange([...value, alunoId]);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return "Todos os Alunos";
    if (value.length === 1) {
      const aluno = alunos.find(a => a.id.toString() === value[0]);
      return aluno?.nome || "1 aluno selecionado";
    }
    return `${value.length} alunos selecionados`;
  };

  const alunosFiltrados = busca
    ? alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()))
    : alunos;

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm text-gray-600 mb-1 block">Aluno</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-left flex justify-between items-center"
      >
        <span className="truncate">{getDisplayText()}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          {alunosFiltrados.map((aluno) => (
            <label
              key={aluno.id}
              className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(aluno.id.toString())}
                onChange={() => handleCheckboxChange(aluno.id.toString())}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{aluno.nome}</span>
            </label>
          ))}
          {alunosFiltrados.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">Nenhum aluno encontrado</p>
          )}
        </div>
      )}
    </div>
  );
};
