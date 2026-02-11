import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu, X, ChevronRight, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { DynamicLogo } from "./DynamicLogo";
import { getMunicipalityName } from "../utils/municipalityLogo";
import {
  HomeIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  path: string;
  allowed: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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

  // Dashboard como link direto
  const dashboardItem: NavItem = tipo === "PROFESSOR"
    ? { name: "Dashboard", path: "/dashboardprofessor", allowed: true, icon: HomeIcon }
    : { name: "Dashboard", path: "/dashboard", allowed: true, icon: HomeIcon };

  // Seções colapsáveis
  const navSections: NavSection[] = [
    {
      label: "Cadastros",
      icon: Squares2X2Icon,
      items: [
        { name: "Escolas", path: "/escolas", allowed: tipo !== "GESTOR", icon: BuildingLibraryIcon },
        { name: "Turmas", path: "/turmas", allowed: tipo !== "GESTOR", icon: UserGroupIcon },
        { name: "Alunos", path: "/alunos", allowed: tipo !== "GESTOR", icon: AcademicCapIcon },
        { name: "Usuários", path: "/usuarios", allowed: tipo === "ADMINISTRADOR", icon: UsersIcon },
      ],
    },
    {
      label: "Avaliações",
      icon: ClipboardDocumentListIcon,
      items: [
        { name: "Provas", path: "/provas", allowed: tipo !== "GESTOR", icon: DocumentTextIcon },
        { name: "Gabaritos", path: "/gabaritos", allowed: tipo !== "GESTOR", icon: ClipboardDocumentCheckIcon },
        { name: "Corretor", path: "/corretor", allowed: true, icon: PencilSquareIcon },
      ],
    },
  ];

  const isSectionActive = (section: NavSection) =>
    section.items.some((item) => item.allowed && location.pathname === item.path);

  // Estilo compartilhado para item de menu principal (Dashboard e headers de seção)
  const menuItemBase = "flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200";
  const menuItemActive = `${menuItemBase} bg-white/15 text-white shadow-lg border border-white/10`;
  const menuItemInactive = `${menuItemBase} text-blue-100 hover:bg-white/10 hover:text-white`;

  // Renderiza navegação (compartilhado entre desktop e mobile)
  const renderNav = (onLinkClick?: () => void) => (
    <>
      {/* Dashboard - link direto */}
      <NavLink
        to={dashboardItem.path}
        onClick={onLinkClick}
        className={({ isActive }) => isActive ? menuItemActive : menuItemInactive}
      >
        <div className="flex items-center gap-3">
          <dashboardItem.icon className="w-5 h-5" />
          <span>{dashboardItem.name}</span>
        </div>
        <ChevronRight size={16} className="opacity-60" />
      </NavLink>

      {/* Seções colapsáveis */}
      {navSections.map((section) => {
        const visibleItems = section.items.filter((item) => item.allowed);
        if (visibleItems.length === 0) return null;
        const isExpanded = expandedSections[section.label] ?? false;
        const sectionActive = isSectionActive(section);
        const SectionIcon = section.icon;

        return (
          <div key={section.label}>
            {/* Header da seção - estilizado como item de menu */}
            <button
              type="button"
              onClick={() => toggleSection(section.label)}
              className={sectionActive && !isExpanded ? menuItemActive : menuItemInactive}
            >
              <div className="flex items-center gap-3">
                <SectionIcon className="w-5 h-5" />
                <span>{section.label}</span>
              </div>
              {isExpanded ? (
                <ChevronDown size={16} className="opacity-60" />
              ) : (
                <ChevronRight size={16} className="opacity-60" />
              )}
            </button>

            {/* Sub-itens com borda esquerda */}
            <div
              className={`overflow-hidden transition-all duration-200 ${
                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="ml-4 pl-3 border-l-2 border-white/10 mt-1 mb-1 flex flex-col gap-0.5">
                {visibleItems.map(({ name, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={onLinkClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-white/10 text-white font-medium"
                          : "text-blue-200 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 z-40 flex-col bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-900/30">
        {/* Linha decorativa lateral */}
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500"></div>

        {/* Logo */}
        <div className="flex items-center justify-center px-5 py-6 border-b border-white/10">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
            <div className="relative bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
              <DynamicLogo
                alt={`Logo de ${municipalityName}`}
                width={120}
              />
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="sidebar-scroll flex-1 flex flex-col px-3 py-4 gap-1 overflow-y-auto">
          {renderNav()}
        </nav>

        {/* Área do usuário */}
        <div className="border-t border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
              {user?.nome?.charAt(0)?.toUpperCase() || <User size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium block leading-tight truncate">{user?.nome || "Usuário"}</span>
              <span className="text-xs text-blue-200 leading-tight">{tipo || "Convidado"}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-400/20 hover:bg-red-500 text-white rounded-xl border border-blue-400/30 hover:border-red-400 transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Botão Mobile */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-900/30 border border-white/10 transition-all duration-200 hover:scale-105"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

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
        {/* Header da Sidebar Mobile */}
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
        <nav className="sidebar-scroll flex flex-col p-4 gap-1.5 overflow-y-auto">
          {renderNav(() => setIsOpen(false))}
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
