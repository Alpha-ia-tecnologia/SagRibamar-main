import { PackageOpen } from "lucide-react";

export default function NoData() {
  return (
    <>
    <div className="flex flex-col justify-center items-center h-100 gap-4">
      <PackageOpen className="w-20 h-20 text-gray-400" />
      <p className="text-gray-500 text-lg">
        Nenhum dado encontrado para os filtros aplicados.
      </p>
    </div>
    </>
  )
}