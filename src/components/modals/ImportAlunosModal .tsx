import { useState } from "react";
import { useApi } from "../../utils/api";

interface ImportAlunosModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  escolasEncontradas: number;
  escolasNaoEncontradas: number;
  turmasCriadas: number;
  alunosCriados: number;
  alunosJaExistentes: number;
  erros: string[];
}

interface ErrorResponse {
  error: string;
  details: string;
}

export const ImportAlunosModal = ({ onClose, onSuccess }: ImportAlunosModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const api = useApi();

  // Lista de instruções - adicione ou remova instruções aqui
  const instrucoes = [
    "Certifique-se de que a ESCOLA esteja cadastrada antes de iniciar a importação dos alunos.",
    // Adicione mais instruções aqui conforme necessário:
    // "Segunda instrução exemplo...",
    // "Terceira instrução exemplo...",
  ];

  const handleReset = () => {
    setFile(null);
    setFileName("");
    setResult(null);
    setError(null);
  };

  const handleDownloadModelo = async () => {
  const response = await api.get(`/api/export/template-importacao`, {
    headers: {
      'accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  });

  if (response.ok) {
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template-importacao-alunos.xlsx';
    link.click();
  } else {
    console.error('Erro ao baixar o modelo:', response.statusText);
  }
};


  const handleSubmit = async () => {
    if (!file) {
      alert("Selecione um arquivo.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setFileName(file.name); // Salva o nome do arquivo

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(`/api/import-csv/import`, formData, {
        headers: {}, // Remove Content-Type para permitir que o browser defina o boundary
      });

      const data = await res.json();

      if (!res.ok) {
        // Caso de erro da API
        setError({
          error: data.error || "Erro ao processar arquivo",
          details: data.details || "Verifique o formato do arquivo e tente novamente."
        });
        return;
      }

      // Caso de sucesso
      setResult(data.results);
    } catch (err) {
      setError({
        error: "Falha ao importar arquivo",
        details: "Erro de conexão ou formato inválido. Verifique o arquivo e tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Importar Alunos via Planilha</h2>

        <div className="flex flex-col gap-4">
          {/* Mostrar seleção de arquivo apenas se não houver resultado ou erro */}
          {!result && !error && (
            <>
              <button
                onClick={handleDownloadModelo}
                className="px-4 py-2 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 transition w-fit"
              >
                Baixar Modelo Excel
              </button>

              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              />

              {/* Quadro de Instruções */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 w-full">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">Instruções Importantes</h3>
                    <ul className="space-y-1.5">
                      {instrucoes.map((instrucao, index) => (
                        <li key={index} className="text-xs text-blue-700 flex items-start">
                          <span className="mr-2 mt-0.5">•</span>
                          <span>{instrucao}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Exibir erro de importação */}
          {error && (
            <>
              {/* Título com nome do arquivo */}
              {fileName && (
                <div className="bg-gray-100 p-3 rounded-lg border border-gray-300">
                  <p className="text-xs text-gray-600 font-medium">Arquivo:</p>
                  <p className="text-sm text-gray-800 font-semibold truncate">{fileName}</p>
                </div>
              )}
              
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-red-800">{error.error}</h3>
                    <p className="text-sm text-red-700 mt-1">{error.details}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Exibir resultado de sucesso */}
          {result && (
            <div className="space-y-3">
              {/* Título com nome do arquivo */}
              {fileName && (
                <div className="bg-gray-100 p-3 rounded-lg border border-gray-300">
                  <p className="text-xs text-gray-600 font-medium">Arquivo:</p>
                  <p className="text-sm text-gray-800 font-semibold truncate">{fileName}</p>
                </div>
              )}
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="ml-2 text-sm font-semibold text-green-800">Importação concluída com sucesso!</h3>
                </div>
              </div>

              {/* Grid com estatísticas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium">Escolas Encontradas</p>
                  <p className="text-2xl font-bold text-blue-900">{result.escolasEncontradas}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <p className="text-xs text-orange-600 font-medium">Escolas Não Encontradas</p>
                  <p className="text-2xl font-bold text-orange-900">{result.escolasNaoEncontradas}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-600 font-medium">Turmas Criadas</p>
                  <p className="text-2xl font-bold text-purple-900">{result.turmasCriadas}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-xs text-green-600 font-medium">Alunos Criados</p>
                  <p className="text-2xl font-bold text-green-900">{result.alunosCriados}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 col-span-2">
                  <p className="text-xs text-yellow-700 font-medium">Alunos Já Existentes</p>
                  <p className="text-2xl font-bold text-yellow-900">{result.alunosJaExistentes}</p>
                </div>
              </div>

              {/* Caixinha de erros/avisos */}
              {result.erros && result.erros.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md max-h-40 overflow-y-auto">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 w-full">
                      <h3 className="text-sm font-semibold text-amber-800 mb-2">Avisos da Importação</h3>
                      <ul className="space-y-1">
                        {result.erros.map((erro, index) => (
                          <li key={index} className="text-xs text-amber-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{erro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          {/* Mostrar botões diferentes dependendo do estado */}
          {!result && !error ? (
            <>
              {/* Estado inicial: Cancelar + Importar */}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Importando..." : "Importar"}
              </button>
            </>
          ) : (
            <>
              {/* Após importação (sucesso ou erro): Importar Novamente + Fechar */}
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Importar Novamente
              </button>
              <button
                onClick={() => {
                  if (result) {
                    onSuccess(); // Atualiza a lista de alunos apenas se teve sucesso
                  }
                  onClose(); // Fecha o modal
                }}
                className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
              >
                Fechar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
