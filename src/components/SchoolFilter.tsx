import { useEffect, useState } from "react";
import { useApi } from "../utils/api";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface Regiao {
  id: number;
  nome: string;
}

interface Grupo {
  id: number;
  nome: string;
}

interface SchoolFilterProps {
  onFilter: (nome: string, regiaoId: number | null, grupoId: number | null) => void;
}

export const SchoolFilter = ({ onFilter }: SchoolFilterProps) => {
  const [nome, setNome] = useState("");
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [regiaoId, setRegiaoId] = useState<number | "">("");
  const [grupoId, setGrupoId] = useState<number | "">("");
  const [isExpanded, setIsExpanded] = useState(true);
  const api = useApi();

  useEffect(() => {
    const fetchRegioes = async () => {
      const res = await api.get(`/api/regioes`);
      const data = await res.json();
      setRegioes(data);
    };

    const fetchGrupos = async () => {
      const res = await api.get(`/api/grupos`);
      const data = await res.json();
      setGrupos(data);
    };

    fetchRegioes();
    fetchGrupos();
  }, [api]);

  const handleFilter = () => {
    onFilter(
      nome.trim(),
      regiaoId !== "" ? regiaoId : null,
      grupoId !== "" ? grupoId : null
    );
  };

  const handleClearFilters = () => {
    setNome("");
    setRegiaoId("");
    setGrupoId("");
    onFilter("", null, null);
  };

  const hasActiveFilters = nome !== "" || regiaoId !== "" || grupoId !== "";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300">
      {/* Header do Filtro */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-50 rounded-lg">
            <FunnelIcon className="w-5 h-5 text-accent-500" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Filtros de Busca</h3>
            <p className="text-sm text-gray-500">Encontre escolas rapidamente</p>
          </div>
          {hasActiveFilters && (
            <span className="ml-2 px-2.5 py-0.5 bg-accent-100 text-accent-700 text-xs font-medium rounded-full">
              Filtros ativos
            </span>
          )}
        </div>
        <div className={`p-1 rounded-lg transition-all duration-200 ${isExpanded ? "rotate-180 bg-gray-100" : ""}`}>
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Conteúdo dos Filtros */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Campo de busca por nome */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Escola
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Digite o nome..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                />
              </div>
            </div>

            {/* Select de Região */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Região
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                  value={regiaoId}
                  onChange={(e) =>
                    setRegiaoId(e.target.value === "" ? "" : parseInt(e.target.value))
                  }
                >
                  <option value="">Todas as regiões</option>
                  {regioes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nome}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Select de Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupo
              </label>
              <div className="relative">
                <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                  value={grupoId}
                  onChange={(e) =>
                    setGrupoId(e.target.value === "" ? "" : parseInt(e.target.value))
                  }
                >
                  <option value="">Todos os grupos</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-end gap-2">
              <button
                onClick={handleFilter}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent-500 text-white font-medium rounded-xl hover:bg-accent-600 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98] transition-all duration-200"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Filtrar
              </button>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 hover:border-red-200 transition-all duration-200"
                  title="Limpar filtros"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
