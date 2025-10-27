// src/utils/municipalityLogo.ts
export interface MunicipalityConfig {
  name: string;
  logo: string;
  fallbackLogo: string;
}

const getAppName = (): string => {
  return window.__ENV__?.APP_NAME ?? import.meta.env.VITE_APP_NAME ?? "SAG";
};

export const getMunicipalityName = (): string => {
  const appName = getAppName();
  const match = appName.match(/\(([^)]+)\)/);
  return match ? match[1] : "Ribamar"; // Default to Ribamar if not found
};

export const getMunicipalityConfig = (): MunicipalityConfig => {
  const municipality = getMunicipalityName();

  const municipalityConfigs: Record<string, MunicipalityConfig> = {
    "Ribamar": {
      name: "Ribamar",
      logo: "/logos/ribamar-logo.png",
      fallbackLogo: "/sag.svg"
    },
    "São Bento": {
      name: "São Bento",
      logo: "/logos/sao-bento-logo.png",
      fallbackLogo: "/sag.svg"
    },
    "Santa Rita": {
      name: "Santa Rita",
      logo: "/logos/santa-rita-logo.png",
      fallbackLogo: "/sag.svg"
    },
    "Bacabeira": {
      name: "Bacabeira",
      logo: "/logos/bacabeira-logo.png",
      fallbackLogo: "/sag.svg"
    }
  };

  // Retorna a configuração do município ou a de Ribamar como fallback
  return municipalityConfigs[municipality] || municipalityConfigs["Ribamar"];
};

export const getMunicipalityLogo = (): string => {
  return getMunicipalityConfig().logo;
};

export const getFallbackLogo = (): string => {
  return getMunicipalityConfig().fallbackLogo;
};

