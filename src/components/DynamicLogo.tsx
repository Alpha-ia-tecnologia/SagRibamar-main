import { useState } from "react";
import { getMunicipalityLogo, getFallbackLogo } from "../utils/municipalityLogo";

interface DynamicLogoProps {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export const DynamicLogo = ({ 
  className = "", 
  alt = "Logo do Município",
  width = 100,
  height = 100
}: DynamicLogoProps) => {
  const [logoSrc, setLogoSrc] = useState(getMunicipalityLogo());
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    console.warn(`Erro ao carregar logo do município: ${logoSrc}`);
    if (!hasError) {
      setHasError(true);
      setLogoSrc(getFallbackLogo());
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded"
          style={{ width, height }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}
      <img
        src={logoSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

