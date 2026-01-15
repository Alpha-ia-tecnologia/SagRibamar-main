import { Badge } from "../components/Badge";
import { IconButton } from "../components/IconButton";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

type UserRowProps = {
  nome: string;
  email: string;
  tipo_usuario: string;
  onEdit: () => void;
  onDelete: () => void;
  index?: number;
};

export const UserRow = ({ nome, email, tipo_usuario, onEdit, onDelete, index = 0 }: UserRowProps) => {
  // Funcao para obter iniciais do nome
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

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
          <Badge text={tipo_usuario} />
          <div className="flex items-center gap-2">
            <IconButton type="edit" onClick={onEdit} />
            <IconButton type="delete" onClick={onDelete} />
          </div>
        </div>
      </div>
    </div>
  );
};
