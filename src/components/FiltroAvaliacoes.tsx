import { useState } from "react";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";
import { SelectRegiao } from "./selects/SelectRegiao";
import { SelectGrupo } from "./selects/SelectGrupo";
import { SelectEscola } from "./selects/SelectEscola";
import { SelectSerie } from "./selects/SelectSerie";
import { SelectTurma } from "./selects/SelectTurma";
import { SelectResultado } from "./selects/SelectResultado";
import { SelectProvas } from "./selects/SelectProvas";
import { FunnelIcon, ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const FiltroAvaliacoes = () => {
  const [regiaoId, setRegiaoId] = useState("");
  const [grupoId, setGrupoId] = useState("");
  const [escolaId, setEscolaId] = useState("");
  const [series, setSeries] = useState<string[]>([]);
  const [turmaId, setTurmaId] = useState("");
  const [provaIds, setProvaIds] = useState<string[]>([]);
  const [filtro, setFiltro] = useState("acertos");
  const [isExpanded, setIsExpanded] = useState(true);

  const { setFiltros } = useFiltroDashboard();

  const handleAplicarFiltros = () => {
    setFiltros({
      regiaoId,
      grupoId,
      escolaId,
      serie: series.join(","),
      turmaId,
      provaId: provaIds.join(","),
      filtro,
    });
  };

  const handleResetarFiltros = () => {
    setRegiaoId("");
    setGrupoId("");
    setEscolaId("");
    setSeries([]);
    setTurmaId("");
    setProvaIds([]);
    setFiltro("acertos");
    setFiltros({});
  };

  const hasActiveFilters = regiaoId || grupoId || escolaId || series.length > 0 || turmaId || provaIds.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300">
      {/* Header do Filtro */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-50 rounded-lg">
            <FunnelIcon className="w-5 h-5 text-accent-500" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-gray-900">Filtros de Busca</h3>
            <p className="text-sm text-gray-500">
              {hasActiveFilters ? "Filtros aplicados" : "Refine sua pesquisa"}
            </p>
          </div>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-medium rounded-full">
              Ativo
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Conteúdo dos Filtros */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SelectRegiao value={regiaoId} onChange={setRegiaoId} />
            <SelectGrupo regiaoId={regiaoId} value={grupoId} onChange={setGrupoId} />
            <SelectEscola regiaoId={regiaoId} grupoId={grupoId} value={escolaId} onChange={setEscolaId} />
            <SelectSerie escolaId={escolaId} value={series} onChange={setSeries} />
            <SelectTurma escolaId={escolaId} serie={series.join(",")} value={turmaId} onChange={setTurmaId} />
            <SelectProvas value={provaIds} onChange={setProvaIds} />
            <SelectResultado value={filtro} onChange={setFiltro} />

            {/* Botões de Ação */}
            <div className="flex items-end gap-3">
              <button
                onClick={handleAplicarFiltros}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-500 text-white text-sm font-medium rounded-xl hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Aplicar
              </button>
              <button
                onClick={handleResetarFiltros}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
