import { useEffect, useState } from "react";

interface HabilidadeBNCC {
  id: number;
  codigo: string;
  descricao: string;
  componente_curricular: string;
  serie: string;
}

interface ModalBNCCEditProps {
  habilidadeId: number;
  onClose: () => void;
  onSave: () => void;
}

const series = [
  "PRIMEIRO_ANO", "SEGUNDO_ANO", "TERCEIRO_ANO", "QUARTO_ANO", "QUINTO_ANO",
  "SEXTO_ANO", "SETIMO_ANO", "OITAVO_ANO", "NONO_ANO", "PRIMEIRA_SERIE",
  "SEGUNDA_SERIE", "TERCEIRA_SERIE", "PRIMEIRO_E_SEGUNDO_ANOS",
  "TERCEIRO_AO_QUINTO_ANO", "PRIMEIRO_AO_QUINTO_ANO", "EJA"
];

export const ModalBNCCEdit = ({
  habilidadeId,
  onClose,
  onSave
}: ModalBNCCEditProps) => {
  const [habilidade, setHabilidade] = useState<HabilidadeBNCC | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/bncc/${habilidadeId}`)
      .then((res) => res.json())
      .then((data) => setHabilidade(data))
      .catch((err) => {
        console.error("Erro ao carregar habilidade:", err);
        alert("Erro ao carregar habilidade.");
        onClose();
      });
  }, [habilidadeId]);

  const handleUpdate = async () => {
    if (!habilidade) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bncc/${habilidadeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habilidade),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro ao atualizar habilidade:", errorText);
        alert("Erro ao atualizar habilidade.");
        return;
      }

      alert("Habilidade atualizada com sucesso!");
      onSave();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar habilidade.");
    }
  };

  if (!habilidade) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Editar Habilidade BNCC</h2>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">Código</label>
          <input
            type="text"
            value={habilidade.codigo}
            onChange={(e) => setHabilidade({ ...habilidade, codigo: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">Descrição</label>
          <textarea
            value={habilidade.descricao}
            onChange={(e) => setHabilidade({ ...habilidade, descricao: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl"
            rows={4}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">Componente Curricular</label>
          <input
            type="text"
            value={habilidade.componente_curricular}
            onChange={(e) => setHabilidade({ ...habilidade, componente_curricular: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-1">Série</label>
          <select
            value={habilidade.serie}
            onChange={(e) => setHabilidade({ ...habilidade, serie: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl"
          >
            {series.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdate}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};
