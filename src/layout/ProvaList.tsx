import { useEffect, useState } from "react";
import { IconButton } from "../components/IconButton";
import { FileDown, SquarePen } from "lucide-react";
import { useApi } from "../utils/api";
import { ConfirmDialog } from "../components/modals/ConfirmDialog";
import { Loading } from "../components/Loading";


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
    <div className="p-4 bg-white rounded-xl shadow-sm mb-6 relative">
      {isLoading && (
        <Loading />
        )}
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-5 py-3 bg-blue-50 border-b border-gray-200 font-semibold text-sm text-gray-800">
        Total: {provas.length} provas
      </div>

      {provas.map((prova) => (
        <div
          key={prova.id}
          className="flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition duration-150"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
              📝
            </div>
            <div>
              <p 
              onClick={() => onVisualizar?.(prova.id, true)}
              className="text-blue-700 font-semibold hover:underline cursor-pointer">
                {prova.nome}
              </p>
              <p className="text-sm text-gray-500">
                ID: {prova.id} | Criada em:{" "}
                {new Date(prova.createdAt).toLocaleDateString()} <br />
                Questões: {prova._count.questoes}
              </p>
            </div>
          </div>

          <div className="flex gap-5">
            <button
              onClick={() => handleDownloadTest(prova.id)}
              title = "Baixar Prova PDF">
              <FileDown className="w-5 h-5 text-blue-500 cursor-pointer" />
            </button>
            <button
            onClick={() => onVisualizar?.(prova.id, false)}
            className=" rounded-full hover:bg-blue-100 transition cursor-pointer"
            title="Editar"
            >
            <SquarePen className="w-5 h-4.5 text-orange-500"/>
            </button>
           <IconButton
              type="delete"
              onClick={() => {
                setProvaIdSelecionada(prova.id); // <- salva o id
                setConfirmationDelete(true);     // abre modal
              }}
            />
          </div>
        </div>
      ))}
        
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
      
      {provas.length === 0 && (
        <div className="px-5 py-4 text-sm text-gray-500 text-center">
          Nenhuma prova encontrada.
        </div>
      )}
    </div>
  </div>
  );
};
