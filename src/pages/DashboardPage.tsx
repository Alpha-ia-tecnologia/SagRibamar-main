import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { FiltroAvaliacoes } from "../components/FiltroAvaliacoes";
import { DashboardResumo } from "../components/DashboardResumo";
import { TabelaDesempenhoEscolas } from "../components/TabelaDesempenhoEscolas";
import { GraficoDesempenhoAvaliacoes } from "../components/GraficoDesempenhoAvaliacoes";
import { GraficoComponentesCurriculares } from "../components/GraficoComponentesCurriculares";
import { GraficoRankingRegioes } from "../components/GraficoRankingRegioes";
import { TabelaHabilidadesBNCC } from "../components/TabelaHabilidadesBNCC";
import { RankingAlunos } from "../components/RankingAlunos";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";

export const DashboardPage = () => {
  const { filtros } = useFiltroDashboard();

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();

      if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
      if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
      if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
      if (filtros.serie) params.append("serie", filtros.serie);
      if (filtros.turmaId) params.append("turma_id", filtros.turmaId);
      if (filtros.filtro) params.append("tipo_filtro", filtros.filtro); 
      if (filtros.provaId) params.append("prova_id", filtros.provaId);   

      const url = `${import.meta.env.VITE_API_URL}/api/dashboard/export-xlsx?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Erro ao exportar o arquivo");
      }

      const blob = await response.blob();
      const fileURL = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = fileURL;
      a.download = "dados-dashboard.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar o arquivo");
    }
  };

  return (
    <>
      <Header />
      <div className="pt-20 p-12 bg-gray-100 min-h-screen">
        <PageHeader
          title="Dashboard"
          description="Visão geral do Sistema de Avaliação e Gerenciamento"
        />

        <div className="mt-8">
          <FiltroAvaliacoes />
        </div>

        <div className="mt-8">
          <PageHeader
            title="Exportar Dados"
            description="Baixe todos os dados do dashboard em formato Excel"
            actionLabel="Exportar Excel"
            onActionClick={handleExport}
          />
        </div>

        <div className="mt-8">
          <DashboardResumo />
        </div>

        <TabelaDesempenhoEscolas />
        <GraficoDesempenhoAvaliacoes />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <GraficoComponentesCurriculares />
          <GraficoRankingRegioes />
        </div>

        <div className="mt-8">
          <TabelaHabilidadesBNCC />
        </div>

        <div className="mt-8">
          <RankingAlunos />
        </div>
      </div>
    </>
  );
};
