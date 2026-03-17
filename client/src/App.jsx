import { Routes, Route } from "react-router-dom";
import ChatWorkspace from "./pages/ChatWorkspace"

import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App(){

return(

<Routes>

<Route path="/" element={<SplashScreen />} />

<Route path="/login" element={<Login />} />

<Route path="/signup" element={<Signup />} />

<Route path="/chat" element={<ChatWorkspace/>}/>

</Routes>

)

}

export default App;