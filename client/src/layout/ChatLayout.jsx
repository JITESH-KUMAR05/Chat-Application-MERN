import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import ChatArea from "../components/ChatArea"

export default function ChatLayout(){

return(

<div className="h-screen flex flex-col">

{/* NAVBAR */}
<Navbar/>

{/* MAIN AREA */}
<div className="flex flex-1">

{/* SIDEBAR */}
<Sidebar/>

{/* CHAT CONTENT */}
<ChatArea/>

</div>

</div>

)

}