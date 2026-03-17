import logo from "../assets/logo.png";

export default function SplashScreen({ goAuth }) {

  return (

    <div className="relative flex flex-col items-center justify-center h-screen bg-gradient-to-b from-[#0f235e] to-[#020617] overflow-hidden">

      {/* sparkle particles */}
      <div className="sparkle sparkle1"></div>
      <div className="sparkle sparkle2"></div>
      <div className="sparkle sparkle3"></div>
      <div className="sparkle sparkle4"></div>

      {/* rotating logo */}
      <img
        src={logo}
        alt="logo"
        className="logo-spin mb-8"
      />

      <h1 className="text-white text-4xl font-bold mb-4">
        Spark Chat
      </h1>

      <button
        onClick={goAuth}
        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
      >
        Get Started
      </button>

    </div>

  );
}