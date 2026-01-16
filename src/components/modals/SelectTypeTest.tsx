import { useState } from "react";
import { CreateProvaModal } from "./CreateProvaModal";
import { BancoQuestoesModal } from "./BancoQuestoesModal";

interface SelectTypeTestProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SelectTypeTest({ onClose, onSuccess }: SelectTypeTestProps) {
  const [showModalManual, setShowModalManual] = useState(false);
  const [showModalBanco, setShowModalBanco] = useState(false);
  const [tituloProva, setTituloProva] = useState("");
  const [provaId, setProvaId] = useState<number | null>(null);

  const handleBancoQuestoes = () => {
    if (!tituloProva.trim()) {
      alert("Por favor, digite um nome para a prova primeiro.");
      return;
    }
    setShowModalBanco(true);
    setProvaId(null)
  };

  const handleCriarManual = () => {
    if (!tituloProva.trim()) {
      alert("Por favor, digite um nome para a prova primeiro.");
      return;
    }
    setShowModalManual(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex justify-center items-center z-50">
        <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Como deseja criar a prova?
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Prova
              </label>
              <input
                type="text"
                value={tituloProva}
                onChange={(e) => setTituloProva(e.target.value)}
                placeholder="Ex: Prova de Matemática"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={handleBancoQuestoes}
              disabled={!tituloProva.trim()}
              className={`w-full px-4 py-3 rounded-lg text-white font-medium transition ${
                !tituloProva.trim()
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Banco de Questões
            </button>

            <button
              onClick={handleCriarManual}
              disabled={!tituloProva.trim()}
              className={`w-full px-4 py-3 rounded-lg text-white font-medium transition ${
                !tituloProva.trim()
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
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
        <CreateProvaModal
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
        />
      )}
    </>
  );
}