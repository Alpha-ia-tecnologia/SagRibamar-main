import { useEffect, useState } from "react";
import { IconButton } from "../components/IconButton";
import { FileDown, SquarePen } from "lucide-react";

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

  const fetchProvas = async () => {
    try {
      const queryParams = new URLSearchParams();
      if ((searchTitulo ?? "").trim())
        queryParams.append("titulo", (searchTitulo ?? "").trim());

      const res = await fetch(
        `${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/provas?${queryParams.toString()}`
      );

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
    if (!confirm("Deseja realmente excluir esta prova?")) return;

    try {
      const res = await fetch(
        `${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/provas/${id}`,
        {
          method: "DELETE",
        }
      );

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center bg-white rounded-xl p-6 shadow">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-blue-600"></div>
            <p className="mt-5 text-md font-medium text-black">Gerando prova...</p>
          </div>
        </div>
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
            <IconButton type="delete"  onClick={() => handleDelete(prova.id)} />
          </div>
        </div>
      ))}

      {provas.length === 0 && (
        <div className="px-5 py-4 text-sm text-gray-500 text-center">
          Nenhuma prova encontrada.
        </div>
      )}
    </div>
  </div>
  );
};
