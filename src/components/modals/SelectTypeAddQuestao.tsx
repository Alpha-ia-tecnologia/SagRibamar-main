import { useState } from "react";
import { CreateQuestoesModal } from "./CreateQuestoesModal";
import { BancoQuestoesModal } from "./BancoQuestoesModal";

interface SelectTypeAddQuestaoProps {
  provaId: number;
  tituloProva: string;
  onClose: () => void;
  onSuccess?: () => void;
  onRefresh?: () => void;
}

export default function SelectTypeAddQuestao({
  provaId,
  tituloProva,
  onClose,
  onSuccess,
  onRefresh,
}: SelectTypeAddQuestaoProps) {
  const [showModalManual, setShowModalManual] = useState(false);
  const [showModalBanco, setShowModalBanco] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex justify-center items-center z-50">
        <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Como deseja adicionar a questão?
          </h2>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => setShowModalBanco(true)}
              className="w-full px-4 py-3 rounded-lg text-white font-medium transition bg-green-600 hover:bg-green-700"
            >
              Banco de Questões
            </button>

            <button
              onClick={() => setShowModalManual(true)}
              className="w-full px-4 py-3 rounded-lg text-white font-medium transition bg-blue-600 hover:bg-blue-700"
            >
              Criar Manualmente
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {showModalManual && (
        <CreateQuestoesModal
          provaId={provaId}
          tituloProva={tituloProva}
          onClose={() => setShowModalManual(false)}
          onSuccess={() => {
            setShowModalManual(false);
            onSuccess?.();
          }}
        />
      )}

      {showModalBanco && (
        <BancoQuestoesModal
          provaId={provaId}
          tituloProva={tituloProva}
          onClose={() => setShowModalBanco(false)}
          onSuccess={() => {
            setShowModalBanco(false);
            onSuccess?.();
          }}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}

