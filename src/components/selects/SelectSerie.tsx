import { useEffect, useState, useRef } from "react";
import { useApi } from "../../utils/api";

interface Props {
  escolaId?: string;
  value: string[];
  onChange: (vals: string[]) => void;
}

const nomeSerieLegivel: Record<string, string> = {
  "PRIMEIRO_ANO": "1º Ano",
  "SEGUNDO_ANO": "2º Ano",
  "TERCEIRO_ANO": "3º Ano",
  "QUARTO_ANO": "4º Ano",
  "QUINTO_ANO": "5º Ano",
  "SEXTO_ANO": "6º Ano",
  "SETIMO_ANO": "7º Ano",
  "OITAVO_ANO": "8º Ano",
  "NONO_ANO": "9º Ano",
  "PRIMEIRA_SERIE": "1ª Série",
  "SEGUNDA_SERIE": "2ª Série",
  "TERCEIRA_SERIE": "3ª Série",
  "EJA": "EJA",
};

const TODAS_AS_SERIES = Object.keys(nomeSerieLegivel);

export const SelectSerie = ({ escolaId, value, onChange }: Props) => {
  const [series, setSeries] = useState<string[]>(TODAS_AS_SERIES);
  const [isOpen, setIsOpen] = useState(false);
  const api = useApi();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!escolaId) {
      setSeries(TODAS_AS_SERIES);
      return;
    }

    api.get(`/api/obter-series-escola?escola_id=${escolaId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Séries da escola carregadas:", data);
        setSeries(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Erro ao carregar séries da escola:", err);
        setSeries([]);
      });
  }, [escolaId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (serie: string) => {
    if (value.includes(serie)) {
      onChange(value.filter(v => v !== serie));
    } else {
      onChange([...value, serie]);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return "Todas as Séries";
    if (value.length === 1) {
      return nomeSerieLegivel[value[0]] || value[0];
    }
    return `${value.length} séries selecionadas`;
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm text-gray-600 mb-1 block">Série</label>
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
          {series.map((serie) => (
            <label
              key={serie}
              className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(serie)}
                onChange={() => handleCheckboxChange(serie)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{nomeSerieLegivel[serie] ?? serie}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
