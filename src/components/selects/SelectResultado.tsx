import { useState, useRef, useEffect } from "react";

interface Props {
  value: string[];
  onChange: (values: string[]) => void;
}

const opcoes = [
  { value: "melhores", label: "Melhores" },
  { value: "criticos", label: "Resultados Críticos" },
];

export const SelectResultado = ({ value, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return "Todos os Resultados";
    if (value.length === 1) {
      const opcao = opcoes.find(o => o.value === value[0]);
      return opcao?.label || "1 resultado selecionado";
    }
    return `${value.length} resultados selecionados`;
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm text-gray-600 mb-1 block">Resultado</label>
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
          {opcoes.map((opcao) => (
            <label
              key={opcao.value}
              className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(opcao.value)}
                onChange={() => handleCheckboxChange(opcao.value)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{opcao.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
