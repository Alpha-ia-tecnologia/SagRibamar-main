import { useEffect, useState, useRef } from "react";
import { useApi } from "../../utils/api";

interface Prova {
  id: number;
  nome: string;
}

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
}

export const SelectProvas = ({ value, onChange }: Props) => {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const api = useApi();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get(`/api/provas`)
      .then((res) => res.json())
      .then((data) => setProvas(data || []))
      .catch(() => setProvas([]));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (provaId: string) => {
    if (value.includes(provaId)) {
      onChange(value.filter(id => id !== provaId));
    } else {
      onChange([...value, provaId]);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return "Todas as Provas";
    if (value.length === 1) {
      const prova = provas.find(p => p.id.toString() === value[0]);
      return prova?.nome || "1 prova selecionada";
    }
    return `${value.length} provas selecionadas`;
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm text-gray-700 mb-1 block">Provas</label>
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
          {provas.map((prova) => (
            <label
              key={prova.id}
              className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(prova.id.toString())}
                onChange={() => handleCheckboxChange(prova.id.toString())}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{prova.nome}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
