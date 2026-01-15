import { useEffect, useState } from "react";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";
import { useApi } from "../utils/api";
import NoData from "./NoData";
import { Loading } from "./Loading";
import { TrophyIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

interface Aluno {
  aluno_id: number;
  aluno_nome: string;
  turma_id: number;
  turma_nome: string;
  escola_id: number;
  escola_nome: string;
  regiao_id: number;
  grupo_id: number;
  regiao_nome: string;
  grupo_nome: string;
  total_desempenhos: number;
  media_geral: number;
  maior_nota: string;
  menor_nota: number;
}

interface ApiResponse {
  data: Aluno[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const RankingAlunos = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);  
  const { filtros } = useFiltroDashboard();
  const api = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "20");

        if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
        if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
        if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
        if (filtros.serie) params.append("serie", filtros.serie);
        if (filtros.turmaId) params.append("turma_id", filtros.turmaId); 
        if (filtros.provaId) params.append("prova_id", filtros.provaId); 

        const res = await api.get(`/api/dashboard/student-ranking?${params.toString()}`);
        const json: ApiResponse = await res.json();

        setAlunos(json.data);
        setTotalPages(json.totalPages);
        setTotal(json.total);
      } catch (err) {
        setLoading(false);
        console.error("Erro ao buscar ranking de alunos:", err);
      }
      finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, filtros]);

  // Reseta a paginação para página 1 quando os filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [filtros]);

  const renderPagination = () => {
    const buttons = [];
    const delta = 2;

    const createPageButton = (p: number) => (
      <button
        key={p}
        onClick={() => setPage(p)}
        className={`w-8 h-8 rounded-md text-sm border transition ${
          page === p
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        {p}
      </button>
    );

    if (page > 1) {
      buttons.push(
        <button
          key="prev"
          onClick={() => setPage(page - 1)}
          className="px-2 h-8 rounded-md border text-gray-600 hover:bg-gray-100"
        >
          {"<"}
        </button>
      );
    }

    if (page > delta + 2) {
      buttons.push(createPageButton(1));
      buttons.push(<span key="start-ellipsis" className="px-2 text-gray-400">...</span>);
    }

    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      buttons.push(createPageButton(i));
    }

    if (page < totalPages - delta - 1) {
      buttons.push(<span key="end-ellipsis" className="px-2 text-gray-400">...</span>);
      buttons.push(createPageButton(totalPages));
    }

    if (page < totalPages) {
      buttons.push(
        <button
          key="next"
          onClick={() => setPage(page + 1)}
          className="px-2 h-8 rounded-md border text-gray-600 hover:bg-gray-100"
        >
          {">"}
        </button>
      );
    }

    return buttons;
  };

  const getPositionStyle = (position: number) => {
    if (position === 1) return "bg-amber-100 text-amber-700 ring-2 ring-amber-300";
    if (position === 2) return "bg-gray-100 text-gray-600 ring-2 ring-gray-300";
    if (position === 3) return "bg-orange-100 text-orange-700 ring-2 ring-orange-300";
    return "bg-gray-50 text-gray-600";
  };

  const getMediaColor = (media: number) => {
    if (media >= 80) return "text-emerald-600 bg-emerald-50";
    if (media >= 60) return "text-blue-600 bg-blue-50";
    if (media >= 40) return "text-amber-600 bg-amber-50";
    return "text-rose-600 bg-rose-50";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <TrophyIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Ranking de Alunos</h2>
            <p className="text-sm text-gray-500">Melhores desempenhos</p>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="p-6">
        {loading ? (
          <Loading />
        ) : alunos.length === 0 ? (
          <NoData />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Aluno</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Escola</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Turma</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Desempenho</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nota</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {alunos.map((aluno, index) => {
                    const posicao = (page - 1) * 20 + index + 1;

                    return (
                      <tr key={aluno.aluno_id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${getPositionStyle(posicao)}`}>
                            {posicao <= 3 ? (
                              <StarIcon className="w-4 h-4" />
                            ) : (
                              posicao
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                              {aluno.aluno_nome.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{aluno.aluno_nome}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-gray-600">{aluno.escola_nome}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                            {aluno.turma_nome}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-2.5 py-1 text-sm font-bold rounded-lg ${getMediaColor(aluno.media_geral)}`}>
                              {aluno.media_geral.toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-400">
                              ({aluno.total_desempenhos} aval.)
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-gray-900 font-medium">{aluno.maior_nota}/10</span>
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
                Mostrando <span className="font-medium text-gray-900">{(page - 1) * 20 + 1}</span> a{" "}
                <span className="font-medium text-gray-900">{Math.min(page * 20, total)}</span> de{" "}
                <span className="font-medium text-gray-900">{total}</span> alunos
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
    </div>
  );
}
