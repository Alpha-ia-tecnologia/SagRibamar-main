import { useEffect, useState } from "react";
import { useApi } from "../../../utils/api";
import type { Questao, Alternativa, ComponenteCurricular, Serie, HabilidadeBNCC } from "./types";

interface UseBancoQuestoesParams {
  provaId: number | null;
  tituloProva: string;
  onClose: () => void;
  onSuccess: () => void;
  onRefresh?: () => void;
}

export function useBancoQuestoes({ provaId, tituloProva, onClose, onSuccess, onRefresh }: UseBancoQuestoesParams) {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [questoesFiltradas, setQuestoesFiltradas] = useState<Questao[]>([]);
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState<number[]>([]);
  const [questoesVinculadas, setQuestoesVinculadas] = useState<number[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [questaoParaDesvincular, setQuestaoParaDesvincular] = useState<number | null>(null);
  const [filtroVinculadas, setFiltroVinculadas] = useState(false);
  const [questoesExpandidas, setQuestoesExpandidas] = useState<number[]>([]);
  const [alternativasCache, setAlternativasCache] = useState<Record<number, Alternativa[]>>({});
  const [carregandoAlternativas, setCarregandoAlternativas] = useState<number | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

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

      if (tipoHabilidadeFiltro === "BNCC") {
        params.append("bncc", "true");
        params.append("saeb", "false");
      } else if (tipoHabilidadeFiltro === "SAEB") {
        params.append("saeb", "true");
        params.append("bncc", "false");
      } else if (tipoHabilidadeFiltro === "SEAMA") {
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

  const buscarQuestoes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (componenteFiltro !== "") params.append("componente_curricular_id", componenteFiltro.toString());
      if (serieFiltro) params.append("serie", serieFiltro);
      if (nivelEnsinoFiltro) params.append("nivel_ensino", nivelEnsinoFiltro);
      if (habilidadeFiltro !== "") params.append("bncc_id", habilidadeFiltro.toString());

      const url = params.toString() ? `/api/questoes?${params.toString()}` : `/api/questoes`;
      const res = await api.get(url);
      if (!res.ok) throw new Error("Erro ao buscar questões");
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

  const aplicarFiltros = (lista: Questao[]) => {
    let filtradas = [...lista];

    if (pesquisa.trim()) {
      const termoLower = pesquisa.toLowerCase().trim();
      filtradas = filtradas.filter((q) => {
        const enunciadoMatch = q.enunciado?.toLowerCase().includes(termoLower);
        const codigoMatch = q.codigos_bncc?.some((c) =>
          c.bncc?.codigo?.toLowerCase().includes(termoLower) ||
          c.bncc?.descricao?.toLowerCase().includes(termoLower)
        );
        const componenteMatch = q.componente_curricular?.nome?.toLowerCase().includes(termoLower);
        return enunciadoMatch || codigoMatch || componenteMatch;
      });
    }

    if (componenteFiltro !== "") {
      filtradas = filtradas.filter((q) => q.componente_curricular?.id === componenteFiltro);
    }
    if (serieFiltro) {
      filtradas = filtradas.filter((q) => q.serie === serieFiltro);
    }
    if (nivelEnsinoFiltro) {
      filtradas = filtradas.filter((q) => q.nivel_ensino === nivelEnsinoFiltro);
    }
    if (habilidadeFiltro !== "") {
      filtradas = filtradas.filter((q) =>
        q.codigos_bncc?.some((c) => c.bncc_id === habilidadeFiltro || c.bncc?.id === habilidadeFiltro)
      );
    }
    if (filtroVinculadas) {
      filtradas = filtradas.filter((q) => questoesVinculadas.includes(q.id));
    }

    setQuestoesFiltradas(filtradas);
  };

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
        onRefresh?.();
      }
    } catch (error) {
      console.error("Erro ao desvincular questão:", error);
      alert("Erro ao desvincular questão.");
    } finally {
      setSalvando(false);
      setQuestaoParaDesvincular(null);
    }
  };

  const toggleExpandirQuestao = async (questaoId: number) => {
    if (questoesExpandidas.includes(questaoId)) {
      setQuestoesExpandidas((prev) => prev.filter((id) => id !== questaoId));
      return;
    }

    if (!alternativasCache[questaoId]) {
      try {
        setCarregandoAlternativas(questaoId);
        const res = await api.get(`/api/questoes/${questaoId}`);
        if (res.ok) {
          const data = await res.json();
          setAlternativasCache((prev) => ({ ...prev, [questaoId]: data.alternativas || [] }));
        }
      } catch (error) {
        console.error("Erro ao buscar alternativas:", error);
      } finally {
        setCarregandoAlternativas(null);
      }
    }

    setQuestoesExpandidas((prev) => [...prev, questaoId]);
  };

  const toggleSelecionarQuestao = (questaoId: number) => {
    setQuestoesSelecionadas((prev) =>
      prev.includes(questaoId) ? prev.filter((id) => id !== questaoId) : [...prev, questaoId]
    );
  };

  const handleAdicionarQuestoes = async () => {
    if (questoesSelecionadas.length === 0) {
      alert("Selecione pelo menos uma questão para adicionar à prova.");
      return;
    }

    let provaIdAtual: number | null = provaId;

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

    try {
      setSalvando(true);

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
        return;
      }

      setMensagemSucesso(`${questoesSelecionadas.length} questão(ões) adicionada(s) com sucesso!`);
    } catch (error) {
      console.error("Erro ao adicionar questões à prova:", error);
      alert("Erro ao adicionar questões à prova. Verifique o console para mais detalhes.");
    } finally {
      setSalvando(false);
    }
  };

  const fecharMensagemSucesso = () => {
    setMensagemSucesso(null);
    onSuccess();
    onClose();
  };

  const limparFiltros = () => {
    setComponenteFiltro("");
    setSerieFiltro("");
    setNivelEnsinoFiltro("");
    setTipoHabilidadeFiltro("");
    setHabilidadeFiltro("");
    setFiltroVinculadas(false);
  };

  const temFiltrosAtivos =
    componenteFiltro !== "" || serieFiltro !== "" || nivelEnsinoFiltro !== "" ||
    tipoHabilidadeFiltro !== "" || habilidadeFiltro !== "" || filtroVinculadas;

  // Effects
  useEffect(() => {
    fetchComponentes();
    fetchSeries();
    buscarQuestoes();
    fetchQuestoesVinculadas();
  }, []);

  useEffect(() => {
    if (tipoHabilidadeFiltro) {
      fetchHabilidades();
      setHabilidadeFiltro("");
    } else {
      setHabilidades([]);
      setHabilidadeFiltro("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoHabilidadeFiltro]);

  useEffect(() => {
    buscarQuestoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componenteFiltro, serieFiltro, nivelEnsinoFiltro, habilidadeFiltro]);

  useEffect(() => {
    aplicarFiltros(questoes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pesquisa, questoes, filtroVinculadas, questoesVinculadas]);

  return {
    // Estado da lista
    questoesFiltradas,
    questoesSelecionadas,
    questoesVinculadas,
    questoesExpandidas,
    alternativasCache,
    carregandoAlternativas,
    loading,
    salvando,
    pesquisa,
    questoes,

    // Estado dos filtros
    componenteFiltro,
    serieFiltro,
    nivelEnsinoFiltro,
    tipoHabilidadeFiltro,
    habilidadeFiltro,
    filtroVinculadas,
    componentes,
    series,
    habilidades,
    temFiltrosAtivos,

    // Estado do dialog de desvinculação
    questaoParaDesvincular,
    setQuestaoParaDesvincular,

    // Estado do dialog de sucesso
    mensagemSucesso,
    fecharMensagemSucesso,

    // Ações
    setPesquisa,
    setComponenteFiltro,
    setSerieFiltro,
    setNivelEnsinoFiltro,
    setTipoHabilidadeFiltro,
    setHabilidadeFiltro,
    setFiltroVinculadas,
    toggleSelecionarQuestao,
    toggleExpandirQuestao,
    handleAdicionarQuestoes,
    confirmarDesvinculacao,
    limparFiltros,
  };
}
