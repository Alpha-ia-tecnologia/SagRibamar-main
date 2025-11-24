interface LoadingProps {
  fullscreen?: boolean;
}

export function Loading({ fullscreen = false }: LoadingProps) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="flex flex-col items-center bg-white rounded-xl p-6 shadow">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-blue-600"></div>
          <p className="mt-5 text-md font-medium text-black">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-blue-600"></div>
        <p className="mt-5 text-md font-medium text-black">Carregando...</p>
      </div>
    </div>
  )
}