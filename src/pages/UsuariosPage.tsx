import { useState } from "react";
import { PaginatedList } from "../layout/PaginatedList";
import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { CreateUserModal } from "../components/modals/CreateUserModal"; 
import Footer from "../components/Footer";

export const UsuariosPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [reloadList, setReloadList] = useState(false); 

  const handleSuccess = () => {
    setShowModal(false);
    setReloadList(true); 
  };

  return (
    <>
      <Header />
      <div className="p-12 bg-gray-100 min-h-screen">
        <PageHeader
          title="Usuários"
          description="Gerenciamento de usuários do sistema"
          actionLabel="Novo Usuário"
          onActionClick={() => setShowModal(true)}
        />
        <PaginatedList reload={reloadList} onReloadDone={() => setReloadList(false)} />
      </div>

      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
      <div>
        <Footer />
      </div>
    </>
  );
};
