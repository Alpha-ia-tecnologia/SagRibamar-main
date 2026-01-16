import { Badge } from "../components/Badge";
import { IconButton } from "../components/IconButton";
import { EnvelopeIcon, ClockIcon } from "@heroicons/react/24/outline";

type UserRowProps = {
  nome: string;
  email: string;
  tipo_usuario: string;
  ativo?: boolean;
  data_expiracao?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus?: () => void;
  index?: number;
};

export const UserRow = ({
  nome,
  email,
  tipo_usuario,
  ativo = true,
  data_expiracao,
  onEdit,
  onDelete,
  onToggleStatus,
  index = 0
}: UserRowProps) => {
  // Funcao para obter iniciais do nome
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Funcao para calcular tempo restante
  const getTempoRestante = (dataExp: string | undefined) => {
    if (!dataExp) return null;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const expiracao = new Date(dataExp);
    expiracao.setHours(0, 0, 0, 0);

    const diffTime = expiracao.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDias < 0) return { texto: "Expirado", cor: "text-red-600 bg-red-50" };
    if (diffDias === 0) return { texto: "Expira hoje", cor: "text-red-600 bg-red-50" };
    if (diffDias === 1) return { texto: "Expira amanhã", cor: "text-amber-600 bg-amber-50" };
    if (diffDias <= 7) return { texto: `${diffDias} dias restantes`, cor: "text-amber-600 bg-amber-50" };
    if (diffDias <= 30) return { texto: `${diffDias} dias restantes`, cor: "text-yellow-600 bg-yellow-50" };
    return { texto: `${diffDias} dias restantes`, cor: "text-green-600 bg-green-50" };
  };

  const tempoRestante = getTempoRestante(data_expiracao);

  return (
    <div className="group px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar do Usuario */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm text-white font-semibold ${
            index % 4 === 0 ? "bg-gradient-to-br from-blue-500 to-blue-600" :
            index % 4 === 1 ? "bg-gradient-to-br from-indigo-500 to-indigo-600" :
            index % 4 === 2 ? "bg-gradient-to-br from-violet-500 to-violet-600" :
            "bg-gradient-to-br from-purple-500 to-purple-600"
          }`}>
            {getInitials(nome)}
          </div>

          {/* Informacoes do Usuario */}
          <div>
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              {nome}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <EnvelopeIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Tempo Disponivel */}
          {tempoRestante && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tempoRestante.cor}`}>
              <ClockIcon className="w-3.5 h-3.5" />
              <span>{tempoRestante.texto}</span>
            </div>
          )}

          {/* Status Badge */}
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
            ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {ativo ? "Ativo" : "Inativo"}
          </span>

          <Badge text={tipo_usuario} />

          {/* Toggle Status */}
          {onToggleStatus && (
            <button
              onClick={onToggleStatus}
              title={ativo ? "Desativar usuário" : "Ativar usuário"}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                ativo ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                  ativo ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          )}

          <div className="flex items-center gap-2">
            <IconButton type="edit" onClick={onEdit} />
            <IconButton type="delete" onClick={onDelete} />
          </div>
        </div>
      </div>
    </div>
  );
};
