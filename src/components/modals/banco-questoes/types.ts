export interface Questao {
  id: number;
  enunciado: string;
  ordem?: number;
  serie?: string;
  nivel_ensino?: string;
  componente_curricular?: {
    id: number;
    nome: string;
  };
  codigos_bncc?: Array<{
    bncc_id?: number;
    bncc: {
      id?: number;
      codigo: string;
      descricao: string;
    };
  }>;
}

export interface Alternativa {
  id: number;
  texto: string;
  correta: boolean;
  imagem_url?: string;
}

export interface ComponenteCurricular {
  id: number;
  nome: string;
}

export interface Serie {
  value: string;
  label: string;
}

export interface HabilidadeBNCC {
  id: number;
  codigo: string;
  descricao: string;
}

export const NIVEIS_ENSINO = [
  { value: "ANOS_INICIAIS", label: "Anos Iniciais" },
  { value: "ANOS_FINAIS", label: "Anos Finais" },
  { value: "ENSINO_MEDIO", label: "Ensino Médio" },
];

export const formatarSerie = (serie: string): string => {
  const mapaSeries: Record<string, string> = {
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
    TURMA_DE_HABILIDADES: "Turma Habilidades",
  };

  return (
    mapaSeries[serie] ||
    serie.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  );
};
