import { InputField } from "../ui/InputField";
import { Button } from "../components/Button";
import { DynamicLogo } from "../components/DynamicLogo";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMunicipalityName } from "../utils/municipalityLogo"; 

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const { login, loading, error } = useAuth(); 

  const appName = window.__ENV__?.APP_NAME ?? import.meta.env.VITE_APP_NAME ?? "SAG";
  const municipalityName = getMunicipalityName();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, senha);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
    >
      <div className="flex flex-col items-center mb-6">
        <DynamicLogo 
          className="mb-4"
          alt={`Logo de ${municipalityName}`}
          width={120}
          height={120}
        />
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-1">{appName}</h1>
        <p className="text-center text-sm text-gray-600">
          Sistema de Avaliação e Gerenciamento
        </p>
        <p className="text-center text-xs text-gray-500 mt-2">
          {municipalityName}
        </p>
      </div>

      <InputField
        label="Email"
        type="text"
        placeholder="Digite seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <InputField
        label="Senha"
        type="password"
        placeholder="Digite sua senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      {error && <p className="text-red-600 text-center mb-4">{error}</p>} 

      <Button label={loading ? "Carregando..." : "Entrar"} disabled={loading} />
    </form>
  );
};
