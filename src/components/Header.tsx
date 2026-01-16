import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { DynamicLogo } from "./DynamicLogo";
import { getMunicipalityName } from "../utils/municipalityLogo";

export const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  // Função segura para obter usuário do sessionStorage
  const getUser = () => {
    try {
      const storedUser = sessionStorage.getItem("currentUser");
      return storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
      console.error("Erro ao fazer parse do usuário:", error);
      sessionStorage.removeItem("currentUser");
      return {};
    }
  };
  
  const user = getUser();
  const municipalityName = getMunicipalityName();

  const tipo = user?.tipo_usuario;

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("currentUser");
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", allowed: tipo !== "PROFESSOR"},
    { name: "Dashboard", path: "/dashboardprofessor", allowed: tipo === "PROFESSOR"},
    { name: "Escolas", path: "/escolas", allowed: tipo !== "GESTOR" },
    { name: "Turmas", path: "/turmas", allowed: tipo !== "GESTOR" },
    { name: "Alunos", path: "/alunos", allowed: tipo !== "GESTOR" },
    { name: "Provas", path: "/provas", allowed: tipo !== "GESTOR" },
    { name: "Gabaritos", path: "/gabaritos", allowed: tipo !== "GESTOR" },
    { name: "Usuários", path: "/usuarios", allowed: tipo === "ADMINISTRADOR" },
  ];

  return (
    <header className="bg-blue-600 text-white sticky z-50 top-0">
      <div className="py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <DynamicLogo
            alt={`Logo de ${municipalityName}`}
            width={90}
          />
          <span className="font-bold text-lg">SAG</span>
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems
            .filter((item) => item.allowed)
            .map(({ name, path }) => (
              <NavLink
                key={name}
                to={path}
                className={({ isActive }) =>
                  `px-3 py-1 rounded ${
                    isActive ? "bg-blue-700 font-semibold" : "hover:bg-blue-500"
                  } transition`
                }
              >
                {name}
              </NavLink>
            ))}
        </nav>

        {/* Área do usuário */}
        <div className="flex items-center gap-3">
          <span className="text-sm">{user?.nome || "Usuário"}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 hover:underline focus:outline-none"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>

        {/* Botão Mobile */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden ml-3"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Mobile */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-blue-700 text-white transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-blue-500">
          <div className="flex items-center gap-2">
            <DynamicLogo 
              className="rounded-sm"
              alt={`Logo de ${municipalityName}`}
              width={24}
              height={24}
            />
            <span className="font-bold text-lg">SAG</span>
          </div>
          <button onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col p-4 gap-2">
          {navItems
            .filter((item) => item.allowed)
            .map(({ name, path }) => (
              <NavLink
                key={name}
                to={path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded ${
                    isActive ? "bg-blue-900 font-semibold" : "hover:bg-blue-600"
                  } transition`
                }
              >
                {name}
              </NavLink>
            ))}
        </nav>
      </div>
    </header>
  );
};
