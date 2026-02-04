import { useEffect, useState } from "react";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";
import { useApi } from "../utils/api";
import NoData from "./NoData";
import { Loading } from "./Loading";
import { HabilidadeBNCCModal } from "./modals/HabilidadeBNCCModal";
import { DocumentCheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Habilidade {
  bncc_id: number;
  bncc_codigo: string;
  bncc_descricao: string;
  bncc_serie: string;
  componente_curricular_nome: string;
  total_questoes: number;
  total_respostas: number;
  total_acertos: number;
  percentual_acertos: number | string;
}

interface Questao {
  id: number;
  ordem: number;
  enunciado: string;
  imagem_url: string;
  nivel_ensino: string;
  nivel_ensino_formatado: string;
  dificuldade: string;
  dificuldade_formatada: string;
  serie: string;
  serie_formatada: string;
  pontos: number;
  prova: {
    id: number;
    nome: string;
  };
  componente_curricular: {
    id: number;
    nome: string;
  };
  proficiencia_saeb: {
    id: number;
    nivel: string;
    descricao: string;
  };
  codigos_bncc: Array<{
    questao_id: number;
    bncc_id: number;
    created_at: string;
    updated_at: string;
    bncc: {
      id: number;
      codigo: string;
      descricao: string;
    };
  }>;
  alternativas: Array<{
    id: number;
    texto: string;
    correta: boolean;
  }>;
  desempenho: {
    total_respostas: number;
    total_corretas: number;
    total_incorretas: number;
    taxa_acerto: number;
    taxa_erro: number;
  };
}

interface QuestoesResponse {
  questoes: Questao[];
  estatisticas: {
    total_questoes: number;
    total_respostas_geral: number;
    total_corretas_geral: number;
    taxa_acerto_media: number;
  };
  filtros_aplicados: {
    bncc_id: number;
    proficiencia_saeb_id: number | null;
  };
}

interface ApiResponse {
  data: Habilidade[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const TabelaHabilidadesBNCC = () => {
  const [loading, setLoading] = useState(false);
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selecionada, setSelecionada] = useState<Habilidade | null>(null);
  const [filtroOrdem, setFiltroOrdem] = useState<"acertos" | "erros">(
    "acertos"
  );
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [carregandoQuestoes, setCarregandoQuestoes] = useState(false);
  const [estatisticasQuestoes, setEstatisticasQuestoes] = useState<
    QuestoesResponse["estatisticas"] | null
  >(null);
  const api = useApi();
  const { filtros } = useFiltroDashboard();

  // Função para buscar questões vinculadas ao BNCC
  const buscarQuestoes = async (
    bnccId: number,
    proficienciaSaebId?: number | null
  ) => {
    setCarregandoQuestoes(true);
    try {
      const params = new URLSearchParams();
      params.append("bncc_id", bnccId.toString());

      if (proficienciaSaebId) {
        params.append("proficiencia_saeb_id", proficienciaSaebId.toString());
      }

      // Adiciona o prova_id se estiver selecionado no dashboard
      if (filtros.provaId) {
        params.append("prova_id", filtros.provaId);
      }

      // Adiciona os demais filtros do dashboard
      if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
      if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
      if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
      if (filtros.serie) params.append("serie", filtros.serie);
      if (filtros.turmaId) params.append("turma_id", filtros.turmaId);

      const res = await api.get(
        `/api/dashboard/bncc-questoes?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("Erro ao buscar questões");
      }

      const data: QuestoesResponse = await res.json();
      setQuestoes(data.questoes);
      setEstatisticasQuestoes(data.estatisticas);
    } catch (error) {
      console.error("Erro ao buscar questões:", error);
      setQuestoes([]);
      setEstatisticasQuestoes(null);
    } finally {
      setCarregandoQuestoes(false);
    }
  };
  // Função para fechar modal
  const fecharModal = () => {
    setSelecionada(null);
    setQuestoes([]);
    setEstatisticasQuestoes(null);
  };

  // Efeito para buscar questões quando uma habilidade é selecionada
  useEffect(() => {
    if (selecionada) {
      buscarQuestoes(selecionada.bncc_id);
    }
  }, [selecionada]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "20");
        params.append("filtro", filtroOrdem);

        if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
        if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
        if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
        if (filtros.serie) params.append("serie", filtros.serie);
        if (filtros.turmaId) params.append("turma_id", filtros.turmaId);
        if (filtros.provaId) params.append("prova_id", filtros.provaId); // ✅ corrigido aqui

        const res = await api.get(
          `/api/dashboard/bncc-skills?${params.toString()}`
        );
        const json: ApiResponse = await res.json();

        setHabilidades(json.data);
        setTotalPages(json.totalPages);
        setTotal(json.total);
      } catch (err) {
        setLoading(false);
        console.error("Erro ao buscar habilidades BNCC:", err);
      } finally {
        setLoading(false);  
      }
    };

    fetchData();
  }, [page, filtros, filtroOrdem]);

  // Reseta a paginação para página 1 quando os filtros do dashboard mudarem
  useEffect(() => {
    setPage(1);
  }, [filtros]);

  const renderPagination = () => {
    const pagesToShow = [];
    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);

    if (startPage > 2) {
      pagesToShow.push(
        <span key="dots1" className="px-2">
          ...
        </span>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pagesToShow.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 rounded border ${
            page === i
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages - 1) {
      pagesToShow.push(
        <span key="dots2" className="px-2">
          ...
        </span>
      );
    }

    return pagesToShow;
  };

  const getSkillColor = (percentual: number) => {
    if (percentual >= 70) return "bg-emerald-50 border-emerald-200 hover:border-emerald-300";
    if (percentual >= 50) return "bg-amber-50 border-amber-200 hover:border-amber-300";
    return "bg-rose-50 border-rose-200 hover:border-rose-300";
  };

  const getSkillTextColor = (percentual: number) => {
    if (percentual >= 70) return "text-emerald-700";
    if (percentual >= 50) return "text-amber-700";
    return "text-rose-700";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <DocumentCheckIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Habilidades BNCC / SAEB</h2>
              <p className="text-sm text-gray-500">Analise de competencias</p>
            </div>
          </div>

          {/* Filtros de Ordenacao */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFiltroOrdem("erros");
                setPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                filtroOrdem === "erros"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-rose-50 text-rose-600 hover:bg-rose-100"
              }`}
            >
              Mais Criticas
            </button>
            <button
              onClick={() => {
                setFiltroOrdem("acertos");
                setPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                filtroOrdem === "acertos"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
            >
              Melhores Resultados
            </button>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="p-6">
        {loading ? (
          <Loading />
        ) : habilidades.length === 0 ? (
          <NoData />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {habilidades.map((h) => {
                const percentual = parseFloat(h.percentual_acertos as string);
                const pct = isNaN(percentual) ? "0.0" : percentual.toFixed(1);

                return (
                  <button
                    key={h.bncc_id}
                    onClick={() => setSelecionada(h)}
                    className={`group p-4 rounded-xl text-left border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${getSkillColor(percentual)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 bg-white/80 text-gray-700 text-xs font-bold rounded-md">
                        {h.bncc_codigo}
                      </span>
                      <span className="text-xs text-gray-500">
                        {h.total_questoes} {h.total_questoes > 1 ? "questoes" : "questao"}
                      </span>
                    </div>
                    <p className={`text-3xl font-bold ${getSkillTextColor(percentual)}`}>
                      {pct}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {h.componente_curricular_nome}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Paginacao */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-gray-100 gap-4">
              <p className="text-sm text-gray-500">
                Mostrando <span className="font-medium text-gray-900">{(page - 1) * 20 + 1}</span> a{" "}
                <span className="font-medium text-gray-900">{Math.min(page * 20, total)}</span> de{" "}
                <span className="font-medium text-gray-900">{total}</span> resultados
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>

                {renderPagination()}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <HabilidadeBNCCModal
        habilidade={selecionada}
        onClose={fecharModal}
        questoes={questoes}
        carregandoQuestoes={carregandoQuestoes}
        estatisticasQuestoes={estatisticasQuestoes}
      />
    </div>
  );
};
