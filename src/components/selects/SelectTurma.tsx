import { useEffect, useState, useRef } from "react";
import { useApi } from "../../utils/api";

interface Turma {
  id: number;
  nome: string;
  serie: string;
  turno: string;
  escola_id: number;
}

interface Props {
  escolaId?: string;
  serie?: string;
  value: string[];
  onChange: (ids: string[]) => void;
}

export const SelectTurma = ({ escolaId, serie, value, onChange }: Props) => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const api = useApi();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!escolaId || !serie) {
      setTurmas([]);
      return;
    }

    const params = new URLSearchParams({
      escola_id: escolaId,
      serie: serie,
    });

    api.get(`/api/turmas?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const lista = Array.isArray(data?.data) ? data.data : [];
        setTurmas(lista);
      })
      .catch(() => setTurmas([]));
  }, [escolaId, serie]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (turmaId: string) => {
    if (value.includes(turmaId)) {
      onChange(value.filter(id => id !== turmaId));
    } else {
      onChange([...value, turmaId]);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return "Todas as Turmas";
    if (value.length === 1) {
      const turma = turmas.find(t => t.id.toString() === value[0]);
      return turma?.nome || "1 turma selecionada";
    }
    return `${value.length} turmas selecionadas`;
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm text-gray-600 mb-1 block">Turma</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!turmas.length}
        className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-left flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate">{getDisplayText()}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && turmas.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {turmas.map((turma) => (
            <label
              key={turma.id}
              className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(turma.id.toString())}
                onChange={() => handleCheckboxChange(turma.id.toString())}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{turma.nome}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
