import { useState } from "react";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";
import { SelectRegiao } from "./selects/SelectRegiao";
import { SelectGrupo } from "./selects/SelectGrupo";
import { SelectEscola } from "./selects/SelectEscola";
import { SelectSerie } from "./selects/SelectSerie";
import { SelectTurma } from "./selects/SelectTurma";
import { SelectResultado } from "./selects/SelectResultado";
import { SelectProvas } from "./selects/SelectProvas";

export const FiltroAvaliacoes = () => {
  const [regiaoIds, setRegiaoIds] = useState<string[]>([]);
  const [grupoIds, setGrupoIds] = useState<string[]>([]);
  const [escolaIds, setEscolaIds] = useState<string[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [turmaIds, setTurmaIds] = useState<string[]>([]);
  const [provaIds, setProvaIds] = useState<string[]>([]);
  const [filtro, setFiltro] = useState("acertos");

  const { setFiltros } = useFiltroDashboard();

  const handleAplicarFiltros = () => {
    setFiltros({
      regiaoId: regiaoIds.join(","),
      grupoId: grupoIds.join(","),
      escolaId: escolaIds.join(","),
      serie: series.join(","),
      turmaId: turmaIds.join(","),
      provaId: provaIds.join(","),
      filtro,
    });
  };

  const handleResetarFiltros = () => {
    setRegiaoIds([]);
    setGrupoIds([]);
    setEscolaIds([]);
    setSeries([]);
    setTurmaIds([]);
    setProvaIds([]);
    setFiltro("acertos");
    setFiltros({});
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <h3 className="text-lg font-semibold mb-2">Filtro de Avaliações</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SelectRegiao value={regiaoIds} onChange={setRegiaoIds} />
        <SelectGrupo regiaoId={regiaoIds.join(",")} value={grupoIds} onChange={setGrupoIds} />
        <SelectEscola regiaoId={regiaoIds.join(",")} grupoId={grupoIds.join(",")} value={escolaIds} onChange={setEscolaIds} />
        <SelectSerie escolaId={escolaIds.join(",")} value={series} onChange={setSeries} />
        <SelectTurma escolaId={escolaIds.join(",")} serie={series.join(",")} value={turmaIds} onChange={setTurmaIds} />
        <SelectProvas value={provaIds} onChange={setProvaIds} />
        <SelectResultado value={filtro} onChange={setFiltro} />
        <div className="flex items-end gap-2">
          <button
            onClick={handleAplicarFiltros}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={handleResetarFiltros}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Resetar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};
