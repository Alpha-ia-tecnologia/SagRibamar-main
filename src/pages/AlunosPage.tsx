import { useState } from "react";
import { AlunoList } from "../layout/AlunoList";
import { CreateAlunoModal } from "../components/modals/CreateAlunoModal";
import { AlunoFilter } from "../components/AlunoFilter";
import { ImportAlunosModal } from "../components/modals/ImportAlunosModal ";
import { Loading } from "../components/Loading";
import { useApi } from "../utils/api";
import {
  AcademicCapIcon,
  PlusIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function AlunosPage() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [reload, setReload] = useState(false);

  const [searchNome, setSearchNome] = useState("");
  const [escolaId, setEscolaId] = useState<number | null>(null);
  const [turmaId, setTurmaId] = useState<number | null>(null);
  const [serieId, setSerieId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);

  const api = useApi();

  const handleSuccess = () => {
    setShowModal(false);
    setEditId(null);
    setReload(true);
  };

  const handleEdit = (id: number) => {
    setEditId(id);
    setShowModal(true);
  };

  const handleFilter = (
    nome: string,
    escolaId: number | null,
    turmaId: number | null,
    serieId: string | null
  ) => {
    setSearchNome(nome);
    setEscolaId(escolaId);
    setTurmaId(turmaId);
    setSerieId(serieId);
  };

  const handleDownloadStudent = async () => {
    setIsLoading(true);
    try {
      const appName = window.__ENV__?.APP_NAME ?? import.meta.env.VITE_APP_NAME;
      const municipio =
        appName && appName.includes("(") && appName.includes(")")
          ? appName.match(/\(([^)]+)\)/)?.[1] || "Ribamar"
          : "Ribamar";

      let response;
      try {
        response = await api.get(
          `/api/alunos-pdf?municipio=${encodeURIComponent(municipio)}`,
          {
            headers: {
              accept: "application/pdf",
            },
          }
        );
      } catch (apiError) {
        const apiUrl =
          (window.__ENV__ as any)?.URL_ALUNOS ??
          import.meta.env.VITE_URL_ALUNOS ??
          `${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/alunos-pdf`;

        response = await fetch(
          `${apiUrl}?municipio=${encodeURIComponent(municipio)}`,
          {
            method: "GET",
            headers: {
              accept: "application/pdf",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao baixar alunos:", response.status, errorText);
        alert(`Erro ao baixar alunos! Status: ${response.status}`);
        return;
      }

      const blob = await response.blob();
      const cd = response.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename\*?=(?:UTF-8''|")?([^;"']+)/i);
      const serverFileName = match ? decodeURIComponent(match[1]) : null;
      const fileName = serverFileName ?? `alunos-${municipio}.pdf`;

      const urlObj = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlObj;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlObj);
    } catch (e) {
      console.error("Erro inesperado no download:", e);
      alert("Erro inesperado ao baixar alunos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
        {/* Header da Página */}
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
                    <AcademicCapIcon className="w-10 h-10 text-white" />
                  </div>
                  {/* Badge de destaque */}
                  <div className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full shadow-lg">
                    <SparklesIcon className="w-3 h-3 text-amber-900" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Alunos
                    </h1>
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium rounded-full border border-white/20">
                      Gerenciamento
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm sm:text-base">
                    Gerencie todos os alunos do sistema
                  </p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 hover:bg-white/25 transition-all duration-200"
                >
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  Importar CSV
                </button>
                <button
                  onClick={handleDownloadStudent}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 hover:shadow-lg transition-all duration-200"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Exportar
                </button>
                <button
                  onClick={() => {
                    setEditId(null);
                    setShowModal(true);
                  }}
                  className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md group"
                >
                  <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                  Novo Aluno
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <section className="mb-8">
          <AlunoFilter onFilter={handleFilter} />
        </section>

        {/* Lista de Alunos */}
        <section>
          <AlunoList
            reload={reload}
            onReloadDone={() => setReload(false)}
            onEdit={handleEdit}
            searchNome={searchNome}
            escolaId={escolaId}
            turmaId={turmaId}
            serieId={serieId}
          />
        </section>
      </main>

      {showModal && (
        <CreateAlunoModal
          alunoId={editId}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showImportModal && (
        <ImportAlunosModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            setReload(true);
          }}
        />
      )}

      {isLoading && <Loading />}

    </>
  );
}
