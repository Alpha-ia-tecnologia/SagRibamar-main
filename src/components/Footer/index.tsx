import { getMunicipalityName } from "../../utils/municipalityLogo";
import { DynamicLogo } from "../DynamicLogo";
import { HeartIcon } from "@heroicons/react/24/solid";
import { AcademicCapIcon, ChartBarIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  const municipalityName = getMunicipalityName();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>

      {/* Linha decorativa superior */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"></div>

      {/* Conteúdo principal */}
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo e nome */}
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20">
              <DynamicLogo
                alt={`Logo de ${municipalityName}`}
                width={50}
              />
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20">
              <img
                src="/logos/maximiza.png"
                alt="Logo Maximiza"
                width={50}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight">SAG</span>
              <p className="text-blue-200 text-xs">Sistema de Avaliação e Gerenciamento</p>
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="p-2 bg-white/10 rounded-lg">
                <AcademicCapIcon className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xs text-blue-200">Educação</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="p-2 bg-white/10 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs text-blue-200">Análise</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="p-2 bg-white/10 rounded-lg">
                <ShieldCheckIcon className="w-5 h-5 text-sky-400" />
              </div>
              <span className="text-xs text-blue-200">Segurança</span>
            </div>
          </div>

          {/* Info do município */}
          <div className="text-center md:text-right">
            <p className="text-sm font-medium text-white">{municipalityName}</p>
            <p className="text-xs text-blue-200">Gestão Educacional</p>
          </div>
        </div>

        {/* Divisor */}
        <div className="my-6 border-t border-white/10"></div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-blue-200 flex items-center gap-1.5">
            © {currentYear} SAG - {municipalityName}. Todos os direitos reservados.
          </p>
          <p className="text-blue-300 flex items-center gap-1.5 text-xs">
            Feito com <HeartIcon className="w-4 h-4 text-red-400 animate-pulse" /> para a educação
          </p>
        </div>
      </div>
    </footer>
  );
}