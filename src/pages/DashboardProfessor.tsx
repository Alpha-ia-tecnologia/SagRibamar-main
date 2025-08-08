import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
export default function DashboardProfessor() {
  return (
    <>
     <Header />
     <div className="pt-20 p-12 bg-gray-100 min-h-screen">
        <PageHeader
            title="Dashboard"
            description="Visão geral do Sistema de Avaliação e Gerenciamento"
        />
     </div>
    </>
  )
}
