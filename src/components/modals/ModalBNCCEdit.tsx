import { useEffect, useState } from "react";

interface HabilidadeBNCC {
  id: number;
  codigo: string;
  descricao: string;
  componente_curricular: string;
  serie: string;
}

interface ModalBNCCEditProps {
  questaoId: number;
  codigosSelecionados: number[];
  onClose: () => void;
  onSave: (novosCodigos: number[]) => void;
}

const series = [
  "PRIMEIRO_ANO", "SEGUNDO_ANO", "TERCEIRO_ANO", "QUARTO_ANO", "QUINTO_ANO",
  "SEXTO_ANO", "SETIMO_ANO", "OITAVO_ANO", "NONO_ANO", "PRIMEIRA_SERIE",
  "SEGUNDA_SERIE", "TERCEIRA_SERIE", "PRIMEIRO_E_SEGUNDO_ANOS",
  "TERCEIRO_AO_QUINTO_ANO", "PRIMEIRO_AO_QUINTO_ANO", "EJA"
];

export const ModalBNCCEdit = ({
  questaoId,
  onClose,
  onSave,
}: ModalBNCCEditProps) => {
  const [habilidades, setHabilidades] = useState<HabilidadeBNCC[]>([]);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [serieFiltro, setSerieFiltro] = useState("");
  const [saebFiltro, setSaebFiltro] = useState("");
  const [nivelFiltro, setNivelFiltro] = useState("");
  const [niveis, setNiveis] = useState<{ valor: string; descricao: string }[]>([]);

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
        
        if (nivelFiltro) allParams.append("nivel_ensino", nivelFiltro);

        const [resSelecionadas, resTodas] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/bncc?questao_id=${questaoId}`),
          fetch(`${import.meta.env.VITE_API_URL}/api/bncc?${allParams.toString()}`),
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
  }, [questaoId, serieFiltro, saebFiltro, nivelFiltro]);

  useEffect(() => {
    // Carrega níveis (proficiencias) com base no BNCC selecionado
    const fetchNiveisPorBNCC = async () => {
      if (selecionada == null) {
        setNiveis([]);
        setNivelFiltro("");
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bncc/${selecionada}/proficiencias`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapaNiveis = new Map<string, string>();
          for (const item of data) {
            const nivel = String(item.nivel ?? "");
            if (!nivel) continue;
            if (!mapaNiveis.has(nivel)) {
              mapaNiveis.set(nivel, String(item.descricao ?? nivel));
            }
          }
          const normalizados = Array.from(mapaNiveis.entries()).map(([valor, descricao]) => ({ valor, descricao }));
          setNiveis(normalizados);
        }
      } catch (e) {
        // silencioso
      }
    };
    fetchNiveisPorBNCC();
  }, [selecionada]);

  useEffect(() => {
    // Reseta o filtro se não houver níveis ou se o valor atual não existir mais
    if (niveis.length === 0) {
      if (nivelFiltro !== "") setNivelFiltro("");
      return;
    }
    const exists = niveis.some((n) => n.valor === nivelFiltro);
    if (!exists) setNivelFiltro("");
  }, [niveis]);

  const toggleSelecionada = (id: number) => {
    setSelecionada((prev) => (prev === id ? null : id));
  };

  const confirmarSelecao = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questoes/${questaoId}/vincular-bncc`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codigos_bncc: selecionada != null ? [selecionada] : [] }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Erro ao atualizar habilidades BNCC:", errText);
        alert("Erro ao salvar seleção de habilidades.");
        return;
      }

      onSave(selecionada != null ? [selecionada] : []);
      onClose();
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      alert("Erro inesperado ao salvar seleção.");
    }
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
              <option key={s} value={s}>{s}</option>
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
            value={nivelFiltro}
            onChange={(e) => setNivelFiltro(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-sm"
            disabled={niveis.length === 0}
          >
            <option value="">Todos os Níveis</option>
            {niveis.map((n) => (
              <option key={n.valor} value={n.valor}>{n.descricao}</option>
            ))}
          </select>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-y-auto max-h-[300px] mb-2">
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
