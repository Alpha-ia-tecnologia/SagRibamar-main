import React, { Suspense } from "react";
import { Header } from "../components/Header";
import Footer from "../components/Footer";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useAuthContext } from "../context/AuthContext";

const RemoteCorretorApp = React.lazy(() => import("sagCorretor/CorretorApp"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center text-gray-400">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium">Carregando Corretor...</p>
      </div>
    </div>
  );
}

function ErrorFallback() {
  return (
    <div className="flex items-center justify-center h-96 bg-white rounded-2xl border border-red-200 shadow-sm">
      <div className="text-center text-red-400">
        <PencilSquareIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Erro ao carregar o Corretor</p>
        <p className="text-sm mt-1">Verifique se o servico esta disponivel.</p>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function CorretorPage() {
  const { user, token } = useAuthContext();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50">
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<LoadingFallback />}>
            <RemoteCorretorApp
              token={token || ""}
              user={user}
            />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}