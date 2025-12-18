import { useEffect, useState } from "react";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";
import { useApi } from "../utils/api";
import NoData from "./NoData";
import { Loading } from "./Loading";
import { HabilidadeBNCCModal } from "./modals/HabilidadeBNCCModal";

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

  return (
    <div className="relative p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Habilidades BNCC / SAEB</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFiltroOrdem("erros");
              setPage(1);
            }}
            className={`px-3 py-1 text-sm rounded cursor-pointer ${
              filtroOrdem === "erros"
                ? "bg-red-500 text-white"
                : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}
          >
            Mais Críticas
          </button>
          <button
            onClick={() => {
              setFiltroOrdem("acertos");
              setPage(1);
            }}
            className={`px-3 py-1 text-sm rounded cursor-pointer ${
              filtroOrdem === "acertos"
                ? "bg-green-500 text-white"
                : "bg-green-100 text-green-600 hover:bg-green-200"
            }`}
          >
            Melhores Resultados
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : habilidades.length === 0 ? (
        <NoData />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {habilidades.map((h) => {
              const percentual = parseFloat(h.percentual_acertos as any);
              const pct = isNaN(percentual)
                ? "0.00%"
                : percentual.toFixed(2) + "%";

              let bgColor;

              if (percentual >= 70) {
                bgColor = "bg-green-100 text-green-800";
              } else if (percentual >= 50) {
                bgColor = "bg-yellow-100 text-yellow-800";
              } else {
                bgColor = "bg-red-100 text-red-800";
              }

              return (
                <button
                  key={h.bncc_id}
                  onClick={() => setSelecionada(h)}
                  className={`${bgColor} p-4 rounded-lg text-left shadow hover:shadow-md transition`}
                >
                  <p className="font-bold text-sm">{h.bncc_codigo}</p>
                  <p className="text-2xl font-extrabold">{pct}</p>
                  <p className="text-xs text-gray-600">
                    {h.total_questoes}{" "}
                    {h.total_questoes > 1 ? "questões" : "questão"}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-500">
              Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, total)} de{" "}
              {total} resultados
            </p>
            <div className="flex gap-1 items-center">
              <button
                onClick={() => setPage(1)}
                className="w-8 h-8 border rounded bg-white hover:bg-gray-100"
              >
                ‹
              </button>
              {renderPagination()}
              <button
                onClick={() => setPage(totalPages)}
                className="w-8 h-8 border rounded bg-white hover:bg-gray-100"
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}
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
