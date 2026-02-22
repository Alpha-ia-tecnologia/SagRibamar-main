import { ChevronDown, ChevronUp } from "lucide-react";
import type { Questao, Alternativa } from "./types";
import { formatarSerie } from "./types";

interface QuestaoCardProps {
  questao: Questao;
  isSelecionada: boolean;
  isVinculada: boolean;
  isExpandida: boolean;
  alternativas?: Alternativa[];
  carregando: boolean;
  salvando: boolean;
  onToggleSelecionar: (id: number) => void;
  onDesvincular: (id: number) => void;
  onToggleExpandir: (id: number) => void;
}

export function QuestaoCard({
  questao,
  isSelecionada,
  isVinculada,
  isExpandida,
  alternativas,
  carregando,
  salvando,
  onToggleSelecionar,
  onDesvincular,
  onToggleExpandir,
}: QuestaoCardProps) {
  return (
    <div
      className={`p-4 border rounded-lg transition ${
        isVinculada
          ? "bg-green-50 border-green-400 border-2"
          : isSelecionada
            ? "bg-blue-50 border-blue-500 border-2 cursor-pointer hover:bg-gray-50"
            : "border-gray-200 cursor-pointer hover:bg-gray-50"
      }`}
      onClick={() => !isVinculada && onToggleSelecionar(questao.id)}
    >
      <div className="flex items-start gap-3">
        {isVinculada ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDesvincular(questao.id);
            }}
            disabled={salvando}
            className="mt-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition whitespace-nowrap disabled:opacity-50"
          >
            Desvincular
          </button>
        ) : (
          <input
            type="checkbox"
            checked={isSelecionada}
            onChange={() => onToggleSelecionar(questao.id)}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 accent-blue-600"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">
              Questão #{questao.id}
            </span>
            {isVinculada && (
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-medium">
                Vinculada à prova
              </span>
            )}
            {questao.componente_curricular && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                {questao.componente_curricular.nome}
              </span>
            )}
            {questao.serie && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                {formatarSerie(questao.serie)}
              </span>
            )}
          </div>
          <div
            className="text-sm text-gray-700 mb-2 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: questao.enunciado || "" }}
          />
          {questao.codigos_bncc && questao.codigos_bncc.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {questao.codigos_bncc.map((codigo, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                >
                  {codigo.bncc?.codigo}
                </span>
              ))}
            </div>
          )}

          {/* Botão Ver Alternativas */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpandir(questao.id);
            }}
            className="flex items-center gap-1 mt-3 text-xs text-blue-600 hover:text-blue-800 transition"
          >
            {carregando ? (
              "Carregando..."
            ) : isExpandida ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Ocultar alternativas
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Ver alternativas
              </>
            )}
          </button>

          {/* Alternativas expandidas */}
          {isExpandida && alternativas && (
            <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
              {alternativas.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhuma alternativa cadastrada.</p>
              ) : (
                alternativas.map((alt, idx) => (
                  <div
                    key={alt.id}
                    className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                      alt.correta ? "bg-green-50 border border-green-200" : "bg-gray-50"
                    }`}
                  >
                    <span className={`font-semibold text-xs mt-0.5 ${alt.correta ? "text-green-700" : "text-gray-500"}`}>
                      {String.fromCharCode(65 + idx)})
                    </span>
                    <div
                      className="flex-1 text-sm prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: alt.texto || "" }}
                    />
                    {alt.correta && (
                      <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                        Correta
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
