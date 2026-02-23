import type { ComponenteCurricular, Serie, HabilidadeBNCC } from "./types";
import { NIVEIS_ENSINO } from "./types";

interface FiltrosSidebarProps {
  provaId: number | null;
  questoesVinculadas: number[];
  filtroVinculadas: boolean;
  componenteFiltro: number | "";
  serieFiltro: string;
  nivelEnsinoFiltro: string;
  tipoHabilidadeFiltro: "BNCC" | "SAEB" | "SEAMA" | "";
  habilidadeFiltro: number | "";
  componentes: ComponenteCurricular[];
  series: Serie[];
  habilidades: HabilidadeBNCC[];
  temFiltrosAtivos: boolean;
  onComponenteChange: (value: number | "") => void;
  onSerieChange: (value: string) => void;
  onNivelEnsinoChange: (value: string) => void;
  onTipoHabilidadeChange: (value: "BNCC" | "SAEB" | "SEAMA" | "") => void;
  onHabilidadeChange: (value: number | "") => void;
  onFiltroVinculadasChange: (value: boolean) => void;
  onLimparFiltros: () => void;
}

export function FiltrosSidebar({
  provaId,
  questoesVinculadas,
  filtroVinculadas,
  componenteFiltro,
  serieFiltro,
  nivelEnsinoFiltro,
  tipoHabilidadeFiltro,
  habilidadeFiltro,
  componentes,
  series,
  habilidades,
  temFiltrosAtivos,
  onComponenteChange,
  onSerieChange,
  onNivelEnsinoChange,
  onTipoHabilidadeChange,
  onHabilidadeChange,
  onFiltroVinculadasChange,
  onLimparFiltros,
}: FiltrosSidebarProps) {
  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Filtrar Questões
        </h3>
        {temFiltrosAtivos && (
          <button
            onClick={onLimparFiltros}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
            title="Limpar todos os filtros"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="space-y-4">
        {provaId && questoesVinculadas.length > 0 && (
          <button
            onClick={() => onFiltroVinculadasChange(!filtroVinculadas)}
            className={`w-full p-3 rounded-lg text-sm font-medium transition ${
              filtroVinculadas
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {filtroVinculadas
              ? `Vinculadas (${questoesVinculadas.length})`
              : `Questões vinculadas (${questoesVinculadas.length})`}
          </button>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Componente Curricular
          </label>
          <select
            value={componenteFiltro}
            onChange={(e) => onComponenteChange(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Componentes</option>
            {componentes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Série/Ano
          </label>
          <select
            value={serieFiltro}
            onChange={(e) => onSerieChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as Séries</option>
            {series.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nível de Ensino
          </label>
          <select
            value={nivelEnsinoFiltro}
            onChange={(e) => onNivelEnsinoChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Níveis</option>
            {NIVEIS_ENSINO.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Habilidade
          </label>
          <select
            value={tipoHabilidadeFiltro}
            onChange={(e) => onTipoHabilidadeChange(e.target.value as "BNCC" | "SAEB" | "SEAMA" | "")}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione o Tipo</option>
            <option value="BNCC">BNCC</option>
            <option value="SAEB">SAEB</option>
            <option value="SEAMA">SEAMA</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Habilidade
          </label>
          <select
            value={habilidadeFiltro}
            onChange={(e) => onHabilidadeChange(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={!tipoHabilidadeFiltro}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {tipoHabilidadeFiltro ? "Todas as Habilidades" : "Selecione o tipo primeiro"}
            </option>
            {habilidades.map((h) => (
              <option key={h.id} value={h.id}>{h.codigo}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
