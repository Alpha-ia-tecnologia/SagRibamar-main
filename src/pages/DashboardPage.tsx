import { Header } from "../components/Header";
import { FiltroAvaliacoes } from "../components/FiltroAvaliacoes";
import { DashboardResumo } from "../components/DashboardResumo";
import { TabelaDesempenhoEscolas } from "../components/TabelaDesempenhoEscolas";
import { GraficoDesempenhoAvaliacoes } from "../components/GraficoDesempenhoAvaliacoes";
import { GraficoComponentesCurriculares } from "../components/GraficoComponentesCurriculares";
import { GraficoRankingRegioes } from "../components/GraficoRankingRegioes";
import { TabelaHabilidadesBNCC } from "../components/TabelaHabilidadesBNCC";
import { RankingAlunos } from "../components/RankingAlunos";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";
import { useApi } from "../utils/api";
import Footer from "../components/Footer";
import GraficoArea from "../components/GraficoArea";
import { ArrowDownTrayIcon, ChartBarIcon, SparklesIcon, CalendarDaysIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export const DashboardPage = () => {
  const { filtros } = useFiltroDashboard();
  const api = useApi();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();

      if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
      if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
      if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
      if (filtros.serie) params.append("serie", filtros.serie);
      if (filtros.turmaId) params.append("turma_id", filtros.turmaId);
      if (filtros.filtro) params.append("tipo_filtro", filtros.filtro);
      if (filtros.provaId) params.append("prova_id", filtros.provaId);

      const response = await api.get(`/api/dashboard/export-xlsx?${params.toString()}`);

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
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Modal de Loading para Exportação */}
      {isExporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-5 max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
            {/* Ícone animado */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <DocumentArrowDownIcon className="w-10 h-10 text-white animate-bounce" />
              </div>
              {/* Spinner ao redor */}
              <div className="absolute inset-0 w-20 h-20">
                <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
                  <circle
                    className="stroke-blue-200"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="6"
                  />
                  <circle
                    className="stroke-blue-600"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="70 200"
                  />
                </svg>
              </div>
            </div>

            {/* Texto */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Exportando dados...
              </h3>
              <p className="text-gray-500 text-sm">
                Aguarde enquanto preparamos seu arquivo Excel
              </p>
            </div>

            {/* Barra de progresso animada */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      )}

      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
        {/* Header do Dashboard */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 sm:p-8 shadow-xl">
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-1/4 -mb-8 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-indigo-400/15 rounded-full blur-2xl"></div>

            {/* Padrão de pontos decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute top-8 left-16 w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="absolute top-12 left-4 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute bottom-8 right-20 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute bottom-4 right-32 w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Ícone principal com efeito glassmorphism */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
                  <div className="relative p-4 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                    <ChartBarIcon className="w-10 h-10 text-white" />
                  </div>
                  {/* Badge de destaque */}
                  <div className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full shadow-lg">
                    <SparklesIcon className="w-3 h-3 text-amber-900" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Dashboard
                    </h1>
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium rounded-full border border-white/20">
                      SAG
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm sm:text-base">
                    Sistema de Avaliação e Gerenciamento Educacional
                  </p>
                  {/* Data atual */}
                  <div className="flex items-center gap-1.5 mt-2 text-blue-200 text-sm">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Botão de exportar com design melhorado */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isExporting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Exportando...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-5 h-5 group-hover:animate-bounce" />
                    Exportar Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <section className="mb-8">
          <FiltroAvaliacoes />
        </section>

        {/* Cards de Resumo */}
        <section className="mb-8">
          <DashboardResumo />
        </section>

        {/* Tabela de Desempenho */}
        <section className="mb-8">
          <TabelaDesempenhoEscolas />
        </section>

        {/* Gráficos - Linha 1 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GraficoArea />
          <GraficoDesempenhoAvaliacoes />
        </section>

        {/* Gráficos - Linha 2 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GraficoComponentesCurriculares />
          <GraficoRankingRegioes />
        </section>

        {/* Tabela BNCC */}
        <section className="mb-8">
          <TabelaHabilidadesBNCC />
        </section>

        {/* Ranking de Alunos */}
        <section className="mb-8">
          <RankingAlunos />
        </section>
      </main>

      <Footer />
    </div>
  );
};
