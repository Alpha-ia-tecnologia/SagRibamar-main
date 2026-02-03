import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useApi } from "../../utils/api";

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  userId?: number | null;
}

const userTypes = [
  "ADMINISTRADOR",
  "COORDENADOR",
  "PROFESSOR",
  "GESTOR",
  "SECRETARIA",
];

export const CreateUserModal = ({ onClose, onSuccess, userId }: CreateUserModalProps) => {
  const { token } = useAuthContext();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [ativoOriginal, setAtivoOriginal] = useState(true);
  const [dataExpiracao, setDataExpiracao] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const api = useApi();

  // Buscar dados do usuário se for edição
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await api.get(`/api/usuarios/${userId}`);
        if (!res.ok) throw new Error("Erro ao buscar usuário");
        const data = await res.json();
        setNome(data.nome || "");
        setEmail(data.email || "");
        setTipoUsuario(data.tipo_usuario || "");
        const statusAtivo = data.ativo !== undefined ? data.ativo : true;
        setAtivo(statusAtivo);
        setAtivoOriginal(statusAtivo);
        // Formata a data ISO para YYYY-MM-DD (formato do input date)
        if (data.data_expiracao) {
          const date = new Date(data.data_expiracao);
          const formatted = date.toISOString().split('T')[0];
          setDataExpiracao(formatted);
        } else {
          setDataExpiracao("");
        }
      } catch (err: unknown) {
        setError((err as Error).message || "Erro ao carregar usuário");
      }
    };

    fetchUser();
  }, [userId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Converte a data para formato ISO se houver valor
    const dataExpiracaoISO = dataExpiracao
      ? new Date(dataExpiracao + "T00:00:00").toISOString()
      : null;

    const payload = {
      nome,
      email,
      senha,
      tipo_usuario: tipoUsuario,
      ativo,
      data_expiracao: dataExpiracaoISO,
    };

    try {
      const res = userId 
        ? await api.put(`/api/usuarios/${userId}`, payload)
        : await api.post(`/api/register`, payload);

      if (!res.ok) {
        let errorMessage = "Erro ao salvar usuário";
        
        try {
          // Tenta ler o texto da resposta primeiro
          const errorText = await res.text();
          console.error("Erro da API:", errorText);
          
          if (errorText && errorText.trim()) {
            // Tenta parsear como JSON
            try {
              const errorData = JSON.parse(errorText);
              
              // Verifica diferentes campos possíveis na resposta de erro
              errorMessage = errorData.error || errorData.message || errorData.detail || errorData.msg || errorText.trim();
              
              // Tratamento específico para email duplicado
              const errorLower = errorMessage.toLowerCase();
              if (errorLower.includes("email") && (errorLower.includes("já existe") || errorLower.includes("ja existe") || 
                  errorLower.includes("duplicado") || errorLower.includes("unique") || errorLower.includes("already exists") ||
                  errorLower.includes("constraint") || errorLower.includes("violation"))) {
                errorMessage = "Este email já está cadastrado. Por favor, use outro email.";
              }
              // Tratamento para senha muito curta
              else if (errorLower.includes("senha") && (errorLower.includes("curta") || errorLower.includes("mínimo") || 
                  errorLower.includes("minimum") || errorLower.includes("length"))) {
                errorMessage = "A senha deve ter pelo menos 6 caracteres.";
              }
              // Tratamento para campos obrigatórios
              else if (errorLower.includes("obrigatório") || errorLower.includes("required") || 
                      errorLower.includes("campo")) {
                errorMessage = "Por favor, preencha todos os campos obrigatórios.";
              }
              // Tratamento para tipo de usuário inválido
              else if (errorLower.includes("tipo") && (errorLower.includes("inválido") || errorLower.includes("invalid"))) {
                errorMessage = "Tipo de usuário inválido. Selecione um tipo válido.";
              }
            } catch {
              // Se não for JSON, verifica se o texto contém informações sobre email duplicado
              const errorLower = errorText.toLowerCase();
              if (errorLower.includes("email") && (errorLower.includes("já existe") || errorLower.includes("ja existe") || 
                  errorLower.includes("duplicado") || errorLower.includes("unique") || errorLower.includes("already exists"))) {
                errorMessage = "Este email já está cadastrado. Por favor, use outro email.";
              } else {
                errorMessage = errorText.trim();
              }
            }
          }
        } catch (parseError) {
          console.error("Erro ao ler resposta de erro:", parseError);
          // Mantém a mensagem padrão se não conseguir ler a resposta
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Se for edição e o status ativo mudou, chama o endpoint específico
      if (userId && ativo !== ativoOriginal) {
        const rota = ativo ? "ativar" : "desativar";
        try {
          const statusRes = await api.patch(`/api/usuarios/${rota}/${userId}`, {});
          if (!statusRes.ok) {
            const text = await statusRes.text();
            console.error(`Erro ao ${rota} usuário:`, text);
          }
        } catch (statusErr) {
          console.error(`Erro ao ${rota} usuário:`, statusErr);
        }
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      let errorMessage = "Erro ao salvar usuário";
      
      // Tratamento para erros de rede
      if (err instanceof Error && err.message.includes("fetch")) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      }
      // Tratamento para outros erros
      else if (err instanceof Error && err.message && err.message !== "Erro ao salvar usuário") {
        errorMessage = err.message;
        
        // Verifica se é erro de email duplicado na mensagem
        const errorLower = errorMessage.toLowerCase();
        if (errorLower.includes("email") && (errorLower.includes("já existe") || errorLower.includes("ja existe") || 
            errorLower.includes("duplicado") || errorLower.includes("unique") || errorLower.includes("already exists"))) {
          errorMessage = "Este email já está cadastrado. Por favor, use outro email.";
        }
      }
      
      setError(errorMessage);
      console.error("Erro ao salvar usuário:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
     <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {userId ? "Editar Usuário" : "Adicionar Novo Usuário"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nome
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Senha
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required={!userId} // Só obriga senha no cadastro
              placeholder={userId ? "Deixe em branco para manter" : ""}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Tipo de Usuário
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)}
              required
            >
              <option value="">Selecione o tipo</option>
              {userTypes.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Válido até
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={dataExpiracao}
              onChange={(e) => setDataExpiracao(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Deixe em branco para acesso sem prazo de expiração
            </p>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Status do Usuário
            </label>
            <button
              type="button"
              onClick={() => setAtivo(!ativo)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                ativo ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  ativo ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${ativo ? "text-green-600" : "text-gray-500"}`}>
              {ativo ? "Ativo" : "Inativo"}
            </span>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading
                ? userId
                  ? "Salvando..."
                  : "Cadastrando..."
                : userId
                ? "Salvar"
                : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
