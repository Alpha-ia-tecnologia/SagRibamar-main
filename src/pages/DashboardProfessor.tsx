import { PageHeader } from "../ui/PageHeader";
import { FiltroAvaliacoes } from "../components/FiltroAvaliacoes";
import { DashboardResumo } from "../components/DashboardResumo";
import { GraficoDesempenhoAvaliacoes } from "../components/GraficoDesempenhoAvaliacoes";
import { TabelaHabilidadesBNCC } from "../components/TabelaHabilidadesBNCC";
import { RankingAlunos } from "../components/RankingAlunos";

const DashboardProfessor = () => {

  return (
    <div className="p-12">
      <PageHeader
        title="Dashboard"
        description="Visão geral do Sistema de Avaliação e Gerenciamento"
      />

      <div className="mt-8">
        <FiltroAvaliacoes />
      </div>

      <div className="mt-8">
        <DashboardResumo />
      </div>

      <GraficoDesempenhoAvaliacoes />

      <div className="mt-8">
        <TabelaHabilidadesBNCC />
      </div>

      <div className="mt-8">
        <RankingAlunos />
      </div>
    </div>
  );
};

export default DashboardProfessor;
