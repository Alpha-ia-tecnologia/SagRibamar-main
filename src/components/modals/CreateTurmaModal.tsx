import { useEffect, useState, useRef } from "react";
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

interface Serie {
  value: string;
  label: string;
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
    EJA: "EJA"
  };

  const mapaTurnos: Record<string, string> = {
    MATUTINO: "Matutino",
    VESPERTINO: "Vespertino",
    NOTURNO: "Noturno"
  };

  return (
    mapaSeries[texto] ||
    mapaTurnos[texto] ||
    texto.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  );
};

const turnos = ["MATUTINO", "VESPERTINO", "NOTURNO"] as const;

export const CreateTurmaModal = ({ turmaId, onClose, onSuccess }: CreateTurmaModalProps) => {
  const [escolaId, setEscolaId] = useState<number | "">("");
  const [nome, setNome] = useState("");
  const [serie, setSerie] = useState<string>("");
  const [turno, setTurno] = useState<string>("");
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(false);
  const dadosCarregadosRef = useRef(false);
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

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await api.get(`/api/enums/series`);
        if (!res.ok) throw new Error("Erro ao buscar séries");
        const data: Serie[] = await res.json();
        setSeries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar séries:", error);
        setSeries([]);
      }
    };

    fetchSeries();
  }, [api]);

  // Buscar dados da turma se estiver editando
  useEffect(() => {
    if (turmaId && !dadosCarregadosRef.current) {
      dadosCarregadosRef.current = true;
      const fetchTurma = async () => {
        try {
          const res = await api.get(`/api/turmas/${turmaId}`);
          if (!res.ok) throw new Error("Erro ao buscar turma");
          
          const data = await res.json();
          setNome(data.nome || "");
          setEscolaId(data.escola_id || "");
          setSerie(data.serie || "");
          setTurno(data.turno || "");
        } catch (error) {
          console.error("Erro ao carregar turma:", error);
          alert("Erro ao carregar dados da turma");
          dadosCarregadosRef.current = false; // Permite tentar novamente em caso de erro
        }
      };

      fetchTurma();
    }
  }, [turmaId, api]);

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
      if (!res.ok) {
        let errorMessage = "Erro ao salvar turma";
        
        try {
          const errorText = await res.text();
          console.error("Erro da API:", errorText);
          
          if (errorText && errorText.trim()) {
            // Tenta parsear como JSON
            try {
              const errorData = JSON.parse(errorText);
              // A API retorna { "error": "mensagem" }
              errorMessage = errorData.error || errorData.message || errorData.detail || errorText.trim();
            } catch {
              // Se não for JSON, usa o texto direto
              errorMessage = errorText.trim();
            }
          }
        } catch (parseError) {
          console.error("Erro ao ler resposta de erro:", parseError);
        }
        
        alert(errorMessage);
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      let errorMessage = "Erro ao salvar turma";
      
      if (err instanceof Error && err.message !== "Erro ao salvar turma") {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
      console.error("Erro ao salvar turma:", err);
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
              {!turmaId && (
                <option 
                value=""
                disabled>
                  Selecione uma escola
                </option>
              )}
              {escolas.map((escola) => (
                <option 
                key={escola.id} 
                value={escola.id}>
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
                {!turmaId && (
                  <option 
                  value=""
                  disabled>
                    Selecione uma Série
                  </option>
                )}
                {series.map(s => (
                  <option 
                  key={s.value}
                  value={s.value}>
                    {s.label}
                  </option>))}
             </select>
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Turno</label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            >
              {!turmaId && (
                <option 
                value=""
                disabled>
                  Selecione um Turno
                </option>
              )}
              {turnos.map(t => 
              <option
              key={t}
              value={t}>
                {formatarTextoSelect(t)}
              </option>)}
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
