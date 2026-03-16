import SplashScreen from "./components/SplashScreen";
import AuthPage from "./pages/AuthPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/enter" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;