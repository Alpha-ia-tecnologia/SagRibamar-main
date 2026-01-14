import { useEffect, useState, useRef } from "react";
import { useApi } from "../../utils/api";

interface Grupo {
  id: number;
  nome: string;
}

interface Props {
  regiaoId?: string;
  value: string[];
  onChange: (ids: string[]) => void;
}

export const SelectGrupo = ({ regiaoId, value, onChange }: Props) => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const api = useApi();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const endpoint = regiaoId
      ? `/api/grupos?regiao_id=${regiaoId}`
      : `/api/grupos`;

    api.get(endpoint)
      .then((res) => res.json())
      .then((data) => {
        console.log("Grupos carregados:", data);
        setGrupos(data || []);
      })
      .catch((err) => {
        console.error("Erro ao carregar grupos:", err);
        setGrupos([]);
      });
  }, [regiaoId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return "Todos os Grupos";
    if (value.length === 1) {
      const grupo = grupos.find(g => g.id.toString() === value[0]);
      return grupo?.nome || "1 grupo selecionado";
    }
    return `${value.length} grupos selecionados`;
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm text-gray-600 mb-1 block">Grupo</label>
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
          {grupos.map((g) => (
            <label
              key={g.id}
              className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(g.id.toString())}
                onChange={() => handleCheckboxChange(g.id.toString())}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{g.nome}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
