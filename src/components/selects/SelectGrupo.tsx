import { useEffect, useState } from "react";
import { useApi } from "../../utils/api";

interface Grupo {
  id: number;
  nome: string;
}

interface Props {
  regiaoId?: string;
  value: string;
  onChange: (id: string) => void;
}

export const SelectGrupo = ({ regiaoId, value, onChange }: Props) => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const api = useApi();

  useEffect(() => {
    const endpoint = regiaoId
      ? `/api/grupos?regiao_id=${regiaoId}`
      : `/api/grupos`;

    api.get(endpoint)
      .then((res) => res.json())
      .then((data) => {
        console.log("Grupos carregados:", data);
        setGrupos(data || []);
      })
      .catch((err) => {
        console.error("Erro ao carregar grupos:", err);
        setGrupos([]);
      });
  }, [regiaoId]);

  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">Grupo</label>
      <select
        className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Selecione um grupo</option>
        {grupos.map((g) => (
          <option key={g.id} value={g.id}>
            {g.nome}
          </option>
        ))}
      </select>
    </div>
  );
};
