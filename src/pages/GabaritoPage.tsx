import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { SelecaoEscolaSerieProva } from "../components/SelecaoEscolaSerieProva";
import Footer from "../components/Footer";
export default function GabaritoPage() {
  return (
    <>
      <Header />
      <div className="p-12 bg-gray-100 min-h-screen">
        <PageHeader
          title="Geração de Gabaritos"
          description="Selecione a escola, série e prova para gerar os gabaritos em PDF"
        />
        <SelecaoEscolaSerieProva />
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
}
