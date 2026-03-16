import logo from "../assets/logo.png"

export default function SplashScreen({ onStart }) {

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#020617] relative overflow-hidden">

      {/* glowing background */}
      <div className="absolute w-[500px] h-[500px] bg-blue-700 opacity-20 blur-[150px] rounded-full -z-10"></div>

      {/* rotating logo */}
      <img
        src={logo}
        alt="logo"
        className="w-40 h-40 rounded-full object-cover react-spin mb-10"
      />

      {/* button */}
      <button
        onClick={onStart}
        className="px-8 py-3 bg-white text-black rounded-lg text-lg font-semibold
        hover:scale-110 transition"
      >
        Get Started
      </button>

    </div>
  )
}