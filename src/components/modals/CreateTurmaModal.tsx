import { useEffect, useState } from "react";
import { useApi } from "../../utils/api";

interface CreateTurmaModalProps {
  turmaId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface Escola {
  id: number;
  nome: string;
}

const formatarTextoSelect = (texto: string) => {
  const mapaSeries: Record<string, string> = {
    PRIMEIRO_ANO: "1° ano",
    SEGUNDO_ANO: "2° ano",
    TERCEIRO_ANO: "3° ano",
    QUARTO_ANO: "4° ano",
    QUINTO_ANO: "5° ano",
    SEXTO_ANO: "6° ano",
    SETIMO_ANO: "7° ano",
    OITAVO_ANO: "8° ano",
    NONO_ANO: "9° ano",
    PRIMEIRA_SERIE: "1ª série",
    SEGUNDA_SERIE: "2ª série",
    TERCEIRA_SERIE: "3ª série",
    PRIMEIRO_E_SEGUNDO_ANOS: "1° e 2° anos",
    TERCEIRO_AO_QUINTO_ANO: "3° ao 5° ano",
    PRIMEIRO_AO_QUINTO_ANO: "1° ao 5° ano",
    EJA: "EJA"
  };

  const mapaTurnos: Record<string, string> = {
    MANHA: "Matutino",
    TARDE: "Vespertino",
    NOITE: "Noturno"
  };

  return (
    mapaSeries[texto] ||
    mapaTurnos[texto] ||
    texto.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  );
};

const turnos = ["MANHA", "TARDE", "NOITE"] as const;

const series = [
  "PRIMEIRO_ANO",
  "SEGUNDO_ANO",
  "TERCEIRO_ANO",
  "QUARTO_ANO",
  "QUINTO_ANO",
  "SEXTO_ANO",
  "SETIMO_ANO",
  "OITAVO_ANO",
  "NONO_ANO",
  "PRIMEIRA_SERIE",
  "SEGUNDA_SERIE",
  "TERCEIRA_SERIE",
  "PRIMEIRO_E_SEGUNDO_ANOS",
  "TERCEIRO_AO_QUINTO_ANO",
  "PRIMEIRO_AO_QUINTO_ANO",
  "EJA",
] as const;

export const CreateTurmaModal = ({ turmaId, onClose, onSuccess }: CreateTurmaModalProps) => {
  const [escolaId, setEscolaId] = useState<number | "">("");
  const [nome, setNome] = useState("");
  const [serie, setSerie] = useState<string>("");
  const [turno, setTurno] = useState<string>("");
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(false);
  const api = useApi();

  useEffect(() => {
    const fetchEscolas = async () => {
      const res = await api.get(`/api/escolas?limit=200`);
      const data = await res.json();
      const lista = Array.isArray(data) ? data : data.data;
      setEscolas(Array.isArray(lista) ? lista : []);
    };

    fetchEscolas();
  }, [api]);

  const handleSubmit = async () => {
    if (!nome.trim() || escolaId === "" || serie === "" || turno === "") {
      alert("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    const payload = {
      nome,
      escola_id: Number(escolaId),
      serie, 
      turno, 
    };

    try {
      const res = turmaId 
        ? await api.put(`/api/turmas/${turmaId}`, payload)
        : await api.post(`/api/turmas`, payload);

      if (!res.ok) throw new Error("Erro ao salvar turma");

      onSuccess();
    } catch (err) {
      alert("Erro ao salvar turma");
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">
          {turmaId ? "Editar Turma" : "Adicionar Nova Turma"}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Escola</label>
            <select
              value={escolaId}
              onChange={(e) =>
                setEscolaId(e.target.value === "" ? "" : parseInt(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            >
              <option value="">Selecione uma escola</option>
              {escolas.map((escola) => (
                <option key={escola.id} value={escola.id}>
                  {escola.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Nome da Turma</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Série</label>
            <select
              value={serie}
              onChange={(e) => setSerie(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              >
              {series.map(s => <option key={s} value={s}>{formatarTextoSelect(s)}</option>)}
             </select>
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Turno</label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            >
              {turnos.map(t => <option key={t} value={t}>{formatarTextoSelect(t)}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};
