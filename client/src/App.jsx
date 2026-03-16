import SplashScreen from "./components/SplashScreen";
import AuthPage from "./pages/AuthPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom"

function App() {

function SplashWrapper() {
  const navigate = useNavigate()

  return <SplashScreen onStart={() => navigate("/auth")} />
}

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashWrapper />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;