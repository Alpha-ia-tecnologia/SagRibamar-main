import { useEffect, useState } from "react";
import { IconButton } from "../components/IconButton";
import { useApi } from "../utils/api";
import { ConfirmDialog } from "../components/modals/ConfirmDialog";
import {
  UserGroupIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  ClockIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { UserGroupIcon as UserGroupSolid } from "@heroicons/react/24/solid";

interface Escola {
  id: number;
  nome: string;
}

interface Turma {
  id: number;
  nome: string;
  escola_id: number;
  escola: Escola;
  turno: string;
  serie: string;
  _count: { alunos: number }
}

interface TurmaListProps {
  reload?: boolean;
  onReloadDone?: () => void;
  onEdit?: (id: number) => void;
  searchNome: string;
  escolaId: number | null;
  serieId: string | null;
}

const formatarTextoSelect = (texto: string) => {
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

  const mapaTurnos: Record<string, string> = {
    MATUTINO: "Matutino",
    VESPERTINO: "Vespertino",
    NOTURNO: "Noturno"
  };

  return (
    mapaSeries[texto] ||
    mapaTurnos[texto] ||
    texto.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  );
};

const turnos = ["MATUTINO", "VESPERTINO", "NOTURNO"] as const;

const series = [
  "PRIMEIRO_ANO",
  "SEGUNDO_ANO",
  "TERCEIRO_ANO",
  "QUARTO_ANO",
  "QUINTO_ANO",
  "SEXTO_ANO",
  "SETIMO_ANO",
  "OITAVO_ANO",
  "NONO_ANO",
  "PRIMEIRA_SERIE",
  "SEGUNDA_SERIE",
  "TERCEIRA_SERIE",
  "EJA",
  "INFANTIL_I",
  "INFANTIL_II",
  "INFANTIL_III",
  "PRE_I",
  "PRE_II",
  "PRE_III",
  "CRECHE",
  "TURMA_DE_HABILIDADES"
] as const;

export const TurmaList = ({
  reload,
  onReloadDone,
  onEdit,
  searchNome,
  escolaId,
  serieId,
}: TurmaListProps) => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [turmaIdSelecionada, setTurmaIdSelecionada] = useState<number | null>(null);
  const [confirmationDelete, setConfirmationDelete] = useState(false);
  const api = useApi();

  const fetchTurmas = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
      });

      if (searchNome.trim() !== "") queryParams.append("nome", searchNome);
      if (escolaId !== null) queryParams.append("escola_id", String(escolaId));
      if (serieId !== null) queryParams.append("serie", serieId);

      const res = await api.get(`/api/turmas?${queryParams.toString()}`);

      const data = await res.json();
      setTurmas(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error("Erro ao buscar turmas", err);
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, [page, searchNome, escolaId, serieId]);

  // Reseta a paginação para página 1 quando os filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [searchNome, escolaId, serieId]);

  useEffect(() => {
    if (reload) {
      fetchTurmas().then(() => onReloadDone?.());
    }
  }, [reload, onReloadDone]);

  const handleDelete = async (id: number) => {
    try {
      const res = await api.delete(`/api/turmas/${id}`);

      if (!res.ok) throw new Error("Erro ao excluir");

      fetchTurmas();
    } catch (err) {
      alert("Erro ao excluir turma");
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
              <UserGroupSolid className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Lista de Turmas</h3>
              <p className="text-sm text-gray-500">
                Pagina <span className="font-medium text-blue-600">{page}</span> de <span className="font-medium">{totalPages}</span> - Total: <span className="font-medium text-blue-600">{totalItems}</span> turmas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Turmas */}
      <div className="divide-y divide-gray-100">
        {turmas.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma turma encontrada</h3>
            <p className="text-gray-500">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          turmas.map((turma, index) => (
            <div
              key={turma.id}
              className="group px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar da Turma */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    index % 3 === 0 ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                    index % 3 === 1 ? "bg-gradient-to-br from-indigo-500 to-indigo-600" :
                    "bg-gradient-to-br from-violet-500 to-violet-600"
                  }`}>
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Informacoes da Turma */}
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {turma.nome}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        ID: {turma.id}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <BuildingLibraryIcon className="w-4 h-4 text-gray-400" />
                        {turma.escola?.nome || "N/A"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                        {series.filter(s => s === turma.serie).map(s => formatarTextoSelect(s))}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        {turnos.filter(t => t === turma.turno).map(t => formatarTextoSelect(t))}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <UsersIcon className="w-4 h-4 text-gray-400" />
                        {turma._count.alunos} alunos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acoes */}
                <div className="flex items-center gap-2">
                  <IconButton type="edit" onClick={() => onEdit?.(turma.id)} />
                  <IconButton
                    type="delete"
                    onClick={() => {
                      setTurmaIdSelecionada(turma.id)
                      setConfirmationDelete(true)
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginacao */}
      {turmas.length > 0 && (
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
          title="Tem certeza que deseja excluir essa turma?"
          description="Ao excluir uma turma, todos os alunos vinculados a ela tambem serao excluidos."
          warning="Esta acao e irreversivel e resultara na perda de todos os dados associados a turma."
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={() => {
            if (turmaIdSelecionada != null) handleDelete(turmaIdSelecionada);
            setConfirmationDelete(false);
            setTurmaIdSelecionada(null);
          }}
          onCancel={()=> {
            setConfirmationDelete(false)
            setTurmaIdSelecionada(null);
          }}
        />
      )}
    </div>
  );
};
