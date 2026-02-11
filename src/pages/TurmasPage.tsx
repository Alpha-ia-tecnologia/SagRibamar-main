import { useState, useEffect } from "react";
import { TurmaList } from "../layout/TurmaList";
import { CreateTurmaModal } from "../components/modals/CreateTurmaModal";
import { useApi } from "../utils/api";
import {
  UserGroupIcon,
  PlusIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface Escola {
  id: number;
  nome: string;
}

export default function TurmasPage() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [reload, setReload] = useState(false);

  const [searchNome, setSearchNome] = useState("");
  const [escolaId, setEscolaId] = useState<number | null>(null);
  const [serieId, setSerieId] = useState<string | null>(null);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const api = useApi();

  const serieNomes: Record<string, string> = {
    PRIMEIRO_ANO: "1° ano",
    SEGUNDO_ANO: "2° ano",
    TERCEIRO_ANO: "3° ano",
    QUARTO_ANO: "4° ano",
    QUINTO_ANO: "5° ano",
    SEXTO_ANO: "6° ano",
    SETIMO_ANO: "7° ano",
    OITAVO_ANO: "8° ano",
    NONO_ANO: "9° ano",
    PRIMEIRA_SERIE: "1ª série",
    SEGUNDA_SERIE: "2ª série",
    TERCEIRA_SERIE: "3ª série",
    EJA: "EJA",
    INFANTIL_I: "Infantil I",
    INFANTIL_II: "Infantil II",
    INFANTIL_III: "Infantil III",
    PRE_I: "Pré I",
    PRE_II: "Pré II",
    PRE_III: "Pré III",
    CRECHE: "Creche",
    TURMA_DE_HABILIDADES: "Turma Habilidades"
  };

  const todasSeries = Object.keys(serieNomes);

  useEffect(() => {
    const fetchEscolas = async () => {
      try {
        const res = await api.get(`/api/escolas?page=1&limit=200`);
        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.data;
        setEscolas(Array.isArray(lista) ? lista : []);
      } catch (err) {
        console.error("Erro ao buscar escolas", err);
        setEscolas([]);
      }
    };

    fetchEscolas();
  }, []);

  const handleFilter = () => {
    setReload(true);
  };

  const handleClearFilters = () => {
    setSearchNome("");
    setEscolaId(null);
    setSerieId(null);
    setReload(true);
  };

  const hasActiveFilters = searchNome !== "" || escolaId !== null || serieId !== null;

  const handleSuccess = () => {
    setShowModal(false);
    setEditId(null);
    setReload(true);
  };

  const handleEdit = (id: number) => {
    setEditId(id);
    setShowModal(true);
  };

  return (
    <>
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-400 mx-auto">
        {/* Header da Página */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 sm:p-8 shadow-xl">
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-1/4 -mb-8 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-indigo-400/15 rounded-full blur-2xl"></div>

            {/* Padrão de pontos decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute top-8 left-16 w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="absolute top-12 left-4 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute bottom-8 right-20 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute bottom-4 right-32 w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Ícone principal com efeito glassmorphism */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
                  <div className="relative p-4 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                    <UserGroupIcon className="w-10 h-10 text-white" />
                  </div>
                  {/* Badge de destaque */}
                  <div className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full shadow-lg">
                    <SparklesIcon className="w-3 h-3 text-amber-900" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Turmas
                    </h1>
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium rounded-full border border-white/20">
                      Gerenciamento
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm sm:text-base">
                    Gerencie todas as turmas do sistema
                  </p>
                </div>
              </div>

              {/* Botão de nova turma */}
              <button
                onClick={() => {
                  setEditId(null);
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md group"
              >
                <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                Nova Turma
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300">
            {/* Header do Filtro */}
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors rounded-t-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FunnelIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Filtros de Busca</h3>
                  <p className="text-sm text-gray-500">Encontre turmas rapidamente</p>
                </div>
                {hasActiveFilters && (
                  <span className="ml-2 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    Filtros ativos
                  </span>
                )}
              </div>
              <div className={`p-1 rounded-lg transition-all duration-200 ${isFilterExpanded ? "rotate-180 bg-gray-100" : ""}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Conteúdo dos Filtros */}
            {isFilterExpanded && (
              <div className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Campo de busca por nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Turma
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Digite o nome..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        value={searchNome}
                        onChange={(e) => setSearchNome(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                      />
                    </div>
                  </div>

                  {/* Select de Escola */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Escola
                    </label>
                    <div className="relative">
                      <BuildingLibraryIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                        value={escolaId ?? ""}
                        onChange={(e) =>
                          setEscolaId(e.target.value === "" ? null : parseInt(e.target.value))
                        }
                      >
                        <option value="">Todas as escolas</option>
                        {Array.isArray(escolas) &&
                          escolas.map((escola) => (
                            <option key={escola.id} value={escola.id}>
                              {escola.nome}
                            </option>
                          ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Select de Série */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Série
                    </label>
                    <div className="relative">
                      <AcademicCapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                        value={serieId ?? ""}
                        onChange={(e) =>
                          setSerieId(e.target.value === "" ? null : e.target.value)
                        }
                      >
                        <option value="">Todas as séries</option>
                        {todasSeries.map((serie) => (
                          <option key={serie} value={serie}>
                            {serieNomes[serie]}
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
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all duration-200"
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
        </section>

        {/* Lista de Turmas */}
        <section>
          <TurmaList
            reload={reload}
            onReloadDone={() => setReload(false)}
            onEdit={handleEdit}
            searchNome={searchNome}
            escolaId={escolaId}
            serieId={serieId}
          />
        </section>
      </main>

      {showModal && (
        <CreateTurmaModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
          turmaId={editId}
        />
      )}

    </>
  );
}
