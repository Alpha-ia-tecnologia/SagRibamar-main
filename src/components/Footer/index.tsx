import { getMunicipalityName } from "../../utils/municipalityLogo";

export default function Footer() {
  const municipalityName = getMunicipalityName();
  
  return (
  <>
    <footer className="bg-blue-600 text-white py-2 flex justify-center">
      <div className="">
        <p className="">
          
          © {new Date().getFullYear()} SAG - {municipalityName}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  </>
  )
}