import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {

  const navigate = useNavigate();

  const goToPage = () => {
    navigate("/enter");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#020617] relative overflow-hidden">

      <div className="absolute w-[500px] h-[500px] bg-blue-700 opacity-20 blur-[150px] rounded-full"></div>

      <div className="circle-container mb-10">
        <img src={logo} alt="logo" className="logo-image" />
      </div>

      <button
        onClick={goToPage}
        className="px-8 py-3 bg-white text-black rounded-lg text-lg font-semibold 
        transition-all duration-300 hover:scale-110 hover:shadow-[0_0_25px_#3b82f6]"
      >
        Get Started
      </button>

    </div>
  );
}