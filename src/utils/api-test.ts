// Arquivo de teste para verificar o formato do header Authorization
import { useAuth } from "../hooks/useAuth";

export const testApiHeaders = () => {
  const { token } = useAuth();
  
  console.log('🔍 Teste de Headers:');
  console.log('Token:', token);
  console.log('Header Authorization:', `Bearer ${token}`);
  
  // Simular o que a API espera
  const expectedFormat = `Bearer ${token}`;
  console.log('Formato esperado:', expectedFormat);
  
  // Verificar se o token não está vazio
  if (!token) {
    console.error('❌ Token não encontrado!');
    return false;
  }
  
  // Verificar se o formato está correto
  const isValidFormat = expectedFormat.startsWith('Bearer ') && expectedFormat.length > 7;
  console.log('Formato válido:', isValidFormat);
  
  return isValidFormat;
};
