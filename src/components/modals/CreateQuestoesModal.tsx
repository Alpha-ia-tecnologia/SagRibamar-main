import { useEffect, useState } from "react";
import { ModalBNCC } from "./ModalBNCC";
import { Trash2 } from "lucide-react";
import { useApi } from "../../utils/api";

interface CreateQuestoesModalProps {
  provaId?: number;
  tituloProva?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Alternativa {
  texto: string;
  correta: boolean;
}

interface ComponenteCurricular {
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

  const mapaNiveis: Record<string, string> = {
    ANOS_INICIAIS: "Anos iniciais",
    ANOS_FINAIS: "Anos finais",
    ENSINO_MEDIO: "Ensino médio"
  };

  const mapaDificuldades: Record<string, string> = {
    FACIL: "Fácil",
    MEDIO: "Média",
    DIFICIL: "Difícil"
  };

  return (
    mapaSeries[texto] ||
    mapaNiveis[texto] ||
    mapaDificuldades[texto] ||
    texto.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  );
};

export const CreateQuestoesModal = ({ provaId, tituloProva, onClose, onSuccess }: CreateQuestoesModalProps) => {
  const [enunciado, setEnunciado] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [imagemPreview, setImagemPreview] = useState("");
  const [alternativas, setAlternativas] = useState<Alternativa[]>([
    { texto: "", correta: true },
    { texto: "", correta: false },
    { texto: "", correta: false },
    { texto: "", correta: false },
  ]);

  const [nivelEnsino, setNivelEnsino] = useState("ANOS_INICIAIS");
  const [serie, setSerie] = useState("PRIMEIRO_ANO");
  const [area, setArea] = useState("CIÊNCIAS HUMANAS");
  const [pontos, setPontos] = useState(1);
  const [componenteId, setComponenteId] = useState(1);
  const [componentes, setComponentes] = useState<ComponenteCurricular[]>([]);
  const [codigosBNCC, setCodigosBNCC] = useState<number[]>([]);
  const [habilidadesSelecionadas, setHabilidadesSelecionadas] = useState<{ id: number; codigo: string; nivel?: string }[]>([]);
  const [showModalBNCC, setShowModalBNCC] = useState(false);
  const [foiSalva, setFoiSalva] = useState(false);
  const [proficienciaSaebId, setProficienciaSaebId] = useState<number | null>(null);
  const [provaCriada, setProvaCriada] = useState<number | null>(provaId || null);
  const [proximoNumero, setProximoNumero] = useState<number>(1);
  const api = useApi();

  const niveis = ["ANOS_INICIAIS", "ANOS_FINAIS", "ENSINO_MEDIO"];
  const series = [
    "PRIMEIRO_ANO", "SEGUNDO_ANO", "TERCEIRO_ANO", "QUARTO_ANO", "QUINTO_ANO",
    "SEXTO_ANO", "SETIMO_ANO", "OITAVO_ANO", "NONO_ANO", "PRIMEIRA_SERIE",
    "SEGUNDA_SERIE", "TERCEIRA_SERIE", "PRIMEIRO_E_SEGUNDO_ANOS",
    "TERCEIRO_AO_QUINTO_ANO", "PRIMEIRO_AO_QUINTO_ANO", "EJA"
  ];
  // const dificuldades = ["FACIL", "MEDIO", "DIFICIL"];

  const areas = ["Ciências Humanas", "Ciências Exatas", "Ciências da Natureza", "Linguagens"]

  useEffect(() => {
    api.get(`/api/componentes-curriculares`)
      .then(res => res.json())
      .then(data => setComponentes(data || []));
  }, [api]);

  // Função para buscar o próximo número da questão
  const buscarProximoNumero = async (provaIdAtual: number) => {
    try {
      const res = await api.get(`/api/provas/${provaIdAtual}/questoes-detalhadas`);
      if (res.ok) {
        const data = await res.json();
        const questoes = data.questoes || [];
        const proximoNum = questoes.length + 1;
        setProximoNumero(proximoNum);
      }
    } catch (error) {
      console.error("Erro ao buscar próximo número:", error);
      setProximoNumero(1);
    }
  };

  // Buscar próximo número quando provaId for definido
  useEffect(() => {
    if (provaId) {
      buscarProximoNumero(provaId);
    }
  }, [provaId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("imagem", file);

    try {
      const res = await api.post(`/api/upload/questao-imagem`, formData, {
        headers: {}, // Remove Content-Type para permitir que o browser defina o boundary
      });

      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro ao enviar imagem:", errorText);
        alert("Erro ao enviar imagem.");
        return;
      }

      if (contentType?.includes("application/json")) {
        const data = await res.json();
        if (data.success && data.imagePath) {
          setImagemUrl(data.imagePath);
          setImagemPreview(`${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/${data.imagePath}`);
        } else {
          alert("Erro no upload: " + (data.message || "Resposta inválida"));
        }
      } else {
        const text = await res.text();
        console.error("Resposta inesperada:", text);
        alert("Resposta inesperada ao enviar imagem.");
      }
    } catch (err) {
      console.error("Erro no upload da imagem:", err);
      alert("Erro inesperado ao enviar imagem.");
    }
  };

  const limparFormulario = () => {
    setEnunciado("");
    setImagemUrl("");
    setImagemPreview("");
    setAlternativas([
      { texto: "", correta: true },
      { texto: "", correta: false },
      { texto: "", correta: false },
      { texto: "", correta: false },
    ]);
    setNivelEnsino("ANOS_INICIAIS");
    setSerie("PRIMEIRO_ANO");
    setArea("Selecione uma Área");
    setPontos(1);
    setComponenteId(0);
    setCodigosBNCC([]);
    setHabilidadesSelecionadas([]);
    setProficienciaSaebId(null);
    setFoiSalva(false);
    
    // Atualizar próximo número quando adicionar nova questão
    if (provaCriada) {
      buscarProximoNumero(provaCriada);
    }
  };

  const handleSubmit = async () => {
    let provaIdAtual: number | null = provaCriada;

    // Se não há prova criada ainda, criar uma nova
    if (!provaIdAtual && tituloProva) {
      try {
        const provaRes = await api.post(`/api/provas`, { nome: tituloProva });

        if (!provaRes.ok) {
          const errorText = await provaRes.text();
          console.error("Erro ao criar prova:", provaRes.status, errorText);
          alert("Erro ao criar prova.");
          return;
        }

        const provaSalva = await provaRes.json();
        provaIdAtual = provaSalva.id;
        setProvaCriada(provaIdAtual);
        // Buscar próximo número para a nova prova criada
        if (provaIdAtual) {
          buscarProximoNumero(provaIdAtual);
        }
      } catch (err) {
        alert("Erro ao criar prova. Veja o console para mais informações.");
        console.error(err);
        return;
      }
    }

    const payload = {
      enunciado,
      imagem_url: imagemUrl,
      nivel_ensino: nivelEnsino,
      campo_conhecimento: area && area !== "CIÊNCIAS HUMANAS" ? area.toUpperCase() : area,
      serie,
      pontos,
      prova_id: provaIdAtual,
      proficiencia_saeb_id: proficienciaSaebId,
      componente_curricular_id: componenteId,
      codigos_bncc: codigosBNCC,
      alternativas
    };

    try {
      const res = await api.post(`/api/questoes`, payload);
      console.log("aqui está o payload", payload);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro ao salvar questão:", res.status, errorText);
        alert("Erro ao salvar questão.");
        return;
      }

      setFoiSalva(true);

    } catch (err) {
      alert("Erro ao salvar questão. Veja o console para mais informações.");
      console.error(err);
    }
  };

  const marcarCorreta = (index: number) => {
    const novas = alternativas.map((alt, i) => ({
      ...alt,
      correta: i === index
    }));
    setAlternativas(novas);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-3xl p-6 rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto transition-all">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Adicionar Questão - {proximoNumero}</h2>

        <textarea
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
          placeholder="Digite o enunciado da questão"
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4 transition-all"
        />

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700 mb-2 block">Adicionar Imagem</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </label>
        
        {imagemPreview && (
          <div className="mb-4">
            <div className="relative inline-block w-fit rounded-lg overflow-hidden border">
            <img src={imagemPreview} alt="Preview" className="block h-48 w-auto" />
              <button 
              onClick={() => {
                setImagemUrl("");
                setImagemPreview("");
              }}
                className="absolute top-2 right-2 bg-white text-red-700 rounded-full px-2 py-1 shadow-md cursor-pointer border-black border-1"
                title="Apagar imagem">
                <Trash2 className="h-5 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <select value={nivelEnsino} onChange={(e) => setNivelEnsino(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all">
            {niveis.map(n => <option key={n} value={n}>{formatarTextoSelect(n)}</option>)}
          </select>

          <select 
          value={serie} 
          onChange={(e) => setSerie(e.target.value)} 
          className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          >
            {series.map(s => 
            <option 
            key={s} 
            value={s}>
              {formatarTextoSelect(s)}
            </option>)}
          </select>

          <select 
          value={area} 
          onChange={(e) => setArea(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all">
            {areas.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={componenteId} onChange={(e) => setComponenteId(Number(e.target.value))} className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all">
            <option value="">Componente Curricular</option>
            {componentes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowModalBNCC(true)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 transition-all"
        >
          {habilidadesSelecionadas.length > 0
            ? (() => {
                const maxToShow = 2;
                const shown = habilidadesSelecionadas.slice(0, maxToShow).map(h => h.codigo).join(", ");
                const remaining = habilidadesSelecionadas.length - maxToShow;
                return remaining > 0 ? `${shown} +${remaining}` : shown;
              })()
            : '+ Selecionar Habilidades BNCC/SAEB'}
        </button>

        {habilidadesSelecionadas.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {habilidadesSelecionadas.map((h) => (
              <span key={h.id} className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                {h.codigo}{h.nivel && ` (${h.nivel})`}
                <button
                  type="button"
                  onClick={() => {
                    setHabilidadesSelecionadas(prev => prev.filter(x => x.id !== h.id));
                    setCodigosBNCC(prev => prev.filter(id => id !== h.id));
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  aria-label={`Remover ${h.codigo}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {alternativas.map((alt, i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <input
              type="radio"
              name="correta"
              checked={alt.correta}
              onChange={() => marcarCorreta(i)}
              className="accent-blue-600"
            />
            <input
              type="text"
              value={alt.texto}
              onChange={(e) => {
                const novas = [...alternativas];
                novas[i].texto = e.target.value;
                setAlternativas(novas);
              }}
              placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
          </div>
        ))}

        {!foiSalva ? (
          <div className="flex justify-end mt-6 gap-4">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">
              Cancelar
            </button>
            <button onClick={handleSubmit} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all">
              Salvar Questão
            </button>
          </div>
        ) : (
          <div className="flex justify-end mt-6 gap-4">
            <button
              onClick={limparFormulario}
              className="px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all"
            >
              Adicionar Nova Questão
            </button>
            <button
              onClick={() => {
                onClose();
                if (onSuccess) onSuccess();
              }}
              className="px-5 py-2.5 rounded-xl bg-gray-600 text-white hover:bg-gray-700 transition-all"
            >
              Finalizar
            </button>
          </div>
        )}
      </div>

      {showModalBNCC && (
        <ModalBNCC
          componenteCurricularId={componenteId}
          onClose={() => setShowModalBNCC(false)}
          onSelect={async (habilidades, profId) => {
            let nivelDescricao = "";
            
            // Se há um ID de proficiência, buscar a descrição do nível
            if (profId) {
              try {
                const res = await api.get(`/api/bncc/${habilidades[0]?.id}/proficiencias`);
                if (res.ok) {
                  const data = await res.json();
                  const proficiencia = data.find((p: any) => p.id === profId);
                  if (proficiencia) {
                    nivelDescricao = `${proficiencia.nivel ?? ""}${proficiencia.nivel ? " - " : ""}${proficiencia.descricao ?? ""}`.trim();
                  }
                }
              } catch (error) {
                console.error("Erro ao buscar descrição do nível:", error);
              }
            }
            
            const selecionadas = habilidades.map(h => ({ 
              id: h.id, 
              codigo: h.codigo, 
              nivel: nivelDescricao || undefined 
            }));
            setHabilidadesSelecionadas(selecionadas);
            setCodigosBNCC(selecionadas.map(h => h.id));
            setProficienciaSaebId(profId ?? null);
            setShowModalBNCC(false);
          }}
        />
      )}
    </div>
  );
};
