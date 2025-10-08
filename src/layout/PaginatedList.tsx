import { useEffect, useState } from "react";
import { UserRow } from "../ui/UserRow";
import { CreateUserModal } from "../components/modals/CreateUserModal";
import { useApi } from "../utils/api";
import { ConfirmDialog } from "../components/modals/ConfirmDialog";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: string;
}

interface PaginatedListProps {
  reload?: boolean;
  onReloadDone?: () => void;
}

export const PaginatedList = ({ reload, onReloadDone }: PaginatedListProps) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUserId, setEditingUserId] = useState<number | null>(null); 
  const itemsPerPage = 5;
  const [confirmationDelete, setConfirmationDelete] = useState(false);
  const [idUser, setIdUser] = useState<number | null>(null);
  const api = useApi();

  const fetchUsuarios = async () => {
    const res = await api.get(`/api/usuarios`);
    const data = await res.json();
    setUsuarios(data);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (reload) {
      fetchUsuarios().then(() => onReloadDone?.());
    }
  }, [reload, onReloadDone]);

  const deleteUsuario = async (id: number) => {
    try {
      const res = await api.delete(`/api/usuarios/${id}`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao excluir usuário");
      }

      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.message || "Erro ao excluir usuário.");
    }
  };

  const handleEditSuccess = () => {
    setEditingUserId(null);
    fetchUsuarios(); 
  };

  const gerarBotoesPaginacao = (): (number | string)[] => {
    const botoes: (number | string)[] = [];
    const maxVisiveis = 3;

    if (totalPages <= maxVisiveis + 2) {
      for (let i = 1; i <= totalPages; i++) botoes.push(i);
    } else {
      if (currentPage <= maxVisiveis) {
        for (let i = 1; i <= maxVisiveis + 1; i++) botoes.push(i);
        botoes.push("...");
        botoes.push(totalPages);
      } else if (currentPage >= totalPages - maxVisiveis + 1) {
        botoes.push(1);
        botoes.push("...");
        for (let i = totalPages - maxVisiveis; i <= totalPages; i++) botoes.push(i);
      } else {
        botoes.push(1);
        botoes.push("...");
        botoes.push(currentPage - 1);
        botoes.push(currentPage);
        botoes.push(currentPage + 1);
        botoes.push("...");
        botoes.push(totalPages);
      }
    }

    return botoes;
  };

  const paginated = usuarios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(usuarios.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, usuarios.length);

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {paginated.map((usuario) => (
          <UserRow
            key={usuario.id}
            nome={usuario.nome}
            email={usuario.email}
            tipo_usuario={usuario.tipo_usuario}
            onEdit={() => setEditingUserId(usuario.id)} 
            onDelete={() => {
              setIdUser(usuario.id);
              setConfirmationDelete(true);
            }}
          />
        ))}

        {/* Paginação */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 text-sm text-gray-700 border-t border-gray-200">
          <p>
            Mostrando {start} a {end} de {usuarios.length} resultados
          </p>

          <div className="flex gap-2 items-center flex-wrap">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
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
                  onClick={() => setCurrentPage(num as number)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                    currentPage === num
                      ? "bg-blue-600 text-white border-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {num}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-100 disabled:opacity-40 transition"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {editingUserId && (
        <CreateUserModal
          userId={editingUserId}
          onClose={() => setEditingUserId(null)}
          onSuccess={handleEditSuccess}
        />
      )}
      {confirmationDelete && (
        <ConfirmDialog
          isOpen={confirmationDelete}
          title="Tem certeza que deseja excluir esse usuário?"
          description="Ao excluir um usuário, o mesmo não poderá mais acessar a plataforma com as mesmas informações de login."
          warning="Esta ação é irreversível."
          onConfirm={() => {
            if (idUser !== null) {
              deleteUsuario(idUser);
              setIdUser(null);
              setConfirmationDelete(false);
            }
          }}
          onCancel={() => {
            setIdUser(null);
            setConfirmationDelete(false);
          }}
        />
      )}
    </>
  );
};
