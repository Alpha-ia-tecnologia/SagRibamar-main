import { useEffect, useState } from "react";
import { useApi } from "../../utils/api";
import { ConfirmDialog } from "./ConfirmDialog";

interface Questao {
  id: number;
  enunciado: string;
  ordem?: number;
  serie?: string;
  nivel_ensino?: string;
  componente_curricular?: {
    id: number;
    nome: string;
  };
  codigos_bncc?: Array<{
    bncc_id?: number;
    bncc: {
      id?: number;
      codigo: string;
      descricao: string;
    };
  }>;
}

interface ComponenteCurricular {
  id: number;
  nome: string;
}

interface Serie {
  value: string;
  label: string;
}

interface HabilidadeBNCC {
  id: number;
  codigo: string;
  descricao: string;
}

// Função para formatar série/turma
const formatarSerie = (serie: string): string => {
  const mapaSeries: Record<string, string> = {
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
    TURMA_DE_HABILIDADES: "Turma Habilidades",
  };

  return (
    mapaSeries[serie] ||
    serie.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

interface BancoQuestoesModalProps {
  provaId: number | null;
  tituloProva: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BancoQuestoesModal = ({
  provaId,
  tituloProva,
  onClose,
  onSuccess,
}: BancoQuestoesModalProps) => {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [questoesFiltradas, setQuestoesFiltradas] = useState<Questao[]>([]);
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState<number[]>([]);
  const [questoesVinculadas, setQuestoesVinculadas] = useState<number[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [questaoParaDesvincular, setQuestaoParaDesvincular] = useState<number | null>(null);
  
  // Filtros
  const [componenteFiltro, setComponenteFiltro] = useState<number | "">("");
  const [serieFiltro, setSerieFiltro] = useState("");
  const [nivelEnsinoFiltro, setNivelEnsinoFiltro] = useState("");
  const [tipoHabilidadeFiltro, setTipoHabilidadeFiltro] = useState<"BNCC" | "SAEB" | "SEAMA" | "">("");
  const [habilidadeFiltro, setHabilidadeFiltro] = useState<number | "">("");
  
  // Dados para filtros
  const [componentes, setComponentes] = useState<ComponenteCurricular[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [habilidades, setHabilidades] = useState<HabilidadeBNCC[]>([]);
  
  const api = useApi();
  
  const niveisEnsino = [
    { value: "ANOS_INICIAIS", label: "Anos Iniciais" },
    { value: "ANOS_FINAIS", label: "Anos Finais" },
    { value: "ENSINO_MEDIO", label: "Ensino Médio" },
  ];

  // Funções para buscar dados dos filtros
  const fetchComponentes = async () => {
    try {
      const res = await api.get(`/api/componentes-curriculares`);
      if (!res.ok) throw new Error("Erro ao buscar componentes curriculares");
      const data: ComponenteCurricular[] = await res.json();
      setComponentes(data || []);
    } catch (error) {
      console.error("Erro ao buscar componentes curriculares:", error);
      setComponentes([]);
    }
  };

  const fetchSeries = async () => {
    try {
      const res = await api.get(`/api/enums/series`);
      if (!res.ok) throw new Error("Erro ao buscar séries");
      const data: Serie[] = await res.json();
      setSeries(data);
    } catch (error) {
      console.error("Erro ao buscar séries:", error);
      setSeries([]);
    }
  };

  const fetchHabilidades = async () => {
    if (!tipoHabilidadeFiltro) {
      setHabilidades([]);
      return;
    }

    try {
      const params = new URLSearchParams();
      
      // Filtro baseado no tipo selecionado
      if (tipoHabilidadeFiltro === "BNCC") {
        params.append("bncc", "true");
        params.append("saeb", "false");
      } else if (tipoHabilidadeFiltro === "SAEB") {
        params.append("saeb", "true");
        params.append("bncc", "false");
      } else if (tipoHabilidadeFiltro === "SEAMA") {
        // SEAMA - pode precisar de endpoint específico ou parâmetro diferente
        // Por enquanto, vou buscar todas e filtrar se necessário
        params.append("seama", "true");
      }

      const url = params.toString() ? `/api/bncc?${params.toString()}` : `/api/bncc`;
      const res = await api.get(url);
      if (!res.ok) throw new Error(`Erro ao buscar habilidades ${tipoHabilidadeFiltro}`);
      const data: HabilidadeBNCC[] = await res.json();
      setHabilidades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(`Erro ao buscar habilidades ${tipoHabilidadeFiltro}:`, error);
      setHabilidades([]);
    }
  };

  // Função para buscar questões do banco
  const buscarQuestoes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Adiciona filtros na requisição se disponíveis
      if (componenteFiltro !== "") {
        params.append("componente_curricular_id", componenteFiltro.toString());
      }
      if (serieFiltro) {
        params.append("serie", serieFiltro);
      }
      if (nivelEnsinoFiltro) {
        params.append("nivel_ensino", nivelEnsinoFiltro);
      }
      if (habilidadeFiltro !== "") {
        params.append("bncc_id", habilidadeFiltro.toString());
      }
      
      const url = params.toString() 
        ? `/api/questoes?${params.toString()}`
        : `/api/questoes`;
      
      const res = await api.get(url);
      if (!res.ok) {
        throw new Error("Erro ao buscar questões");
      }
      const data = await res.json();
      const questoesData = Array.isArray(data) ? data : [];
      setQuestoes(questoesData);
      aplicarFiltros(questoesData);
    } catch (error) {
      console.error("Erro ao buscar questões:", error);
      setQuestoes([]);
      setQuestoesFiltradas([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para aplicar todos os filtros (pesquisa + filtros de atributos)
  const aplicarFiltros = (lista: Questao[]) => {
    let filtradas = [...lista];

    // Filtro por pesquisa (texto) - sempre aplicado localmente
    if (pesquisa.trim()) {
      const termoLower = pesquisa.toLowerCase().trim();
      filtradas = filtradas.filter((q) => {
        const enunciadoMatch = q.enunciado?.toLowerCase().includes(termoLower);
        const codigoMatch = q.codigos_bncc?.some((c) =>
          c.bncc?.codigo?.toLowerCase().includes(termoLower) ||
          c.bncc?.descricao?.toLowerCase().includes(termoLower)
        );
        const componenteMatch = q.componente_curricular?.nome
          ?.toLowerCase()
          .includes(termoLower);
        return enunciadoMatch || codigoMatch || componenteMatch;
      });
    }

    // Filtro por componente curricular (aplicado localmente se não foi na API)
    if (componenteFiltro !== "") {
      filtradas = filtradas.filter(
        (q) => q.componente_curricular?.id === componenteFiltro
      );
    }

    // Filtro por série (aplicado localmente se não foi na API)
    if (serieFiltro) {
      filtradas = filtradas.filter((q) => q.serie === serieFiltro);
    }

    // Filtro por nível de ensino (aplicado localmente se não foi na API)
    if (nivelEnsinoFiltro) {
      filtradas = filtradas.filter((q) => q.nivel_ensino === nivelEnsinoFiltro);
    }

    // Filtro por habilidade BNCC (aplicado localmente se não foi na API)
    if (habilidadeFiltro !== "") {
      filtradas = filtradas.filter((q) =>
        q.codigos_bncc?.some(
          (c) => c.bncc_id === habilidadeFiltro || c.bncc?.id === habilidadeFiltro
        )
      );
    }

    setQuestoesFiltradas(filtradas);
  };

  // Buscar questões já vinculadas à prova
  const fetchQuestoesVinculadas = async () => {
    if (!provaId) return;
    try {
      const res = await api.get(`/api/provas/${provaId}/questoes-detalhadas`);
      if (res.ok) {
        const data = await res.json();
        const ids = (data.questoes || []).map((q: Questao) => q.id);
        setQuestoesVinculadas(ids);
      }
    } catch (error) {
      console.error("Erro ao buscar questões vinculadas:", error);
    }
  };

  // Desvincular questão da prova
  const confirmarDesvinculacao = async () => {
    if (!provaId || questaoParaDesvincular === null) return;

    try {
      setSalvando(true);
      const res = await api.delete(`/api/provas/${provaId}/questoes/${questaoParaDesvincular}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro ao desvincular questão:", res.status, errorText);
        alert("Erro ao desvincular questão.");
      } else {
        setQuestoesVinculadas((prev) => prev.filter((id) => id !== questaoParaDesvincular));
      }
    } catch (error) {
      console.error("Erro ao desvincular questão:", error);
      alert("Erro ao desvincular questão.");
    } finally {
      setSalvando(false);
      setQuestaoParaDesvincular(null);
    }
  };

  useEffect(() => {
    fetchComponentes();
    fetchSeries();
    buscarQuestoes();
    fetchQuestoesVinculadas();
  }, []);

  // Busca habilidades quando o tipo de habilidade mudar
  useEffect(() => {
    if (tipoHabilidadeFiltro) {
      fetchHabilidades();
      setHabilidadeFiltro(""); // Limpa a habilidade selecionada quando muda o tipo
    } else {
      setHabilidades([]);
      setHabilidadeFiltro("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoHabilidadeFiltro]);

  // Rebusca questões quando os filtros mudarem
  useEffect(() => {
    buscarQuestoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componenteFiltro, serieFiltro, nivelEnsinoFiltro, habilidadeFiltro]);

  // Aplica filtros locais quando pesquisa ou questões mudarem
  useEffect(() => {
    aplicarFiltros(questoes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pesquisa, questoes]);

  const toggleSelecionarQuestao = (questaoId: number) => {
    setQuestoesSelecionadas((prev) => {
      if (prev.includes(questaoId)) {
        return prev.filter((id) => id !== questaoId);
      } else {
        return [...prev, questaoId];
      }
    });
  };

  const handleAdicionarQuestoes = async () => {
    if (questoesSelecionadas.length === 0) {
      alert("Selecione pelo menos uma questão para adicionar à prova.");
      return;
    }

    let provaIdAtual: number | null = provaId;

    // Se não há prova criada ainda, criar uma nova
    if (!provaIdAtual && tituloProva) {
      try {
        setSalvando(true);
        const provaRes = await api.post(`/api/provas`, { nome: tituloProva });

        if (!provaRes.ok) {
          const errorText = await provaRes.text();
          console.error("Erro ao criar prova:", provaRes.status, errorText);
          alert("Erro ao criar prova.");
          setSalvando(false);
          return;
        }

        const provaSalva = await provaRes.json();
        provaIdAtual = provaSalva.id;
      } catch (err) {
        alert("Erro ao criar prova. Veja o console para mais informações.");
        console.error(err);
        setSalvando(false);
        return;
      }
    }

    if (!provaIdAtual) {
      alert("Erro: ID da prova não encontrado.");
      setSalvando(false);
      return;
    }

    // Adicionar questões selecionadas à prova
    try {
      setSalvando(true);

      // Buscar questões existentes para definir a ordem das novas
      let ordemInicial = 1;
      try {
        const provaRes = await api.get(`/api/provas/${provaIdAtual}/questoes-detalhadas`);
        if (provaRes.ok) {
          const provaData = await provaRes.json();
          ordemInicial = (provaData.questoes?.length || 0) + 1;
        }
      } catch {
        console.warn("Não foi possível buscar ordem atual, iniciando em 1.");
      }

      const questoesPayload = questoesSelecionadas.map((questaoId, index) => ({
        questao_id: questaoId,
        ordem: ordemInicial + index,
      }));

      const res = await api.post(`/api/provas/${provaIdAtual}/questoes`, {
        questoes: questoesPayload,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro ao vincular questões:", res.status, errorText);
        alert("Erro ao vincular questões à prova.");
      } else {
        alert(`${questoesSelecionadas.length} questão(ões) adicionada(s) com sucesso!`);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao adicionar questões à prova:", error);
      alert("Erro ao adicionar questões à prova. Verifique o console para mais detalhes.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            Banco de Questões
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Conteúdo principal com sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar de Filtros */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Filtrar Questões
              </h3>
              {(componenteFiltro !== "" || serieFiltro || nivelEnsinoFiltro || tipoHabilidadeFiltro || habilidadeFiltro !== "") && (
                <button
                  onClick={() => {
                    setComponenteFiltro("");
                    setSerieFiltro("");
                    setNivelEnsinoFiltro("");
                    setTipoHabilidadeFiltro("");
                    setHabilidadeFiltro("");
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                  title="Limpar todos os filtros"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Filtros */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Componente Curricular
                </label>
                <select
                  value={componenteFiltro}
                  onChange={(e) => setComponenteFiltro(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os Componentes</option>
                  {componentes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Série/Ano
                </label>
                <select
                  value={serieFiltro}
                  onChange={(e) => setSerieFiltro(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as Séries</option>
                  {series.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Ensino
                </label>
                <select
                  value={nivelEnsinoFiltro}
                  onChange={(e) => setNivelEnsinoFiltro(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os Níveis</option>
                  {niveisEnsino.map((n) => (
                    <option key={n.value} value={n.value}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Habilidade
                </label>
                <select
                  value={tipoHabilidadeFiltro}
                  onChange={(e) => setTipoHabilidadeFiltro(e.target.value as "BNCC" | "SAEB" | "SEAMA" | "")}
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
                  onChange={(e) => setHabilidadeFiltro(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={!tipoHabilidadeFiltro}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {tipoHabilidadeFiltro ? "Todas as Habilidades" : "Selecione o tipo primeiro"}
                  </option>
                  {habilidades.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.codigo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Área principal com lista de questões */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Campo de pesquisa */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <input
                type="text"
                placeholder="Pesquisar questões por enunciado, código BNCC ou componente curricular..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Contador de selecionadas */}
            {questoesSelecionadas.length > 0 && (
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <p className="text-sm font-medium text-blue-800">
                  {questoesSelecionadas.length} questão(ões) selecionada(s)
                </p>
              </div>
            )}

            {/* Informações de resultados */}
            {(pesquisa.trim() || componenteFiltro !== "" || serieFiltro || nivelEnsinoFiltro || habilidadeFiltro !== "") && questoesFiltradas.length > 0 && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600">
                  Mostrando {questoesFiltradas.length} de {questoes.length} questão(ões)
                </p>
              </div>
            )}

            {/* Lista de questões */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Carregando questões...</p>
                </div>
              ) : questoesFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {pesquisa.trim() || componenteFiltro !== "" || serieFiltro || nivelEnsinoFiltro || habilidadeFiltro !== ""
                      ? "Nenhuma questão encontrada com os filtros aplicados."
                      : "Nenhuma questão encontrada no banco."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questoesFiltradas.map((questao) => {
                const isSelecionada = questoesSelecionadas.includes(questao.id);
                const isVinculada = questoesVinculadas.includes(questao.id);
                return (
                  <div
                    key={questao.id}
                    className={`p-4 border rounded-lg transition ${
                      isVinculada
                        ? "bg-green-50 border-green-400 border-2"
                        : isSelecionada
                          ? "bg-blue-50 border-blue-500 border-2 cursor-pointer hover:bg-gray-50"
                          : "border-gray-200 cursor-pointer hover:bg-gray-50"
                    }`}
                    onClick={() => !isVinculada && toggleSelecionarQuestao(questao.id)}
                  >
                    <div className="flex items-start gap-3">
                      {isVinculada ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuestaoParaDesvincular(questao.id);
                          }}
                          disabled={salvando}
                          className="mt-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition whitespace-nowrap disabled:opacity-50"
                        >
                          Desvincular
                        </button>
                      ) : (
                        <input
                          type="checkbox"
                          checked={isSelecionada}
                          onChange={() => toggleSelecionarQuestao(questao.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 accent-blue-600"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-gray-500">
                            Questão #{questao.id}
                          </span>
                          {isVinculada && (
                            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-medium">
                              Vinculada à prova
                            </span>
                          )}
                          {questao.componente_curricular && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {questao.componente_curricular.nome}
                            </span>
                          )}
                          {questao.serie && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {formatarSerie(questao.serie)}
                            </span>
                          )}
                        </div>
                        <div
                          className="text-sm text-gray-700 mb-2 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: questao.enunciado || "",
                          }}
                        />
                        {questao.codigos_bncc && questao.codigos_bncc.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {questao.codigos_bncc.map((codigo, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                              >
                                {codigo.bncc?.codigo}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer com botões */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition"
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            onClick={handleAdicionarQuestoes}
            disabled={questoesSelecionadas.length === 0 || salvando}
            className={`px-5 py-2.5 rounded-xl text-sm transition ${
              questoesSelecionadas.length === 0 || salvando
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {salvando
              ? "Adicionando..."
              : `Adicionar ${questoesSelecionadas.length} Questão(ões)`}
          </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={questaoParaDesvincular !== null}
        title="Desvincular questão"
        description="Deseja desvincular esta questão da prova? A questão continuará disponível no banco de questões."
        confirmText="Desvincular"
        cancelText="Cancelar"
        danger
        onConfirm={confirmarDesvinculacao}
        onCancel={() => setQuestaoParaDesvincular(null)}
      />
    </div>
  );
};

