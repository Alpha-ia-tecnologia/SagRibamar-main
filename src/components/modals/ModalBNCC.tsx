import { useEffect, useState } from "react";

interface HabilidadeBNCC {
  id: number;
  codigo: string;
  descricao: string;
  componente_curricular: string;
  serie: string;
}

interface Proficiencia {
  id: number;
  nivel?: string | null;
  descricao?: string | null;
}

interface NivelNormalizado {
  valor: string;
  descricao: string;
}

interface ModalBNCCProps {
  componenteCurricularId: number;
  onClose: () => void;
  onSelect: (habilidades: HabilidadeBNCC[], proficienciaId: number | null) => void;
}

const series = [
  "PRIMEIRO_ANO", "SEGUNDO_ANO", "TERCEIRO_ANO", "QUARTO_ANO", "QUINTO_ANO",
  "SEXTO_ANO", "SETIMO_ANO", "OITAVO_ANO", "NONO_ANO", "PRIMEIRA_SERIE",
  "SEGUNDA_SERIE", "TERCEIRA_SERIE", "PRIMEIRO_E_SEGUNDO_ANOS",
  "TERCEIRO_AO_QUINTO_ANO", "PRIMEIRO_AO_QUINTO_ANO", "EJA"
];

export const ModalBNCC = ({
  componenteCurricularId,
  onClose,
  onSelect
}: ModalBNCCProps) => {
  const [habilidades, setHabilidades] = useState<HabilidadeBNCC[]>([]);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [serieFiltro, setSerieFiltro] = useState("");
  const [saebFiltro, setSaebFiltro] = useState("");
  const [nivelFiltro, setNivelFiltro] = useState("");
  const [niveis, setNiveis] = useState<NivelNormalizado[]>([]);

  const fetchHabilidades = async () => {
    const params = new URLSearchParams();

    if (componenteCurricularId)
      params.append("componente_curricular_id", componenteCurricularId.toString());
    if (serieFiltro) params.append("serie", serieFiltro);

    if (saebFiltro === "true") {
      params.append("saeb", "true");
      params.append("bncc", "false");
    } else if (saebFiltro === "false") {
      params.append("saeb", "false");
      params.append("bncc", "true");
    }

    try {
      const res = await fetch(
        `${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/bncc?${params.toString()}`
      );
      if (!res.ok) throw new Error("Erro ao buscar habilidades BNCC");
      const data: unknown = await res.json();
      setHabilidades(Array.isArray(data) ? (data as HabilidadeBNCC[]) : []);
    } catch (error) {
      console.error("Erro ao buscar habilidades BNCC:", error);
      setHabilidades([]);
    }
  };

  useEffect(() => {
    fetchHabilidades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serieFiltro, saebFiltro, componenteCurricularId]);

  useEffect(() => {
    const fetchNiveisPorBNCC = async () => {
      if (selecionada == null) {
        setNiveis([]);
        setNivelFiltro("");
        return;
      }
      try {
        const res = await fetch(
          `${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/bncc/${selecionada}/proficiencias`
        );
        if (!res.ok) {
          setNiveis([]);
          return;
        }
        const data: unknown = await res.json();
        if (Array.isArray(data)) {
          const normalizados: NivelNormalizado[] = (data as Proficiencia[]).map((p) => ({
            valor: String(p.id),
            descricao: `${p.nivel ?? ""}${p.nivel ? " - " : ""}${p.descricao ?? ""}`.trim(),
          }));
          setNiveis(normalizados);
        } else {
          setNiveis([]);
        }
      } catch (e) {
        console.error("Erro ao buscar níveis:", e);
        setNiveis([]);
      }
    };

    fetchNiveisPorBNCC();
  }, [selecionada]);

  useEffect(() => {
    if (niveis.length === 0) {
      if (nivelFiltro !== "") setNivelFiltro("");
      return;
    }
    const exists = niveis.some((n) => n.valor === nivelFiltro);
    if (!exists) setNivelFiltro("");
  }, [niveis, nivelFiltro]);

  const toggleSelecionada = (id: number) => {
    setSelecionada((prev) => (prev === id ? null : id));
  };

  const confirmarSelecao = () => {
    if (selecionada == null) {
      onSelect([], null);
      onClose();
      return;
    }

    const escolhida = habilidades.find((h) => h.id === selecionada);
    const profId = nivelFiltro ? Number(nivelFiltro) : null;
    onSelect(escolhida ? [escolhida] : [], profId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Selecionar Habilidades da BNCC
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <select
            value={serieFiltro}
            onChange={(e) => setSerieFiltro(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-sm"
          >
            <option value="">Todas as Séries</option>
            {series.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
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
            <option value="">Níveis (opcional)</option>
            {niveis.map((n) => (
              <option key={n.valor} value={n.valor}>
                {n.descricao}
              </option>
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
                className="p-4 border-b last:border-b-0 flex items-start gap-3 hover:bg-gray-300 transition cursor-pointer"
                onClick={() => toggleSelecionada(h.id)}
              >
                <input
                  type="radio"
                  name="bncc-habilidade"
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
          <p className="text-xs text-red-600 mb-4">
            Selecione uma habilidade para continuar.
          </p>
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
            className={`px-5 py-2.5 rounded-xl text-sm transition ${
              selecionada == null
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Confirmar Seleção
          </button>
        </div>
      </div>
    </div>
  );
};
