import { useState } from "react";
import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { AlunoList } from "../layout/AlunoList";
import { CreateAlunoModal } from "../components/modals/CreateAlunoModal";
import { AlunoFilter } from "../components/AlunoFilter";
import { ImportAlunosModal } from "../components/modals/ImportAlunosModal ";
import { Loading } from "../components/Loading";
import { useApi } from "../utils/api";

export default function AlunosPage() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [reload, setReload] = useState(false);

  const [searchNome, setSearchNome] = useState("");
  const [escolaId, setEscolaId] = useState<number | null>(null);
  const [turmaId, setTurmaId] = useState<number | null>(null);
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
    turmaId: number | null
  ) => {
    setSearchNome(nome);
    setEscolaId(escolaId);
    setTurmaId(turmaId);
  };

const handleDownloadStudent = async () => {
  setIsLoading(true);
  try {
    // Obter município baseado no nome da aplicação
    const appName = window.__ENV__?.APP_NAME ?? import.meta.env.VITE_APP_NAME;
    console.log("APP_NAME:", appName);
    
    // Extrair município do nome da aplicação (ex: "SAG (Ribamar)" -> "Ribamar")
    const municipio = appName && appName.includes("(") && appName.includes(")") 
      ? appName.match(/\(([^)]+)\)/)?.[1] || "Ribamar"
      : "Ribamar";
    
    console.log("Município detectado:", municipio);
    
    // Tentar primeiro com a API interna usando GET
    let response;
    try {
      response = await api.get(`/api/alunos-pdf?municipio=${encodeURIComponent(municipio)}`, {
        headers: {
          "accept": "application/pdf",
        }
      });
    } catch (apiError) {
      console.log("Erro na API interna, tentando URL externa:", apiError);
      // Se falhar, tentar com URL externa usando GET
      const apiUrl = (window.__ENV__ as any)?.URL_ALUNOS ?? import.meta.env.VITE_URL_ALUNOS ?? `${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/alunos-pdf`;
      
      response = await fetch(`${apiUrl}?municipio=${encodeURIComponent(municipio)}`, {
        method: "GET",
        headers: {
          "accept": "application/pdf",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
    }

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

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
  }
  finally {
    setIsLoading(false);
  }
};

  return (
    <>
      <Header />
        <div className="pt-20 p-12 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
       <PageHeader
          title="Alunos"
          description="Gerenciamento de alunos"
          actionLabel="Novo Aluno"
          onActionClick={() => {
            setEditId(null);
            setShowModal(true);
          }}
        actionsRight={(
          <>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 rounded-md text-sm transition"
          >
            Importar via CSV
          </button>
          <button
          onClick={handleDownloadStudent}
          className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-md text-sm transition"
          >
            Exportar Alunos
          </button>
          </>
        )}
      />

        </div>

        <AlunoFilter onFilter={handleFilter} />

        <AlunoList
          reload={reload}
          onReloadDone={() => setReload(false)}
          onEdit={handleEdit}
          searchNome={searchNome}
          escolaId={escolaId}
          turmaId={turmaId}
        />
      </div>

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
