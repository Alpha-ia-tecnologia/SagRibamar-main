import { useState } from "react";
import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { ProvaList } from "../layout/ProvaList";
import { VisualizarProvaModal } from "../components/modals/VisualizarProvaModal";
import Footer from "../components/Footer";
import SelectTypeTest from "../components/modals/SelectTypeTest";

export default function ProvasPage() {
  const [showModal, setShowModal] = useState(false);
  const [, setEditId] = useState<number | null>(null);
  const [reload, setReload] = useState(false);
  const [visualizarId, setVisualizarId] = useState<number | null>(null);
  const [modoVisualizacao, setModoVisualizacao] = useState<boolean>(false); 

  const handleEdit = (id: number) => {
    setEditId(id);
    setShowModal(true);
  };

  return (
    <>
      <Header />

      <div className="p-8 bg-gray-100 min-h-screen">
        <PageHeader
          title="Avaliações"
          description="Gerenciamento de avaliações"
          actionLabel="Nova Prova"
          onActionClick={() => {
            setEditId(null);
            setShowModal(true);
          }}
        />

        <ProvaList
          reload={reload}
          onReloadDone={() => setReload(false)}
          onEdit={handleEdit}
          onVisualizar={(id, modoVisualizacao) => {
            setVisualizarId(id);
            setModoVisualizacao(modoVisualizacao ?? false);
          }}
        />
      </div>

      {showModal && (
        <SelectTypeTest
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setReload(true);
          }}
        />
      )}

      {visualizarId !== null && (
        <VisualizarProvaModal
          provaId={visualizarId}
          onClose={() => setVisualizarId(null)}
          modoVisualizacao={modoVisualizacao}
          onUpdate={() => setReload(true)}
        />
      )}
      <div>
        <Footer />
      </div>
    </>
  );
}
