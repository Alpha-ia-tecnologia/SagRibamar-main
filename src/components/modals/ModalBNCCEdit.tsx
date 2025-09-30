import { useEffect, useState } from "react";

interface HabilidadeBNCC {
  id: number;
  codigo: string;
  descricao: string;
  componente_curricular: string;
  serie: string;
}
interface Serie {
  value: string;
  label: string;
}

interface ModalBNCCEditProps {
  questaoId: number;
  codigosSelecionados: number[];
  onClose: () => void;
  onSave: (novosCodigos: number[], profId?: number | null) => void;
}

export const ModalBNCCEdit = ({
  questaoId,
  onClose,
  onSave,
}: ModalBNCCEditProps) => {
  const [habilidades, setHabilidades] = useState<HabilidadeBNCC[]>([]);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [serieFiltro, setSerieFiltro] = useState("");
  const [saebFiltro, setSaebFiltro] = useState("");
  const [niveis, setNiveis] = useState<{ id: number; nivel: string; descricao: string }[]>([]);
  const [proficienciaSelecionada, setProficienciaSelecionada] = useState<number | null>(null);
  const [series, setSeries] = useState<Serie[]>([]);

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
    const fetchTodas = async () => {
      try {
        const allParams = new URLSearchParams();
        if (serieFiltro) allParams.append("serie", serieFiltro);
        
        // Lógica específica para SAEB e BNCC
        if (saebFiltro === "true") {
          allParams.append("saeb", "true");
          allParams.append("bncc", "false");
        } else if (saebFiltro === "false") {
          allParams.append("saeb", "false");
          allParams.append("bncc", "true");
        }
        

        const [resSelecionadas, resTodas] = await Promise.all([
          fetch(`${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/bncc?questao_id=${questaoId}`),
          fetch(`${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/bncc?${allParams.toString()}`),
        ]);

        const dataSelecionadas = await resSelecionadas.json();
        const dataTodas = await resTodas.json();

        const selecionadasIds = dataSelecionadas.map((h: HabilidadeBNCC) => h.id);
        const habilidadesUnificadas = [
          ...dataSelecionadas,
          ...dataTodas.filter((h: HabilidadeBNCC) => !selecionadasIds.includes(h.id)),
        ];

        setHabilidades(habilidadesUnificadas);
        setSelecionada(selecionadasIds[0] ?? null);
      } catch (error) {
        console.error("Erro ao buscar habilidades BNCC:", error);
        alert("Erro ao carregar habilidades.");
      }
    };

    fetchTodas();
  }, [questaoId, serieFiltro, saebFiltro]);

  useEffect(() => {
    // Carrega níveis (proficiencias) com base na habilidade selecionada
    const fetchNiveisPorBNCC = async () => {
      if (!selecionada) {
        setNiveis([]);
        setProficienciaSelecionada(null);
        return;
      }
      
      try {
        const res = await fetch(`${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/bncc/${selecionada}/proficiencias`);
        if (!res.ok) {
          setNiveis([]);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          const normalizados = data.map((item: any) => ({
            id: item.id,
            nivel: item.nivel || "",
            descricao: item.descricao || item.nivel || ""
          }));
          setNiveis(normalizados);
        }
      } catch (e) {
        setNiveis([]);
      }
    };
    fetchNiveisPorBNCC();
  }, [selecionada]);


  const toggleSelecionada = (id: number) => {
    setSelecionada((prev) => (prev === id ? null : id));
  };

  const confirmarSelecao = async () => {
    onSave(selecionada != null ? [selecionada] : [], proficienciaSelecionada);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Editar Habilidades da BNCC
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <select
            value={serieFiltro}
            onChange={(e) => setSerieFiltro(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-sm"
          >
            <option value="">Todas as Séries</option>
            {series.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={saebFiltro}
            onChange={(e) => setSaebFiltro(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-sm"
          >
            <option value="">SAEB e BNCC</option>
            <option value="true">Somente SAEB</option>
            <option value="false">Somente BNCC</option>
          </select>

          <select
            value={proficienciaSelecionada || ""}
            onChange={(e) => setProficienciaSelecionada(e.target.value ? Number(e.target.value) : null)}
            className="p-3 border border-gray-300 rounded-xl text-sm"
            disabled={niveis.length === 0}
          >
            <option value="">Nível de Proficiência</option>
            {niveis.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nivel ? `${n.nivel} - ${n.descricao}` : n.descricao}
              </option>
            ))}
          </select>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-y-auto max-h-[300px] mb-4">
          {habilidades.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              Nenhuma habilidade encontrada.
            </p>
          ) : (
            habilidades.map((h) => (
              <div
                key={h.id}
                className="p-4 border-b last:border-b-0 flex items-start gap-3 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => toggleSelecionada(h.id)}
              >
                <input
                  type="radio"
                  name="bncc-habilidade-edit"
                  checked={selecionada === h.id}
                  onChange={() => toggleSelecionada(h.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 accent-blue-600"
                />
                <div>
                  <p className="font-medium text-sm text-gray-800">{h.codigo}</p>
                  <p className="text-sm text-gray-600">{h.descricao}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {selecionada == null && habilidades.length > 0 && (
          <p className="text-xs text-red-600 mb-4">Selecione uma habilidade para continuar.</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition"
          >
            Cancelar
          </button>
          <button
            onClick={confirmarSelecao}
            disabled={selecionada == null}
            className={`px-5 py-2.5 rounded-xl text-sm transition ${selecionada == null ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            Salvar Seleção
          </button>
        </div>
      </div>
    </div>
  );
};
