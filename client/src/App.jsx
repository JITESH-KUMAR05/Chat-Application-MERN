import { Routes, Route } from "react-router-dom";
import ChatWorkspace from "./pages/ChatWorkspace"

import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatArea from "./components/ChatArea";

function App(){

return(

<Routes>

<Route path="/" element={<SplashScreen />} />

<Route path="/login" element={<Login />} />

<Route path="/signup" element={<Signup />} />

<Route path="/chat" element={<ChatWorkspace/>}>
    <Route index element={
      <div className="flex-1 bg-white flex items-center justify-center">
        <p className="text-gray-500 text-lg">Select a chat to start messaging</p>
      </div>
    } />
    <Route path=":userId" element={<ChatArea />} />

</Route>


</Routes>

)

}

export default App;