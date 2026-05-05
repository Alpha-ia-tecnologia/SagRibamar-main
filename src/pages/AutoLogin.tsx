import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loading } from "../components/Loading";
import { Button } from "../components/Button";
import { DynamicLogo } from "../components/DynamicLogo";

type Status = "validating" | "success" | "error";

export const AutoLoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { consumeMagicLink } = useAuth();

  const [status, setStatus] = useState<Status>("validating");
  const [message, setMessage] = useState<string>("Validando link de acesso...");
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token de acesso ausente na URL.");
      return;
    }

    (async () => {
      const ok = await consumeMagicLink(token);
      if (ok) {
        setStatus("success");
        setMessage("Acesso autorizado. Redirecionando...");
        navigate("/dashboard", { replace: true });
      } else {
        setStatus("error");
        setMessage("Link inválido ou expirado. Solicite um novo acesso.");
      }
    })();
  }, [searchParams, consumeMagicLink, navigate]);

  if (status === "validating") {
    return <Loading fullscreen />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm flex flex-col items-center">
        <DynamicLogo className="mb-4" alt="Logo" width={96} height={96} />
        <h1 className="text-xl font-bold text-center text-brand-700 mb-2">
          {status === "success" ? "Acesso autorizado" : "Falha no acesso"}
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6">{message}</p>
        {status === "error" && (
          <Button
            label="Ir para login"
            onClick={() => navigate("/", { replace: true })}
          />
        )}
      </div>
    </div>
  );
};
