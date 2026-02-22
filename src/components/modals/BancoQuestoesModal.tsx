import { ConfirmDialog } from "./ConfirmDialog";
import { useBancoQuestoes } from "./banco-questoes/useBancoQuestoes";
import { QuestaoCard } from "./banco-questoes/QuestaoCard";
import { FiltrosSidebar } from "./banco-questoes/FiltrosSidebar";

interface BancoQuestoesModalProps {
  provaId: number | null;
  tituloProva: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BancoQuestoesModal = ({
  provaId,
  tituloProva,
  onClose,
  onSuccess,
}: BancoQuestoesModalProps) => {
  const banco = useBancoQuestoes({ provaId, tituloProva, onClose, onSuccess });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            Banco de Questões
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Conteúdo principal com sidebar */}
        <div className="flex flex-1 overflow-hidden">
          <FiltrosSidebar
            provaId={provaId}
            questoesVinculadas={banco.questoesVinculadas}
            filtroVinculadas={banco.filtroVinculadas}
            componenteFiltro={banco.componenteFiltro}
            serieFiltro={banco.serieFiltro}
            nivelEnsinoFiltro={banco.nivelEnsinoFiltro}
            tipoHabilidadeFiltro={banco.tipoHabilidadeFiltro}
            habilidadeFiltro={banco.habilidadeFiltro}
            componentes={banco.componentes}
            series={banco.series}
            habilidades={banco.habilidades}
            temFiltrosAtivos={banco.temFiltrosAtivos}
            onComponenteChange={banco.setComponenteFiltro}
            onSerieChange={banco.setSerieFiltro}
            onNivelEnsinoChange={banco.setNivelEnsinoFiltro}
            onTipoHabilidadeChange={banco.setTipoHabilidadeFiltro}
            onHabilidadeChange={banco.setHabilidadeFiltro}
            onFiltroVinculadasChange={banco.setFiltroVinculadas}
            onLimparFiltros={banco.limparFiltros}
          />

          {/* Área principal com lista de questões */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Campo de pesquisa */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <input
                type="text"
                placeholder="Pesquisar questões por enunciado, código BNCC ou componente curricular..."
                value={banco.pesquisa}
                onChange={(e) => banco.setPesquisa(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Contador de selecionadas */}
            {banco.questoesSelecionadas.length > 0 && (
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <p className="text-sm font-medium text-blue-800">
                  {banco.questoesSelecionadas.length} questão(ões) selecionada(s)
                </p>
              </div>
            )}

            {/* Informações de resultados */}
            {banco.temFiltrosAtivos && banco.questoesFiltradas.length > 0 && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600">
                  Mostrando {banco.questoesFiltradas.length} de {banco.questoes.length} questão(ões)
                </p>
              </div>
            )}

            {/* Lista de questões */}
            <div className="flex-1 overflow-y-auto p-6">
              {banco.loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Carregando questões...</p>
                </div>
              ) : banco.questoesFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {banco.temFiltrosAtivos || banco.pesquisa.trim()
                      ? "Nenhuma questão encontrada com os filtros aplicados."
                      : "Nenhuma questão encontrada no banco."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {banco.questoesFiltradas.map((questao) => (
                    <QuestaoCard
                      key={questao.id}
                      questao={questao}
                      isSelecionada={banco.questoesSelecionadas.includes(questao.id)}
                      isVinculada={banco.questoesVinculadas.includes(questao.id)}
                      isExpandida={banco.questoesExpandidas.includes(questao.id)}
                      alternativas={banco.alternativasCache[questao.id]}
                      carregando={banco.carregandoAlternativas === questao.id}
                      salvando={banco.salvando}
                      onToggleSelecionar={banco.toggleSelecionarQuestao}
                      onDesvincular={banco.setQuestaoParaDesvincular}
                      onToggleExpandir={banco.toggleExpandirQuestao}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer com botões */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition"
              disabled={banco.salvando}
            >
              Cancelar
            </button>
            <button
              onClick={banco.handleAdicionarQuestoes}
              disabled={banco.questoesSelecionadas.length === 0 || banco.salvando}
              className={`px-5 py-2.5 rounded-xl text-sm transition ${
                banco.questoesSelecionadas.length === 0 || banco.salvando
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {banco.salvando
                ? "Adicionando..."
                : `Adicionar ${banco.questoesSelecionadas.length} Questão(ões)`}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={banco.questaoParaDesvincular !== null}
        title="Desvincular questão"
        description="Deseja desvincular esta questão da prova? A questão continuará disponível no banco de questões."
        confirmText="Desvincular"
        cancelText="Cancelar"
        danger
        onConfirm={banco.confirmarDesvinculacao}
        onCancel={() => banco.setQuestaoParaDesvincular(null)}
      />
    </div>
  );
};
