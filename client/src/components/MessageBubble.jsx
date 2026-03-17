export default function MessageBubble({message}){

return(

<div className="bg-slate-800 p-2 rounded mb-2">

<p className="text-sm text-blue-400">{message.sender?.name}</p>

<p className="text-white">{message.content}</p>

</div>

)

}