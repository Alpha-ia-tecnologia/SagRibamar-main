import { useEffect, useState } from "react";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";
import { useApi } from "../utils/api";
import NoData from "./NoData";
import { Loading } from "./Loading";
import { BuildingOffice2Icon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { TrophyIcon } from "@heroicons/react/24/solid";

interface EscolaDesempenho {
  escola_id: number;
  escola_nome: string;
  regiao_id: number;
  grupo_id: number;
  regiao_nome: string;
  grupo_nome: string;
  total_alunos: number;
  total_desempenhos: number;
  media_desempenho: number | null;
  total_turmas: number;
}

export const TabelaDesempenhoEscolas = () => {
  const { filtros } = useFiltroDashboard();
  const [dados, setDados] = useState<EscolaDesempenho[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const api = useApi();

  const fetchData = async () => {
    const params = new URLSearchParams({
      page: pagina.toString(),
      limit: "10",
    });

    if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
    if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
    if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
    if (filtros.serie) params.append("serie", filtros.serie);
    if (filtros.turmaId) params.append("turma_id", filtros.turmaId);
    if (filtros.provaId) params.append("prova_id", filtros.provaId); 
    
    try {
      setLoading(true)
      const res = await api.get(`/api/dashboard/school-performance?${params.toString()}`);
      const json = await res.json();

      setDados(json.data || []);
      setTotalPaginas(json.totalPages || 1);
      setTotal(json.total || 0);
    } catch (error) {
      setLoading(false)
      console.error("Erro ao carregar desempenho por escola:", error);
    }
    finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagina, filtros]);

  const gerarBotoesPaginacao = (): (number | string)[] => {
    const botoes: (number | string)[] = [];
    const maxVisiveis = 3;

    if (totalPaginas <= maxVisiveis + 2) {
      for (let i = 1; i <= totalPaginas; i++) botoes.push(i);
    } else {
      if (pagina <= maxVisiveis) {
        for (let i = 1; i <= maxVisiveis + 1; i++) botoes.push(i);
        botoes.push("...");
        botoes.push(totalPaginas);
      } else if (pagina >= totalPaginas - maxVisiveis + 1) {
        botoes.push(1);
        botoes.push("...");
        for (let i = totalPaginas - maxVisiveis; i <= totalPaginas; i++) botoes.push(i);
      } else {
        botoes.push(1);
        botoes.push("...");
        botoes.push(pagina - 1);
        botoes.push(pagina);
        botoes.push(pagina + 1);
        botoes.push("...");
        botoes.push(totalPaginas);
      }
    }

    return botoes;
  };

  const getPositionStyle = (position: number) => {
    if (position === 1) return "bg-amber-100 text-amber-700";
    if (position === 2) return "bg-gray-100 text-gray-600";
    if (position === 3) return "bg-orange-100 text-orange-700";
    return "bg-gray-50 text-gray-600";
  };

  const getMediaColor = (media: number | null) => {
    if (media === null) return "text-gray-400";
    if (media >= 70) return "text-emerald-600";
    if (media >= 50) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BuildingOffice2Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Desempenho por Escolas</h2>
            <p className="text-sm text-gray-500">Ranking geral de desempenho</p>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="p-6">
        {loading ? (
          <Loading />
        ) : dados.length === 0 ? (
          <NoData />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Escola</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Regiao</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Grupo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Media</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Avaliados</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Turmas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dados.map((escola, index) => {
                    const position = (pagina - 1) * 10 + index + 1;
                    return (
                      <tr
                        key={escola.escola_id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${getPositionStyle(position)}`}>
                            {position <= 3 ? (
                              <TrophyIcon className="w-4 h-4" />
                            ) : (
                              position
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-gray-900">{escola.escola_nome}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-gray-600">{escola.regiao_nome}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                            {escola.grupo_nome || "Nao Definido"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-lg font-bold ${getMediaColor(escola.media_desempenho)}`}>
                            {typeof escola.media_desempenho === "number"
                              ? escola.media_desempenho.toFixed(1)
                              : "0.0"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-gray-900 font-medium">{escola.total_desempenhos ?? 0}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-gray-600">{escola.total_alunos ?? 0}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-gray-600">{escola.total_turmas ?? 0}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginacao */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-gray-100 gap-4">
              <p className="text-sm text-gray-500">
                Mostrando <span className="font-medium text-gray-900">{(pagina - 1) * 10 + 1}</span> a{" "}
                <span className="font-medium text-gray-900">{Math.min(pagina * 10, total)}</span> de{" "}
                <span className="font-medium text-gray-900">{total}</span> resultados
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagina(Math.max(1, pagina - 1))}
                  disabled={pagina === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>

                {gerarBotoesPaginacao().map((num, i) =>
                  num === "..." ? (
                    <span key={`dots-${i}`} className="px-3 py-2 text-gray-400 text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={num}
                      onClick={() => setPagina(num as number)}
                      className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${
                        pagina === num
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                  disabled={pagina === totalPaginas}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

