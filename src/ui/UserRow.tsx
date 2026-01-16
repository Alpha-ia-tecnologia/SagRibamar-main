import { Badge } from "../components/Badge";
import { IconButton } from "../components/IconButton";
import { EnvelopeIcon, ClockIcon } from "@heroicons/react/24/outline";

type StatusConta = {
  status: "ativo" | "expirado" | "expirando" | "desativado";
  mensagem: string;
  tipo: string;
};

type UserRowProps = {
  nome: string;
  email: string;
  tipo_usuario: string;
  ativo?: boolean;
  data_expiracao?: string;
  status_conta?: StatusConta;
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
  status_conta,
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

  // Funcao para obter estilo do status baseado na API
  const getStatusStyle = (status: StatusConta | undefined) => {
    if (!status) return null;

    const cores: Record<string, string> = {
      ativo: "text-green-600 bg-green-50",
      expirando: "text-amber-600 bg-amber-50",
      expirado: "text-red-600 bg-red-50",
      desativado: "text-gray-600 bg-gray-100",
    };

    return {
      texto: status.mensagem,
      cor: cores[status.status] || "text-gray-600 bg-gray-100",
      status: status.status,
    };
  };

  const statusInfo = getStatusStyle(status_conta);

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
          {/* Status da Conta (mensagem da API) */}
          {statusInfo && statusInfo.texto && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.cor}`}>
              <ClockIcon className="w-3.5 h-3.5" />
              <span>{statusInfo.texto}</span>
            </div>
          )}

          {/* Status Badge baseado no status_conta da API */}
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
            statusInfo?.status === "ativo" ? "bg-green-100 text-green-700" :
            statusInfo?.status === "expirando" ? "bg-amber-100 text-amber-700" :
            statusInfo?.status === "expirado" ? "bg-red-100 text-red-700" :
            statusInfo?.status === "desativado" ? "bg-gray-200 text-gray-700" :
            ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {statusInfo?.status === "ativo" ? "Ativo" :
             statusInfo?.status === "expirando" ? "Expirando" :
             statusInfo?.status === "expirado" ? "Expirado" :
             statusInfo?.status === "desativado" ? "Desativado" :
             ativo ? "Ativo" : "Inativo"}
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
