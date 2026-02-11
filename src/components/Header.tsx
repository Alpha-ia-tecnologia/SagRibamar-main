import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, ChevronRight, User } from "lucide-react";
import { useState } from "react";
import { DynamicLogo } from "./DynamicLogo";
import { getMunicipalityName } from "../utils/municipalityLogo";
import {
  ChartBarIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

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
    { name: "Dashboard", path: "/dashboard", allowed: tipo !== "PROFESSOR", icon: ChartBarIcon },
    { name: "Dashboard", path: "/dashboardprofessor", allowed: tipo === "PROFESSOR", icon: ChartBarIcon },
    { name: "Escolas", path: "/escolas", allowed: tipo !== "GESTOR", icon: BuildingLibraryIcon },
    { name: "Turmas", path: "/turmas", allowed: tipo !== "GESTOR", icon: UserGroupIcon },
    { name: "Alunos", path: "/alunos", allowed: tipo !== "GESTOR", icon: AcademicCapIcon },
    { name: "Provas", path: "/provas", allowed: tipo !== "GESTOR", icon: DocumentTextIcon },
    { name: "Gabaritos", path: "/gabaritos", allowed: tipo !== "GESTOR", icon: ClipboardDocumentCheckIcon },
    { name: "Corretor", path: "/corretor", allowed: true, icon: PencilSquareIcon },
    { name: "Usuários", path: "/usuarios", allowed: tipo === "ADMINISTRADOR", icon: UsersIcon },
  ];

  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white sticky z-50 top-0 shadow-lg shadow-blue-900/20">
        {/* Linha decorativa superior */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"></div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-lg blur-sm"></div>
                <div className="relative bg-white/10 backdrop-blur-sm p-1.5 rounded-lg border border-white/20">
                  <DynamicLogo
                    alt={`Logo de ${municipalityName}`}
                    width={70}
                  />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-xl tracking-tight">SAG</span>
                <p className="text-blue-200 text-xs -mt-0.5">Sistema de Avaliação</p>
              </div>
            </div>

            {/* Menu Desktop */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1.5 border border-white/10">
              {navItems
                .filter((item) => item.allowed)
                .map(({ name, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white text-blue-700 shadow-md"
                          : "text-white/90 hover:bg-white/15 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {name}
                  </NavLink>
                ))}
            </nav>

            {/* Área do usuário */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
                  {user?.nome?.charAt(0)?.toUpperCase() || <User size={16} />}
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium block leading-tight">{user?.nome || "Usuário"}</span>
                  <span className="text-xs text-blue-200 leading-tight">{tipo || "Convidado"}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-red-500 backdrop-blur-sm rounded-lg border border-white/10 hover:border-red-400 transition-all duration-200 group"
              >
                <LogOut size={18} className="group-hover:animate-pulse" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>

            {/* Botão Mobile */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-all duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 text-white transform transition-transform duration-300 ease-out z-50 shadow-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden`}
      >
        {/* Header da Sidebar */}
        <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg border border-white/20">
              <DynamicLogo
                className="rounded-sm"
                alt={`Logo de ${municipalityName}`}
                width={32}
                height={32}
              />
            </div>
            <div>
              <span className="font-bold text-lg">SAG</span>
              <p className="text-blue-300 text-xs">Sistema de Avaliação</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Info do Usuario Mobile */}
        <div className="p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg font-bold text-white shadow-lg">
              {user?.nome?.charAt(0)?.toUpperCase() || <User size={20} />}
            </div>
            <div>
              <span className="font-medium block">{user?.nome || "Usuário"}</span>
              <span className="text-sm text-blue-300">{tipo || "Convidado"}</span>
            </div>
          </div>
        </div>

        {/* Navegação Mobile */}
        <nav className="flex flex-col p-4 gap-1.5">
          <span className="text-xs text-blue-300 uppercase tracking-wider font-medium px-3 mb-2">Menu</span>
          {navItems
            .filter((item) => item.allowed)
            .map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-white/15 text-white font-semibold shadow-lg border border-white/10"
                      : "hover:bg-white/10 text-blue-100"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{name}</span>
                </div>
                <ChevronRight size={16} className="opacity-50" />
              </NavLink>
            ))}
        </nav>

        {/* Botão Logout Mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-white/5">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500 text-white rounded-xl border border-red-400/30 hover:border-red-400 transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="font-medium">Sair do Sistema</span>
          </button>
        </div>
      </div>
    </>
  );
};
