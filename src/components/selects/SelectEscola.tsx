import { useEffect, useState, useRef } from "react";
import { useApi } from "../../utils/api";

interface Escola {
  id: number;
  nome: string;
}

interface Props {
  regiaoId?: string;
  grupoId?: string;
  value: string[];
  onChange: (ids: string[]) => void;
}

export const SelectEscola = ({ regiaoId, grupoId, value, onChange }: Props) => {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const api = useApi();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("limit", "200");

    if (regiaoId) params.append("regiao_id", regiaoId);
    if (grupoId) params.append("grupo_id", grupoId);

    const url = `/api/escolas?${params.toString()}`;

    api.get(url)
      .then(res => res.json())
      .then(data => {
        const lista = Array.isArray(data?.data) ? data.data : [];
        setEscolas(lista);
      })
      .catch(err => {
        console.error("Erro ao carregar escolas:", err);
        setEscolas([]);
      });
  }, [regiaoId, grupoId]);

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
    if (value.length === 0) return "Todas as Escolas";
    if (value.length === 1) {
      const escola = escolas.find(e => e.id.toString() === value[0]);
      return escola?.nome || "1 escola selecionada";
    }
    return `${value.length} escolas selecionadas`;
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm text-gray-600 mb-1 block">Escola</label>
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
          {escolas.map((escola) => (
            <label
              key={escola.id}
              className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(escola.id.toString())}
                onChange={() => handleCheckboxChange(escola.id.toString())}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{escola.nome}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
