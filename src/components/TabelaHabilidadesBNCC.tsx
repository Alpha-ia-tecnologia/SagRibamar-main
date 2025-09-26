import { useEffect, useState, useRef } from "react";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";

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
  ordem:number;
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
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selecionada, setSelecionada] = useState<Habilidade | null>(null);
  const [filtroOrdem, setFiltroOrdem] = useState<"acertos" | "erros">("acertos");
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [carregandoQuestoes, setCarregandoQuestoes] = useState(false);
  const [estatisticasQuestoes, setEstatisticasQuestoes] = useState<QuestoesResponse['estatisticas'] | null>(null);
  const [loadingSkills,setLoadingSkills] = useState (false)
  const { filtros } = useFiltroDashboard();
  
  // Refs para acessibilidade
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Lock body scroll quando modal estiver aberto
  useLockBodyScroll(!!selecionada);

  // Função para buscar questões vinculadas ao BNCC
  const buscarQuestoes = async (bnccId: number, proficienciaSaebId?: number | null) => {
    setCarregandoQuestoes(true);
    try {
      const params = new URLSearchParams();
      params.append("bncc_id", bnccId.toString());
      
      if (proficienciaSaebId) {
        params.append("proficiencia_saeb_id", proficienciaSaebId.toString());
      }

      const res = await fetch(
        `${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/dashboard/bncc-questoes?${params.toString()}`
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

  // Função para lidar com clique no overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      fecharModal();
    }
  };

  // Função para lidar com tecla ESC
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && selecionada) {
      fecharModal();
    }
  };

  // Efeito para gerenciar eventos de teclado e foco
  useEffect(() => {
    if (selecionada) {
      // Adiciona listener para ESC
      document.addEventListener('keydown', handleKeyDown);
      
      // Foca no modal quando abre
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
      
      // Busca questões vinculadas ao BNCC
      buscarQuestoes(selecionada.bncc_id);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selecionada]);

  useEffect(() => {
    setLoadingSkills (true);
    const fetchData = async () => {
      try {
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

        const res = await fetch(`${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/dashboard/bncc-skills?${params.toString()}`);
        const json: ApiResponse = await res.json();

        setHabilidades(json.data);
        setTotalPages(json.totalPages);
        setTotal(json.total);
      } catch (err) {
        console.error("Erro ao buscar habilidades BNCC:", err);
      }
      finally {
        setLoadingSkills(false)
      }
    };

    fetchData();
  }, [page, filtros, filtroOrdem]);

  const renderPagination = () => {
    const pagesToShow = [];
    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);

    if (startPage > 2) {
      pagesToShow.push(<span key="dots1" className="px-2">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pagesToShow.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 rounded border ${
            page === i ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages - 1) {
      pagesToShow.push(<span key="dots2" className="px-2">...</span>);
    }

    return pagesToShow;
  };

  function BlockScroll ({loadingSkills}) {
    useEffect (() => {
      if (loadingSkills){
        document.body.style.overflow = "hidden"
      }
      else {
        document.body.style.overflow = ""
      }
  })};

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <BlockScroll loadingSkills={loadingSkills} />
      {loadingSkills && (        
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center bg-white rounded-xl p-6 shadow">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-blue-600"></div>
            <p className="mt-5 text-md font-medium text-black">Carregando Dashboard...</p>
          </div>
        </div>
        )}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {habilidades.map(h => {
          const percentual = parseFloat(h.percentual_acertos as any);
          const pct = isNaN(percentual) ? "0.00%" : percentual.toFixed(2) + "%";

          let bgColor;

          if (percentual >= 70) {
            bgColor = "bg-green-100 text-green-800";
          }
          else if (percentual >= 50){
            bgColor= "bg-yellow-100 text-yellow-800";
          }
          else {
            bgColor= "bg-red-100 text-red-800";
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
                {h.total_questoes} {h.total_questoes > 1 ? "questões" : "questão"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-500">
          Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, total)} de {total} resultados
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

      {selecionada && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
          onClick={handleOverlayClick}
        >
          {/* Container rolável com padding para respiro */}
          <div className="min-h-full flex items-start justify-center py-8 md:py-12">
            {/* Painel do modal */}
            <div 
              ref={modalRef}
              className="relative w-full max-w-3xl mx-4 md:mx-auto bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto overscroll-contain"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              tabIndex={-1}
            >
              {/* Header fixo */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                    {selecionada.bncc_codigo}
                  </h3>
                  <button
                    ref={closeButtonRef}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
                    onClick={fecharModal}
                    aria-label="Fechar modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Conteúdo rolável */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Componente Curricular</p>
                      <p className="text-sm text-gray-900">{selecionada.componente_curricular_nome}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Série</p>
                      <p className="text-sm text-gray-900">{selecionada.bncc_serie}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-800">Descrição</p>
                    <p className="text-sm text-gray-900 mt-1">{selecionada.bncc_descricao}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Total de Questões</p>
                      <p className="text-sm text-gray-900">{selecionada.total_questoes}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Média de Desempenho</p>
                      <p className="text-sm text-gray-900">
                        {parseFloat(selecionada.percentual_acertos as any).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Evolução do Desempenho</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-500 italic text-sm">
                      Não há dados históricos suficientes para exibir a evolução.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Histórico Detalhado</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 font-bold text-gray-900">Avaliação</th>
                          <th className="px-4 py-3 font-bold text-gray-900">Data</th>
                          <th className="px-4 py-3 font-bold text-gray-900">Desempenho</th>
                          <th className="px-4 py-3 font-bold text-gray-900">Evolução</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3">Média de {selecionada.total_questoes} questões</td>
                          <td className="px-4 py-3">Data não disponível</td>
                          <td className="px-4 py-3 text-green-600 font-medium">
                            {parseFloat(selecionada.percentual_acertos as any).toFixed(2)}%
                          </td>
                          <td className="px-4 py-3">Primeira avaliação</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Questões Vinculadas</h4>
                  
                  {carregandoQuestoes ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-500 italic text-sm text-center">
                        Carregando questões...
                      </p>
                    </div>
                  ) : questoes.length > 0 ? (
                    <div className="space-y-4">
                      {estatisticasQuestoes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-blue-900">Total de Questões</p>
                              <p className="text-blue-700">{estatisticasQuestoes.total_questoes}</p>
                            </div>
                            <div>
                              <p className="font-medium text-blue-900">Total de Respostas</p>
                              <p className="text-blue-700">{estatisticasQuestoes.total_respostas_geral.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="font-medium text-blue-900">Total de Acertos</p>
                              <p className="text-blue-700">{estatisticasQuestoes.total_corretas_geral.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="font-medium text-blue-900">Taxa de Acerto Média</p>
                              <p className="text-blue-700 font-semibold">{estatisticasQuestoes.taxa_acerto_media.toFixed(2)}%</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        {questoes.map((questao) => {
                          const taxa = questao.desempenho?.taxa_acerto ?? 0;

                          const taxaAcertoClass =
                            taxa >= 70
                              ? "bg-green-100 text-green-800"
                              : taxa >= 50
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800";

                          return (
                          <div key={questao.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 mb-1">
                                  Questão {questao.ordem}
                                </h5>
                                <p className="text-sm text-gray-600 mb-2">
                                  {questao.enunciado}
                                </p>
                                <p>
                                  {questao.imagem_url && (
                                    <img
                                      src={`${
                                        window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL
                                      }/${questao.imagem_url}`}
                                      alt="Imagem da questão"
                                      className="mb-4 max-h-48 rounded-lg border"
                                    />
                                  )}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span className="bg-gray-200 text-gray-900 px-2 py-1 rounded">
                                    {questao.serie_formatada}
                                  </span>
                                  <span className="bg-gray-200 text-gray-900 px-2 py-1 rounded">
                                    {questao.prova.nome}
                                  </span>
                                  <span className="bg-gray-200 text-gray-900 px-2 py-1 rounded">
                                    {questao.proficiencia_saeb
                                      ? `${questao.proficiencia_saeb.nivel} - ${questao.proficiencia_saeb.descricao}`
                                      : "Sem nivel vinculado"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className= {`${taxaAcertoClass}`}>
                                  Taxa de Acerto: <span
                                  className="font-medium">
                                    {taxa.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {questao.desempenho.total_corretas}/{questao.desempenho.total_respostas}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="font-medium text-gray-700 text-base my-3">Alternativas:</p>
                                <div className="space-y-6">
                                  {questao.alternativas.map((alt, index) => (
                                    <div key={alt.id} className={`flex items-center gap-2 ${
                                      alt.correta ? 'text-green-700 font-medium' : 'text-gray-600'
                                    }`}>
                                      <span className="w-4 h-4 rounded-full border flex items-center justify-center text-xs">
                                        {String.fromCharCode(65 + index)}
                                      </span>
                                      <span className={alt.correta ? 'bg-green-100 px-2 py-1 rounded' : ''}>
                                        {alt.texto}
                                      </span>
                                      {alt.correta && <span className="text-green-600">✓</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <p className="font-medium text-base text-gray-900 my-3">Desempenho:</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Total de Respostas:</span>
                                    <span className="font-medium">{questao.desempenho.total_respostas.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Acertos:</span>
                                    <span className="font-medium text-green-600">{questao.desempenho.total_corretas.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Erros:</span>
                                    <span className="font-medium text-red-600">{questao.desempenho.total_incorretas.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Taxa de Erro:</span>
                                    <span className="font-medium text-red-600">{questao.desempenho.taxa_erro.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-500 italic text-sm text-center">
                        Nenhuma questão encontrada para esta habilidade BNCC.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer fixo */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-lg">
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    onClick={fecharModal}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
