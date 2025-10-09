import { useEffect, useState } from "react";
import { IconButton } from "../components/IconButton";
import { useApi } from "../utils/api";
import { ConfirmDialog } from "../components/modals/ConfirmDialog";

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
    PRIMEIRO_E_SEGUNDO_ANOS: "1° e 2° anos",
    TERCEIRO_AO_QUINTO_ANO: "3° ao 5° ano",
    PRIMEIRO_AO_QUINTO_ANO: "1° ao 5° ano",
    EJA: "EJA"
  };

  const mapaTurnos: Record<string, string> = {
    MANHA: "Matutino",
    TARDE: "Vespertino",
    NOITE: "Noturno"
  };

  return (
    mapaSeries[texto] ||
    mapaTurnos[texto] ||
    texto.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  );
};

const turnos = ["MANHA", "TARDE", "NOITE"] as const;

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
  "PRIMEIRO_E_SEGUNDO_ANOS",
  "TERCEIRO_AO_QUINTO_ANO",
  "PRIMEIRO_AO_QUINTO_ANO",
  "EJA",
] as const;

export const TurmaList = ({
  reload,
  onReloadDone,
  onEdit,
  searchNome,
  escolaId,
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
  }, [page, searchNome, escolaId]);

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
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-5 py-3 bg-blue-50 border-b border-gray-200 font-semibold text-sm text-gray-800">
        Mostrando página <strong>{page}</strong> de <strong>{totalPages}</strong> - Total: {totalItems} turmas
      </div>

      {turmas.map((turma) => (
        <div
          key={turma.id}
          className="flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition duration-150"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
              📚
            </div>
            <div>
              <p className="text-blue-700 font-semibold hover:underline cursor-pointer">
                {turma.nome}
              </p>
              <p className="text-sm text-gray-500">
                ID: {turma.id} | 
                Escola: {turma.escola?.nome || "N/A"} | 
                Série: {series.filter(s => s === turma.serie).map(s => formatarTextoSelect(s))} | 
                Turno: {turnos.filter(t => t === turma.turno).map(t => formatarTextoSelect(t))} | 
                Alunos: {turma._count.alunos} 
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <IconButton type="edit" onClick={() => onEdit?.(turma.id)} />
            <IconButton 
            type="delete" 
            onClick={() => {
              setTurmaIdSelecionada(turma.id)
              setConfirmationDelete(true)
            }} />
          </div>
        </div>
      ))}

      {/* Paginação */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 text-sm text-gray-700 border-t border-gray-200">
        <p>
          Mostrando {(page - 1) * 10 + 1} a {Math.min(page * 10, totalItems)} de {totalItems} resultados
        </p>

        <div className="flex gap-2 items-center flex-wrap">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-100 disabled:opacity-40 transition"
          >
            &lt;
          </button>

          {gerarBotoesPaginacao().map((num, i) =>
            num === "..." ? (
              <span
                key={`dots-${i}`}
                className="px-3 py-1.5 text-gray-400 text-sm"
              >
                ...
              </span>
            ) : (
              <button
                key={num}
                onClick={() => setPage(num as number)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                  page === num
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                {num}
              </button>
            )
          )}

          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-100 disabled:opacity-40 transition"
          >
            &gt;
          </button>
          {confirmationDelete && (
            <ConfirmDialog
            isOpen={confirmationDelete}
            title="Tem certeza que deseja excluir essa turma?"
            description="Ao excluir uma turma, todos os alunos vinculados a ela também serão excluídos."
            warning="Esta ação é irreversível e resultará na perda de todos os dados associados à turma."
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
          />)}
        </div>
      </div>
    </div>
  );
};
