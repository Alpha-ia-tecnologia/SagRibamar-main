import { InputField } from "../ui/InputField";
import { Button } from "../components/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async () => {
    const success = await login(email, senha);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
      <h1 className="text-2xl font-bold text-center text-blue-600 mb-1">SAG</h1>
      <p className="text-center text-sm text-gray-600 mb-6">
        Sistema de Avaliação e Gerenciamento
      </p>

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
      <Button label="Entrar" onClick={handleSubmit} />
    </div>
  );
};
