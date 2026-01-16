// Exemplo de como a API deve ser chamada com autenticação
import { useAuth } from "../hooks/useAuth";

export const exemploChamadaAPI = async () => {
  const { token } = useAuth();
  
  // Exemplo 1: Chamada GET com autenticação
  const exemploGet = async () => {
    const response = await fetch(
      `${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/usuarios`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    return response;
  };
  
  // Exemplo 2: Chamada POST com autenticação
  const exemploPost = async (data: any) => {
    const response = await fetch(
      `${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    return response;
  };
  
  // Exemplo 3: Chamada PUT com autenticação
  const exemploPut = async (userId: number, data: any) => {
    const response = await fetch(
      `${window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL}/api/usuarios/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    return response;
  };
  
  return { exemploGet, exemploPost, exemploPut };
};
