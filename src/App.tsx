import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/DashboardPage";
import EscolasPage from "./pages/EscolasPage";
import TurmasPage from "./pages/TurmasPage";
import AlunosPage from "./pages/AlunosPage";
import ProvasPage from "./pages/ProvasPage";
import { UsuariosPage } from "./pages/UsuariosPage";
import GabaritoPage from "./pages/GabaritoPage";
import { FiltroDashboardProvider } from "./hooks/useFiltroDashboard";
import { useAuthContext } from "./context/AuthContext";

function App() {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  const isAdmin = user.tipo_usuario === "ADMINISTRADOR";
  const isGestor = user.tipo_usuario === "GESTOR";

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <FiltroDashboardProvider>
            <DashboardPage />
          </FiltroDashboardProvider>
        }
      />

      {/* Apenas ADMINISTRADOR e outros tipos (exceto GESTOR) */}
      {(isAdmin || !isGestor) && (
        <>
          <Route path="/escolas" element={<EscolasPage />} />
          <Route path="/turmas" element={<TurmasPage />} />
          <Route path="/alunos" element={<AlunosPage />} />
          <Route path="/provas" element={<ProvasPage />} />
          <Route path="/gabaritos" element={<GabaritoPage />} />
        </>
      )}

      {/* Só ADMINISTRADOR tem acesso a usuários */}
      {isAdmin && <Route path="/usuarios" element={<UsuariosPage />} />}
    </Routes>
  );
}

export default App;
