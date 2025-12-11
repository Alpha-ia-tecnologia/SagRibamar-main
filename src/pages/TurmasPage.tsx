import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { TurmaList } from "../layout/TurmaList";
import { CreateTurmaModal } from "../components/modals/CreateTurmaModal";
import { useApi } from "../utils/api";
import Footer from "../components/Footer";

interface Escola {
  id: number;
  nome: string;
}

export default function TurmasPage() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [reload, setReload] = useState(false);

  const [searchNome, setSearchNome] = useState("");
  const [escolaId, setEscolaId] = useState<number | null>(null);
  const [serieId, setSerieId] = useState<string | null>(null);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const api = useApi();

  const serieNomes: Record<string, string> = {
    PRIMEIRO_ANO: "1° ano",
    SEGUNDO_ANO: "2° ano",
    TERCEIRO_ANO: "3° ano",
    QUARTO_ANO: "4° ano",
    QUINTO_ANO: "5° ano",
    SEXTO_ANO: "6° ano",
    SETIMO_ANO: "7° ano",
    OITAVO_ANO: "8° ano",
    NONO_ANO: "9° ano",
    PRIMEIRA_SERIE: "1ª série",
    SEGUNDA_SERIE: "2ª série",
    TERCEIRA_SERIE: "3ª série",
    EJA: "EJA",
    INFANTIL_I: "Infantil I",
    INFANTIL_II: "Infantil II",
    INFANTIL_III: "Infantil III",
    PRE_I: "Pré I",
    PRE_II: "Pré II",
    PRE_III: "Pré III",
    CRECHE: "Creche",
    TURMA_DE_HABILIDADES: "Turma Habilidades"
  };

  const todasSeries = Object.keys(serieNomes);

  useEffect(() => {
    const fetchEscolas = async () => {
      try {
        const res = await api.get(`/api/escolas?page=1&limit=200`);
        const data = await res.json();
        const lista = Array.isArray(data) ? data : data.data;
        setEscolas(Array.isArray(lista) ? lista : []);
      } catch (err) {
        console.error("Erro ao buscar escolas", err);
        setEscolas([]);
      }
    };

    fetchEscolas();
  }, []);

  const handleFilter = () => {
    setReload(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditId(null);
    setReload(true);
  };

  const handleEdit = (id: number) => {
    setEditId(id);
    setShowModal(true);
  };

  return (
    <>
      <Header />
      <div className="p-12 bg-gray-100 min-h-screen">
        <PageHeader
          title="Turmas"
          description="Gerenciamento de turmas"
          actionLabel="Nova Turma"
          onActionClick={() => {
            setEditId(null);
            setShowModal(true);
          }}
        />

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Buscar Turmas</h2>
          <div className="flex gap-4 items-end flex-nowrap overflow-x-auto">
            <input
              type="text"
              placeholder="Digite o nome da turma..."
              className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              value={searchNome}
              onChange={(e) => setSearchNome(e.target.value)}
            />

            <select
              className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 min-w-[180px] flex-shrink-0"
              value={escolaId ?? ""}
              onChange={(e) =>
                setEscolaId(e.target.value === "" ? null : parseInt(e.target.value))
              }
            >
              <option value="">Todas as escolas</option>
              {Array.isArray(escolas) &&
                escolas.map((escola) => (
                  <option key={escola.id} value={escola.id}>
                    {escola.nome}
                  </option>
                ))}
            </select>

            <select
              className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 min-w-[160px] flex-shrink-0"
              value={serieId ?? ""}
              onChange={(e) =>
                setSerieId(e.target.value === "" ? null : e.target.value)
              }
            >
              <option value="">Todas as séries</option>
              {todasSeries.map((serie) => (
                <option key={serie} value={serie}>
                  {serieNomes[serie]}
                </option>
              ))}
            </select>

            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200 flex-shrink-0 whitespace-nowrap"
            >
              Filtrar
            </button>
          </div>
        </div>

        <TurmaList
          reload={reload}
          onReloadDone={() => setReload(false)}
          onEdit={handleEdit}
          searchNome={searchNome}
          escolaId={escolaId}
          serieId={serieId}
        />
      </div>

      {showModal && (
        <CreateTurmaModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
          turmaId={editId}
        />
      )}
      <div>
        <Footer />
      </div>
    </>
  );
}
