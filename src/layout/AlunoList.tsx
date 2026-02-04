import { useEffect, useState } from "react";
import { IconButton } from "../components/IconButton";
import { useApi } from "../utils/api";
import { ConfirmDialog } from "../components/modals/ConfirmDialog";
import {
  AcademicCapIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { AcademicCapIcon as AcademicCapSolid } from "@heroicons/react/24/solid";

interface Turma {
  id: number;
  nome: string;
}

interface Escola {
  id: number;
  nome: string;
}

interface Aluno {
  id: number;
  nome: string;
  turma_id: number;
  turma: Turma;
  escola: Escola;
}

interface AlunoListProps {
  reload?: boolean;
  onReloadDone?: () => void;
  onEdit?: (id: number) => void;
  searchNome: string;
  escolaId: number | null;
  turmaId: number | null;
  serieId: string | null;
}

export const AlunoList = ({
  reload,
  onReloadDone,
  onEdit,
  searchNome,
  escolaId,
  turmaId,
  serieId,
}: AlunoListProps) => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [confirmationDelete, setConfirmationDelete] = useState(false);
  const [alunoIdSelecionado, setAlunoIdSelecionado] = useState<number | null>(null);
  const api = useApi();

  const fetchAlunos = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
      });

      if (searchNome.trim() !== "") queryParams.append("nome", searchNome);
      if (escolaId !== null) queryParams.append("escola_id", String(escolaId));
      if (turmaId !== null) queryParams.append("turma_id", String(turmaId));
      if (serieId !== null) queryParams.append("serie", serieId);

      const res = await api.get(`/api/alunos?${queryParams.toString()}`);

      const data = await res.json();
      setAlunos(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error("Erro ao buscar alunos", err);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, [page, searchNome, escolaId, turmaId, serieId]);

  // Reseta a paginação para página 1 quando os filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [searchNome, escolaId, turmaId, serieId]);

  useEffect(() => {
    if (reload) {
      fetchAlunos().then(() => onReloadDone?.());
    }
  }, [reload, onReloadDone]);

  const handleDelete = async (id: number) => {
    try {
      const res = await api.delete(`/api/alunos/${id}`);

      if (!res.ok) throw new Error("Erro ao excluir");

      fetchAlunos();
    } catch (err) {
      alert("Erro ao excluir aluno");
    }
  };

  const gerarBotoesPaginacao = (): (number | string)[] => {
    const botoes: (number | string)[] = [];
    const maxVisiveis = 3;

    if (totalPages <= maxVisiveis + 2) {
      for (let i = 1; i <= totalPages; i++) botoes.push(i);
    } else {
      if (page <= maxVisiveis) {
        for (let i = 1; i <= maxVisiveis + 1; i++) botoes.push(i);
        botoes.push("...");
        botoes.push(totalPages);
      } else if (page >= totalPages - maxVisiveis + 1) {
        botoes.push(1);
        botoes.push("...");
        for (let i = totalPages - maxVisiveis; i <= totalPages; i++) botoes.push(i);
      } else {
        botoes.push(1);
        botoes.push("...");
        botoes.push(page - 1);
        botoes.push(page);
        botoes.push(page + 1);
        botoes.push("...");
        botoes.push(totalPages);
      }
    }

    return botoes;
  };

  // Funcao para obter iniciais do nome
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header da Lista */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <AcademicCapSolid className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Lista de Alunos</h3>
              <p className="text-sm text-gray-500">
                Pagina <span className="font-medium text-blue-600">{page}</span> de <span className="font-medium">{totalPages}</span> - Total: <span className="font-medium text-blue-600">{totalItems}</span> alunos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Alunos */}
      <div className="divide-y divide-gray-100">
        {alunos.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum aluno encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          alunos.map((aluno, index) => (
            <div
              key={aluno.id}
              className="group px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar do Aluno */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm text-white font-semibold ${
                    index % 4 === 0 ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                    index % 4 === 1 ? "bg-gradient-to-br from-indigo-500 to-indigo-600" :
                    index % 4 === 2 ? "bg-gradient-to-br from-violet-500 to-violet-600" :
                    "bg-gradient-to-br from-purple-500 to-purple-600"
                  }`}>
                    {getInitials(aluno.nome)}
                  </div>

                  {/* Informacoes do Aluno */}
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {aluno.nome}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        ID: {aluno.id}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                        {aluno.turma?.nome || "N/A"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <BuildingLibraryIcon className="w-4 h-4 text-gray-400" />
                        {aluno.escola?.nome || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acoes */}
                <div className="flex items-center gap-2">
                  <IconButton type="edit" onClick={() => onEdit?.(aluno.id)} />
                  <IconButton
                    type="delete"
                    onClick={() => {
                      setAlunoIdSelecionado(aluno.id);
                      setConfirmationDelete(true);
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginacao */}
      {alunos.length > 0 && (
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-medium text-gray-900">{(page - 1) * 10 + 1}</span> a <span className="font-medium text-gray-900">{Math.min(page * 10, totalItems)}</span> de <span className="font-medium text-gray-900">{totalItems}</span> resultados
            </p>

            <div className="flex items-center gap-1">
              {/* Primeira pagina */}
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                title="Primeira pagina"
              >
                <ChevronDoubleLeftIcon className="w-4 h-4" />
              </button>

              {/* Pagina anterior */}
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                title="Pagina anterior"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              {/* Numeros de pagina */}
              <div className="flex items-center gap-1 mx-2">
                {gerarBotoesPaginacao().map((num, i) =>
                  num === "..." ? (
                    <span
                      key={`dots-${i}`}
                      className="px-2 py-1 text-gray-400 text-sm"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={num}
                      onClick={() => setPage(num as number)}
                      className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        page === num
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                          : "border border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300 hover:text-blue-600"
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
              </div>

              {/* Proxima pagina */}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                title="Proxima pagina"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>

              {/* Ultima pagina */}
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                title="Ultima pagina"
              >
                <ChevronDoubleRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de Confirmacao */}
      {confirmationDelete && (
        <ConfirmDialog
          isOpen={confirmationDelete}
          title="Tem certeza que deseja excluir esse aluno?"
          description="Ao excluir o aluno, todas as informacoes relacionadas a ele serao perdidas."
          warning="Essa acao nao podera ser desfeita."
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={() => {
            if (alunoIdSelecionado !== null) {
              handleDelete(alunoIdSelecionado);
              setAlunoIdSelecionado(null);
              setConfirmationDelete(false);
            }
          }}
          onCancel={() => {
            setConfirmationDelete(false);
            setAlunoIdSelecionado(null);
          }}
        />
      )}
    </div>
  );
};
