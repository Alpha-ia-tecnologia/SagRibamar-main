import { useEffect, useRef, useState } from "react";
import { EditarQuestaoModal } from "./EditQuestaoModal";
import { CreateQuestoesModal } from "./CreateQuestoesModal";
import { useApi } from "../../utils/api";
import { SquarePen } from "lucide-react";

interface VisualizarProvaModalProps {
  provaId: number;
  onClose: () => void;
  modoVisualizacao?: boolean; // true quando aberto via botão "eye", false quando via "squarepen"
  onUpdate?: () => void; // callback para notificar atualização da prova
}

interface Alternativa {
  id: number;
  texto: string;
  correta: boolean;
}

interface Questao {
  id: number;
  enunciado: string;
  imagem_url?: string;
  pontos: number;
  alternativas: Alternativa[];
}

interface Prova {
  id: number;
  nome: string;
  arquivo_url?: string;
}

export const VisualizarProvaModal = ({
  provaId,
  onClose,
  modoVisualizacao = false,
  onUpdate,
}: VisualizarProvaModalProps) => {
  const [prova, setProva] = useState<Prova | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [questaoIdEmEdicao, setQuestaoIdEmEdicao] = useState<number | null>(
    null
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const api = useApi();

  const carregarQuestoes = () => {
    setLoading(true);
    api.get(`/api/provas/${provaId}/questoes-detalhadas`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.questoes)) {
          setProva(data.prova);
          setQuestoes(data.questoes);
        } else {
          console.error("Resposta inesperada da API:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar questões:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarQuestoes();
  }, [provaId]);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleEditarNome = () => {
    if (prova) {
      setNovoNome(prova.nome);
      setEditandoNome(true);
    }
  };

  const handleSalvarNome = async () => {
    if (!novoNome.trim()) {
      alert("Por favor, digite um nome para a prova.");
      return;
    }

    try {
      const res = await api.put(`/api/provas/${provaId}`, { nome: novoNome.trim() });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro ao atualizar prova:", res.status, errorText);
        alert("Erro ao atualizar nome da prova.");
        return;
      }

      // Atualizar o estado local da prova
      setProva(prev => prev ? { ...prev, nome: novoNome.trim() } : null);
      setEditandoNome(false);
      
      // Notificar atualização para atualizar a lista de provas
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("Erro ao salvar nome da prova:", err);
      alert("Erro ao salvar nome da prova.");
    }
  };

  const handleCancelarEdicaoNome = () => {
    setEditandoNome(false);
    setNovoNome("");
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50"
        onClick={handleClickOutside}
      >
        <div
          ref={contentRef}
          className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-lg flex flex-col"
        >
          <div className="sticky top-0 z-10 bg-white px-6 py-4">
           <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 flex-1">
              {editandoNome ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl font-bold text-blue-700"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSalvarNome();
                      } else if (e.key === "Escape") {
                        handleCancelarEdicaoNome();
                      }
                    }}
                  />
                  <button
                    onClick={handleSalvarNome}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm cursor-pointer"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={handleCancelarEdicaoNome}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-blue-700">{prova?.nome}</h2>
                  {!modoVisualizacao && (
                    <button
                      onClick={handleEditarNome}
                      className="text-blue-700 font-medium hover:underline hover:bg-gray-200 flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition"
                    >
                      <SquarePen className="h-4" />
                      Editar nome
                    </button>
                  )}
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-2xl font-light cursor-pointer"
            >
              &times;
            </button>
          </div>

            {!modoVisualizacao && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="rounded-lg py-1.5 px-2.25 bg-blue-600 text-white text-sm mt-2 w-max flex justify-self-end cursor-pointer"              
              >
                + Adicionar nova questão
              </button>
            )}
          </div>

          <div className="overflow-y-auto p-6 space-y-6">
            {loading ? (
              <p className="text-gray-500">Carregando...</p>
            ) : questoes.length === 0 ? (
              <p className="text-gray-500">Nenhuma questão encontrada.</p>
            ) : (
              questoes.map((questao, index) => (
                <div
                  key={questao.id}
                  className="p-4 border border-gray-200 rounded-xl shadow-sm bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-800 whitespace-pre-line">
                      {index + 1}. {questao.enunciado}
                    </p>
                    {!modoVisualizacao && (
                      <button
                        onClick={() => setQuestaoIdEmEdicao(questao.id)
                        }
                        className="text-blue-600 hover:text-blue-800 transition text-sm"
                        title="Editar questão"
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  {questao.imagem_url && (
                    <img
                      src={`${
                        window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL
                      }/${questao.imagem_url}`}
                      alt="Imagem da questão"
                      className="mb-4 max-h-48 rounded-lg border"
                    />
                  )}

                  <ul className="space-y-1">
                    {questao.alternativas.map((alt, i) => (
                      <li
                        key={alt.id}
                        className={`p-2 rounded ${
                          alt.correta
                            ? "bg-green-50 border-l-4 border-green-400"
                            : ""
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {alt.texto}
                        {alt.correta && (
                          <span className="ml-2 text-green-600 font-semibold text-xs">
                            (correta)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs text-gray-400 mt-2">
                    Pontos: {questao.pontos}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {questaoIdEmEdicao !== null && (
        <EditarQuestaoModal
          questaoId={questaoIdEmEdicao}
          onClose={() => setQuestaoIdEmEdicao(null)}
          onSave={() => {
            setQuestaoIdEmEdicao(null);
            carregarQuestoes();
          }}
        />
      )}

      {showCreateModal && (
        <CreateQuestoesModal
          provaId={provaId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            carregarQuestoes();
          }}
        />
      )}
    </>
  );
};
