import { useEffect, useState } from "react";

interface CreateHabilidadeModalProps {
  onClose: () => void;
}

interface Serie {
  value: string;
  label: string;
}

interface ComponenteCurricular {
  id: number;
  nome: string;
}

export const CreateHabilidadeModal = ({onClose}: CreateHabilidadeModalProps) => {
  const [series, setSeries] = useState<Serie[]>([]);
  const [componenteId, setComponenteId] = useState<number>(0);
  const [componentes, setComponentes] = useState<ComponenteCurricular[]>([]);
  const [serie, setSerie] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [saeb, setSaeb] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [foiSalva, setFoiSalva] = useState(false);

  const fetchSeries = async () => {
    try {
      const res = await fetch(`${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/enums/series`);
      if (!res.ok) throw new Error("Erro ao buscar séries");
      const data: Serie[] = await res.json();
      setSeries(data);
    } catch (error) {
      console.error("Erro ao buscar séries:", error);
      setSeries([]);
    }
  };
  useEffect(() => {
    fetchSeries();
  }, []);

  useEffect(() => {
    fetch(`${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/componentes-curriculares`)
      .then(res => res.json())
      .then(data => setComponentes(data || []));
  }, []);

  const limparFormulario = () => {
    setCodigo("");
    setDescricao("");
    setSerie("");
    setComponenteId(0);
    setSaeb(false);
    setError("");
    setSuccess(false);
    setFoiSalva(false);
  };

  const handleCreateHabilidade = async () => {
    // Validação dos campos obrigatórios
    if (!codigo.trim()) {
      setError("Código é obrigatório");
      return;
    }
    if (!descricao.trim()) {
      setError("Descrição é obrigatória");
      return;
    }
    if (!serie) {
      setError("Série é obrigatória");
      return;
    }
    if (!componenteId) {
      setError("Componente curricular é obrigatório");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const habilidadeData = {
        codigo: codigo.trim(),
        descricao: descricao.trim(),
        serie: serie,
        saeb: saeb,
        componente_curricular_id: componenteId
      };

      const response = await fetch(`${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/bncc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habilidadeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar habilidade');
      }

      setSuccess(true);
      setFoiSalva(true);

    } catch (error) {
      console.error("Erro ao criar habilidade:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar habilidade");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white h-80 w-[40vw] rounded-lg overflow-auto shadow-lg">
        <div className="flex h-full flex-col p-4">
          <h2 className="font-medium">Digite abaixo o código que deseja criar:</h2>
          <input 
            type="text" 
            className="w-full h-8 border-1 rounded-lg mt-1 mb-3 border-gray-400 px-1 py-5" 
            placeholder="Exemplo: EF01LP01"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <h2 className="font-medium">Descrição:</h2>
          <input 
            type="text" 
            className="w-full h-8 border-1 rounded-lg mt-1 mb-6 border-gray-400 px-1 py-5" 
            placeholder="Exemplo: Distinguir as letras do alfabeto de outros sinais gráficos."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          
          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
            <select 
              onChange={(e) => setSaeb(e.target.value === "true")} 
              value={saeb.toString()} 
              className="border-1 border-gray-400 py-1 rounded-lg"
            >
              <option value="" disabled hidden>Tipo de Habilidade</option>
              <option value="false">BNCC</option>
              <option value="true">SAEB</option>
            </select>
            <select 
              value={serie} 
              onChange={(e) => setSerie(e.target.value)} 
              className="border-1 border-gray-400 py-2 rounded-lg"
            >
              <option value="" disabled hidden>Série</option>
              {series.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select 
              value={componenteId} 
              onChange={(e) => setComponenteId(Number(e.target.value))} 
              className="border-1 border-gray-400 py-1 rounded-lg"
            >
              <option value={0} disabled hidden>Componente Curricular</option>
              {componentes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Mensagens de feedback */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
              Habilidade criada com sucesso!
            </div>
          )}

          {!foiSalva ? (
            <div className="flex justify-end mt-auto gap-4">
              <button 
                onClick={handleCreateHabilidade}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-md bg-blue-600 text-white cursor-pointer hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Criando..." : "Criar Habilidade"}
              </button>
              <button 
                onClick={onClose}
                className="px-2.5 py-1.5 rounded-md bg-gray-300 cursor-pointer hover:bg-gray-500 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex justify-end mt-auto gap-4">
              <button
                onClick={limparFormulario}
                className="px-2.5 py-1.5 rounded-md bg-green-600 text-white cursor-pointer hover:bg-green-700"
              >
                Criar Nova Habilidade
              </button>
              <button
                onClick={onClose}
                className="px-2.5 py-1.5 rounded-md bg-gray-600 text-white cursor-pointer hover:bg-gray-700"
              >
                Finalizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}