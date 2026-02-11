import { useEffect, useState } from "react";
import { IconButton } from "../components/IconButton";
import { useApi } from "../utils/api";
import { ConfirmDialog } from "../components/modals/ConfirmDialog";
import { Loading } from "../components/Loading";
import {
  DocumentTextIcon,
  CalendarDaysIcon,
  QuestionMarkCircleIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { DocumentTextIcon as DocumentTextSolid } from "@heroicons/react/24/solid";


interface Prova {
  id: number;
  nome: string;
  createdAt: string;
  _count: {
    questoes: number;
  };
}

interface ProvaListProps {
  reload?: boolean;
  onReloadDone?: () => void;
  onEdit?: (id: number) => void;
  onVisualizar?: (id: number, modoVisualizacao?: boolean) => void; 
  searchTitulo?: string;
}

export const ProvaList = ({
  reload,
  onReloadDone,
  onVisualizar,
  searchTitulo = "",
}: ProvaListProps) => {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationDelete, setConfirmationDelete] = useState(false);
  const [provaIdSelecionada, setProvaIdSelecionada] = useState<number | null>(null);
  const api = useApi();

  const fetchProvas = async () => {
    try {
      const queryParams = new URLSearchParams();
      if ((searchTitulo ?? "").trim())
        queryParams.append("titulo", (searchTitulo ?? "").trim());

      const res = await api.get(`/api/provas?${queryParams.toString()}`);

      const data = await res.json();

      if (Array.isArray(data)) {
        setProvas(data);
      } else {
        setProvas([]);
      }
    } catch (err) {
      console.error("Erro ao buscar provas", err);
    }
  };

  useEffect(() => {
    fetchProvas();
  }, [searchTitulo]);

  useEffect(() => {
    if (reload) {
      fetchProvas().then(() => onReloadDone?.());
    }
  }, [reload]);

  const handleDelete = async (id: number) => {
    try {
      const res = await api.delete(`/api/provas/${id}`);

      if (!res.ok) {
        const erro = await res.text();
        console.error("Erro ao excluir:", erro);
        alert(
          "Erro ao excluir prova. Verifique se ela possui questões associadas."
        );
        return;
      }

      fetchProvas();
    } catch (err) {
      console.error("Erro inesperado ao excluir prova:", err);
      alert("Erro inesperado ao excluir prova.");
    }
  };

const handleDownloadTest = async (id: number) => {
  setIsLoading(true);
  try {
  const apiUrl = window.__ENV__?.URL_PROVAS ?? import.meta.env.VITE_URL_PROVAS;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "accept": "application/pdf",
      },
      body: JSON.stringify({ exam_id: id }),
    });

    if (!response.ok) {
      console.error("Erro ao baixar a prova:", response.status, await response.text());
      alert("Essa funcionalidade estará disponível em breve!");
      return;
    }

    const blob = await response.blob();
    const cd = response.headers.get("Content-Disposition") ?? "";
    const match = cd.match(/filename\*?=(?:UTF-8''|")?([^;"']+)/i);
    const serverFileName = match ? decodeURIComponent(match[1]) : null;

    const fileName = serverFileName ?? `prova-${id}.pdf`;

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
    alert("Erro inesperado ao baixar a prova.");
  }
  finally {
    setIsLoading(false);
  }
};

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      {isLoading && <Loading />}

      {/* Header da Lista */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <DocumentTextSolid className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Lista de Avaliações</h3>
              <p className="text-sm text-gray-500">
                Total: <span className="font-medium text-blue-600">{provas.length}</span> provas cadastradas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Provas */}
      <div className="divide-y divide-gray-100">
        {provas.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma prova encontrada</h3>
            <p className="text-gray-500">Crie uma nova prova para começar</p>
          </div>
        ) : (
          provas.map((prova, index) => (
            <div
              key={prova.id}
              className="group px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar da Prova */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    index % 3 === 0 ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                    index % 3 === 1 ? "bg-gradient-to-br from-indigo-500 to-indigo-600" :
                    "bg-gradient-to-br from-violet-500 to-violet-600"
                  }`}>
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Informacoes da Prova */}
                  <div>
                    <h4
                      onClick={() => onVisualizar?.(prova.id, true)}
                      className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors cursor-pointer hover:underline"
                    >
                      {prova.nome}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        ID: {prova.id}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                        {new Date(prova.createdAt).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400" />
                        {prova._count.questoes} questões
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadTest(prova.id)}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all duration-200"
                    title="Baixar Prova PDF"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onVisualizar?.(prova.id, false)}
                    className="p-2 rounded-lg text-orange-500 hover:bg-orange-50 transition-all duration-200"
                    title="Editar"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <IconButton
                    type="delete"
                    onClick={() => {
                      setProvaIdSelecionada(prova.id);
                      setConfirmationDelete(true);
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog de Confirmação */}
      {confirmationDelete && (
        <ConfirmDialog
          isOpen={confirmationDelete}
          title="Tem certeza que deseja excluir a prova?"
          description="Esta ação não poderá ser desfeita."
          warning="Todas as notas dos alunos associadas a esta prova também serão excluídas."
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={() => {
            if (provaIdSelecionada != null) handleDelete(provaIdSelecionada);
            setConfirmationDelete(false);
            setProvaIdSelecionada(null);
          }}
          onCancel={() => {
            setConfirmationDelete(false);
            setProvaIdSelecionada(null);
          }}
        />
      )}
    </div>
  );
};
