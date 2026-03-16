import { BrowserRouter, Routes, Route } from "react-router-dom"
import SplashScreen from "./components/SplashScreen"
import AuthPage from "./pages/AuthPage"
import { useNavigate } from "react-router-dom"

function SplashWrapper() {
  const navigate = useNavigate()

  return <SplashScreen onStart={() => navigate("/auth")} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashWrapper />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App