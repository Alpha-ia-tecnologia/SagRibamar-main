import { useState, useEffect } from "react";
import { CreateQuestoesModal } from "../modals/CreateQuestoesModal";
interface ProvaModalProps {
  provaId: number | null;
  tituloProva?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProvaModal = ({ provaId, tituloProva, onClose, onSuccess }: ProvaModalProps) => {
  const [titulo, setTitulo] = useState(tituloProva || "");
  const [mostrarQuestoesModal, setMostrarQuestoesModal] = useState(false);

  // Se o título vier como prop, abre direto o modal de questões
  useEffect(() => {
    if (tituloProva && tituloProva.trim() && !provaId) {
      setMostrarQuestoesModal(true);
    }
  }, [tituloProva, provaId]);

  const handleSubmit = () => {
    if (!titulo.trim()) {
      alert("Por favor, digite um nome para a prova.");
      return;
    }
    setMostrarQuestoesModal(true);
  };

  const handleQuestoesFinalizadas = () => {
    setMostrarQuestoesModal(false);
    onSuccess();
  };

  const handleCancelarQuestoes = () => {
    setMostrarQuestoesModal(false);
  };

  // Se o título já foi fornecido, não mostra o formulário, vai direto para questões
  if (tituloProva && tituloProva.trim() && !provaId) {
    return (
      <>
        {mostrarQuestoesModal && (
          <CreateQuestoesModal
            tituloProva={titulo}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">{provaId ? "Editar Prova" : "Criar Nova Prova"}</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Prova</label>
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ex: Prova de Matemática"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
              {provaId ? "Salvar" : "Criar e Adicionar Questões"}
            </button>
          </div>
        </div>
      </div>

      {mostrarQuestoesModal && (
        <CreateQuestoesModal
          tituloProva={titulo}
          onClose={handleCancelarQuestoes}
          onSuccess={handleQuestoesFinalizadas}
        />
      )}

    </>
  );
};
