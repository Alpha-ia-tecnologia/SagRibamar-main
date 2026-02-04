import { useEffect, useState } from "react";
import { UserRow } from "../ui/UserRow";
import { CreateUserModal } from "../components/modals/CreateUserModal";
import { useApi } from "../utils/api";
import { ConfirmDialog } from "../components/modals/ConfirmDialog";
import {
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { UsersIcon as UsersSolid } from "@heroicons/react/24/solid";

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header da Lista */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <UsersSolid className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Lista de Usuarios</h3>
                <p className="text-sm text-gray-500">
                  Pagina <span className="font-medium text-blue-600">{currentPage}</span> de <span className="font-medium">{totalPages}</span> - Total: <span className="font-medium text-blue-600">{usuarios.length}</span> usuarios
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="divide-y divide-gray-100">
          {paginated.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum usuario encontrado</h3>
              <p className="text-gray-500">Adicione um novo usuario para comecar</p>
            </div>
          ) : (
            paginated.map((usuario, index) => (
              <UserRow
                key={usuario.id}
                nome={usuario.nome}
                email={usuario.email}
                tipo_usuario={usuario.tipo_usuario}
                index={index}
                onEdit={() => setEditingUserId(usuario.id)}
                onDelete={() => {
                  setIdUser(usuario.id);
                  setConfirmationDelete(true);
                }}
              />
            ))
          )}
        </div>

        {/* Paginacao */}
        {paginated.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Mostrando <span className="font-medium text-gray-900">{start}</span> a <span className="font-medium text-gray-900">{end}</span> de <span className="font-medium text-gray-900">{usuarios.length}</span> resultados
              </p>

              <div className="flex items-center gap-1">
                {/* Primeira pagina */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  title="Primeira pagina"
                >
                  <ChevronDoubleLeftIcon className="w-4 h-4" />
                </button>

                {/* Pagina anterior */}
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
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
                        onClick={() => setCurrentPage(num as number)}
                        className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === num
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
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  title="Proxima pagina"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>

                {/* Ultima pagina */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  title="Ultima pagina"
                >
                  <ChevronDoubleRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edicao */}
      {editingUserId && (
        <CreateUserModal
          userId={editingUserId}
          onClose={() => setEditingUserId(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Dialog de Confirmacao */}
      {confirmationDelete && (
        <ConfirmDialog
          isOpen={confirmationDelete}
          title="Tem certeza que deseja excluir esse usuario?"
          description="Ao excluir um usuario, o mesmo nao podera mais acessar a plataforma com as mesmas informacoes de login."
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
