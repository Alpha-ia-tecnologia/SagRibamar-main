import { useState } from "react";
import { PaginatedList } from "../layout/PaginatedList";
import { CreateUserModal } from "../components/modals/CreateUserModal";
import {
  UsersIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export const UsuariosPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [reloadList, setReloadList] = useState(false);

  const handleSuccess = () => {
    setShowModal(false);
    setReloadList(true);
  };

  return (
    <>
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
        {/* Header da Página */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 sm:p-8 shadow-xl">
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-1/4 -mb-8 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-indigo-400/15 rounded-full blur-2xl"></div>

            {/* Padrão de pontos decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute top-8 left-16 w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="absolute top-12 left-4 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute bottom-8 right-20 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute bottom-4 right-32 w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Ícone principal com efeito glassmorphism */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
                  <div className="relative p-4 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                    <UsersIcon className="w-10 h-10 text-white" />
                  </div>
                  {/* Badge de destaque */}
                  <div className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full shadow-lg">
                    <SparklesIcon className="w-3 h-3 text-amber-900" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Usuários
                    </h1>
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium rounded-full border border-white/20">
                      Gerenciamento
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm sm:text-base">
                    Gerencie todos os usuários do sistema
                  </p>
                </div>
              </div>

              {/* Botão de novo usuário */}
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md group"
              >
                <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                Novo Usuário
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <section>
          <PaginatedList reload={reloadList} onReloadDone={() => setReloadList(false)} />
        </section>
      </main>

      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

    </>
  );
};
