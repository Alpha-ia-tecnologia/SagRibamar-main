import { useState } from "react";
import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { AlunoList } from "../layout/AlunoList"; 
import { CreateAlunoModal } from "../components/modals/CreateAlunoModal"; 
import { AlunoFilter } from "../components/AlunoFilter"; 

export default function AlunosPage() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [reload, setReload] = useState(false);

  const [searchNome, setSearchNome] = useState("");
  const [escolaId, setEscolaId] = useState<number | null>(null);

  const handleSuccess = () => {
    setShowModal(false);
    setEditId(null);
    setReload(true);
  };

  const handleEdit = (id: number) => {
    setEditId(id);
    setShowModal(true);
  };

  const handleFilter = (nome: string, escolaId: number | null) => {
    setSearchNome(nome);
    setEscolaId(escolaId);
  };

  return (
    <>
      <Header />
      <div className="pt-20 p-12 bg-gray-100 min-h-screen">
        <PageHeader
          title="Alunos"
          description="Gerenciamento de alunos"
          actionLabel="Novo Aluno"
          onActionClick={() => {
            setEditId(null);
            setShowModal(true);
          }}
        />

        <AlunoFilter onFilter={handleFilter} />

        <AlunoList
          reload={reload}
          onReloadDone={() => setReload(false)}
          onEdit={handleEdit}
          searchNome={searchNome}
          escolaId={escolaId}
        />
      </div>

      {showModal && (
        <CreateAlunoModal
          alunoId={editId}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
