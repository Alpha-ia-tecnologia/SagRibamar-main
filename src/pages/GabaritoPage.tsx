import { Header } from "../components/Header";
import { SelecaoEscolaSerieProva } from "../components/SelecaoEscolaSerieProva";
import Footer from "../components/Footer";
import {
  ClipboardDocumentCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function GabaritoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col">
      <Header />

      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto flex-1 w-full">
        {/* Header da Página */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 sm:p-8 shadow-xl">
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-1/4 -mb-8 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-indigo-400/15 rounded-full blur-2xl"></div>

            {/* Padrão de pontos decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute top-8 left-16 w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="absolute top-12 left-4 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute bottom-8 right-20 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute bottom-4 right-32 w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Ícone principal com efeito glassmorphism */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
                  <div className="relative p-4 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                    <ClipboardDocumentCheckIcon className="w-10 h-10 text-white" />
                  </div>
                  {/* Badge de destaque */}
                  <div className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full shadow-lg">
                    <SparklesIcon className="w-3 h-3 text-amber-900" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Geração de Gabaritos
                    </h1>
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 bg-white/15 backdrop-blur-sm text-white/90 text-xs font-medium rounded-full border border-white/20">
                      PDF
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm sm:text-base">
                    Selecione a escola, série e prova para gerar os gabaritos em PDF
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selecao de Gabaritos */}
        <section>
          <SelecaoEscolaSerieProva />
        </section>
      </main>

      <Footer />
    </div>
  );
}
