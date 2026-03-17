import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";

export default function ChatWindow(){

const {messages} = useSelector(state=>state.messages);

return(

<div className="flex-1 bg-slate-900 p-4 overflow-y-scroll">

{messages.map(msg=>(
<MessageBubble key={msg._id} message={msg}/>
))}

</div>

)

}