import { useEffect, useState } from "react";
import { SuccessCheck } from "./Checked";
import { useApi } from "../utils/api";

interface Escola { id: number; nome: string; }
interface Prova {
  id: number;
  nome: string;
  _count: { questoes: number };
}

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

export const SelecaoEscolaSerieProva = () => {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [provas, setProvas] = useState<Prova[]>([]);

  const [escolaSelecionada, setEscolaSelecionada] = useState<number | null>(null);
  const [serieSelecionada, setSerieSelecionada] = useState<string | null>(null);
  const [provaSelecionada, setProvaSelecionada] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const api = useApi();

  useEffect(() => {
    api.get(`/api/escolas?page=1&limit=200`)
      .then(res => res.json())
      .then(data => Array.isArray(data.data) ? setEscolas(data.data) : setEscolas([]))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (escolaSelecionada) {
      // Se há escola selecionada, busca as séries da escola
      api.get(`/api/obter-series-escola?escola_id=${escolaSelecionada}`)
        .then(res => res.json())
        .then(data => {
          const novasSeries = Array.isArray(data) ? data : [];
          setSeries(novasSeries);
        })
        .catch(console.error);
    } else {
      // Se não há escola, carrega todas as séries disponíveis
      api.get(`/api/enums/series`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            // Se os dados são objetos com value/label, extrai apenas os values
            const seriesArray = data.map((s: any) => s.value || s);
            setSeries(seriesArray);
          } else {
            // Fallback para as séries definidas no componente
            setSeries(Object.keys(serieNomes));
          }
        })
        .catch(() => {
          // Fallback para as séries definidas no componente
          setSeries(Object.keys(serieNomes));
        });
    }
  }, [escolaSelecionada, api]);

  // Verifica se a série selecionada ainda está disponível quando as séries mudarem
  useEffect(() => {
    if (serieSelecionada && series.length > 0 && !series.includes(serieSelecionada)) {
      setSerieSelecionada(null);
      setProvaSelecionada(null);
      setProvas([]);
    }
  }, [series, serieSelecionada]);

  useEffect(() => {
    if (!serieSelecionada) return;
    api.get(`/api/provas?serie=${serieSelecionada}`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setProvas(data) : setProvas([]))
      .catch(console.error);
  }, [serieSelecionada]);

  const gerarGabarito = async () => {
    if (!serieSelecionada || !provaSelecionada) {
      alert("Selecione a série e a prova antes de gerar o gabarito.");
      return;
    }

    const prova = provas.find(p => p.id === provaSelecionada);
    const payload: any = {
      exam_id: provaSelecionada,
      classroom_name: serieSelecionada,
      question: prova?._count?.questoes || 0
    };
    
    // Adiciona school_id apenas se uma escola foi selecionada
    if (escolaSelecionada) {
      payload.school_id = escolaSelecionada;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${window.__ENV__?.CORRETOR_URL ?? import.meta.env.VITE_URL_GABARITOS}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) throw new Error("Erro ao gerar o gabarito");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const nomeEscola = escolaSelecionada 
        ? escolas.find(escola => escola.id === escolaSelecionada)?.nome || "Escola"
        : "";
      const nomeArquivo = `${nomeEscola ? nomeEscola + "-" : ""}${serieNomes[serieSelecionada] || serieSelecionada}-${prova?.nome || "Prova"}.pdf`;
      link.setAttribute("download", nomeArquivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setSuccess (true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert("Falha ao gerar o gabarito.");

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm mb-6 relative">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center bg-white rounded-xl p-6 shadow">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-blue-600"></div>
            <p className="mt-5 text-md font-medium text-black">Gerando gabarito...</p>
          </div>
        </div>
      )}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="grid text-md font-semibold text-black">
              <SuccessCheck />
            Gabarito gerado com sucesso!
            </p>
          </div>
        </div>
      )}


      <h2 className="text-sm font-bold text-gray-800 mb-4">
        - Selecione a Escola, Série e Prova
      </h2>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <label className="text-sm text-gray-600 mb-1 block">Escola</label>
          <select
            value={escolaSelecionada ?? ""}
            onChange={(e) => {
              const novaEscola = Number(e.target.value) || null;
              setEscolaSelecionada(novaEscola);
              // Não limpa a série selecionada, apenas recarrega as séries disponíveis
              // Se a série atual não estiver nas novas séries, será limpa pelo useEffect
              setProvaSelecionada(null);
              setProvas([]);
            }}
            className="w-full p-2 border border-gray-300 rounded"
            disabled={isLoading}
          >
            <option value="">Selecione uma escola</option>
            {escolas.map((escola) => (
              <option key={escola.id} value={escola.id}>{escola.nome}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[250px]">
          <label className="text-sm text-gray-600 mb-1 block">Série</label>
          <select
            value={serieSelecionada ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setSerieSelecionada(value || null);
              setProvaSelecionada(null);
              setProvas([]);
            }}
            disabled={isLoading}
            className="w-full p-2 border border-gray-300 rounded bg-white"
          >
            <option value="">Selecione uma série</option>
            {series.map((serie) => (
              <option key={serie} value={serie}>
                {serieNomes[serie] || serie}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[250px]">
          <label className="text-sm text-gray-600 mb-1 block">Prova</label>
          <select
            value={provaSelecionada ?? ""}
            onChange={(e) => setProvaSelecionada(Number(e.target.value) || null)}
            disabled={!serieSelecionada || isLoading}
            className="w-full p-2 border border-gray-300 rounded bg-white"
          >
            <option value="">
              {serieSelecionada ? "Selecione uma prova" : "Selecione uma série primeiro"}
            </option>
            {provas.map((prova) => (
              <option key={prova.id} value={prova.id}>
                {prova.nome} ({prova._count?.questoes ?? 0} questões)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={gerarGabarito}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          disabled={isLoading || !serieSelecionada || !provaSelecionada}
        >
          {isLoading ? "Gerando gabarito..." : "Gerar Gabarito"}
        </button>
      </div>
    </div>
  );
};
