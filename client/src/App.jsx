import { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";

function App() {

  const [page,setPage] = useState("splash");

  if(page === "splash"){
    return <SplashScreen goAuth={()=>setPage("auth")} />;
  }

  if(page === "auth"){
    return <AuthPage goChat={()=>setPage("chat")} goBack={()=>setPage("splash")} />;
  }

  if(page === "chat"){
    return <ChatPage logout={()=>setPage("auth")} />;
  }

}

export default App;