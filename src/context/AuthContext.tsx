import { createContext, useContext, useState, useEffect } from "react";

const API_URL = window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL;

interface User {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: string;
  municipio?: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Erro ao fazer parse do usuário armazenado:", error);
        // Limpa dados corrompidos
        sessionStorage.removeItem("currentUser");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!res.ok) {
        throw new Error("Email ou senha inválidos");
      }

      const data = await res.json();
      setUser(data.usuario);
      setToken(data.token);

      sessionStorage.setItem("currentUser", JSON.stringify(data.usuario));
      localStorage.setItem("token", data.token);

      return true;
    } catch (err: any) {
      setError(err.message || "Erro ao conectar");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
