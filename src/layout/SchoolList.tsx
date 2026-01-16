import { useEffect, useState } from "react";
import { IconButton } from "../components/IconButton";
import { useApi } from "../utils/api";
import { ConfirmDialog } from "../components/modals/ConfirmDialog";
import {
  BuildingLibraryIcon,
  MapPinIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { BuildingLibraryIcon as BuildingLibrarySolid } from "@heroicons/react/24/solid";

interface Regiao {
  id: number;
  nome: string;
}

interface Grupo {
  id: number;
  nome: string;
}

interface Escola {
  id: number;
  nome: string;
  regiao_id: number;
  grupo_id: number;
  regiao: Regiao;
  grupo: Grupo;
}

interface SchoolListProps {
  reload?: boolean;
  onReloadDone?: () => void;
  onEdit?: (id: number) => void;
  searchNome: string;
  regiaoId: number | null;
  grupoId: number | null;
}

export const SchoolList = ({
  reload,
  onReloadDone,
  onEdit,
  searchNome,
  regiaoId,
  grupoId,
}: SchoolListProps) => {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [confirmationDelete, setConfirmationDelete] = useState(false);
  const [escolaIdSelecionada, setEscoldaIdSelecionada] = useState<number | null>(null);
  const api = useApi();

  const fetchEscolas = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
      });

      if (searchNome.trim() !== "") queryParams.append("nome", searchNome);
      if (regiaoId !== null) queryParams.append("regiao_id", String(regiaoId));
if (grupoId !== null) queryParams.append("grupo_id", String(grupoId));

      const res = await api.get(`/api/escolas?${queryParams.toString()}`);

      const data = await res.json();
      setEscolas(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error("Erro ao buscar escolas", err);
    }
  };

  useEffect(() => {
    fetchEscolas();
  }, [page, searchNome, regiaoId, grupoId]);

  // Reseta a paginação para página 1 quando os filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [searchNome, regiaoId, grupoId]);

  useEffect(() => {
    if (reload) {
      fetchEscolas().then(() => onReloadDone?.());
    }
  }, [reload, onReloadDone]);

  const handleDelete = async (id: number) => {
    try {
      const res = await api.delete(`/api/escolas/${id}`);

      if (!res.ok) throw new Error("Erro ao excluir");

      fetchEscolas();
    } catch (err) {
      alert("Erro ao excluir escola");
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header da Lista */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <BuildingLibrarySolid className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Lista de Escolas</h3>
              <p className="text-sm text-gray-500">
                Pagina <span className="font-medium text-blue-600">{page}</span> de <span className="font-medium">{totalPages}</span> - Total: <span className="font-medium text-blue-600">{totalItems}</span> escolas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Escolas */}
      <div className="divide-y divide-gray-100">
        {escolas.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BuildingLibraryIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma escola encontrada</h3>
            <p className="text-gray-500">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          escolas.map((escola, index) => (
            <div
              key={escola.id}
              className="group px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar da Escola */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    index % 3 === 0 ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                    index % 3 === 1 ? "bg-gradient-to-br from-indigo-500 to-indigo-600" :
                    "bg-gradient-to-br from-violet-500 to-violet-600"
                  }`}>
                    <BuildingLibraryIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Informacoes da Escola */}
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {escola.nome}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        ID: {escola.id}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        {escola.regiao?.nome || `Regiao ${escola.regiao_id}`}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <TagIcon className="w-4 h-4 text-gray-400" />
                        {escola.grupo?.nome || `Grupo ${escola.grupo_id}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acoes */}
                <div className="flex items-center gap-2">
                  <IconButton type="edit" onClick={() => onEdit?.(escola.id)} />
                  <IconButton
                    type="delete"
                    onClick={() => {
                      setEscoldaIdSelecionada(escola.id);
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
      {escolas.length > 0 && (
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
          title="Tem certeza que deseja excluir essa escola?"
          description="Ao excluir uma escola, todas as provas, turmas e alunos vinculados a ela tambem serao excluidos."
          warning="Esta acao e irreversivel e resultara na perda de todos os dados associados a escola."
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={() => {
            if (escolaIdSelecionada != null) handleDelete(escolaIdSelecionada);
            setConfirmationDelete(false);
            setEscoldaIdSelecionada(null);
          }}
          onCancel={() => {
            setConfirmationDelete(false);
            setEscoldaIdSelecionada(null);
          }}
        />
      )}
    </div>
  );
};
