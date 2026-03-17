export default function Sidebar(){

const chats = [
"General",
"Development",
"Design",
"Alice",
"Bob",
"Charlie"
]

return(

<div className="w-[260px] bg-[#020617] text-white flex flex-col">

{/* TITLE */}

<div className="px-5 py-4 font-semibold text-lg border-b border-blue-900">
Chats
</div>


{/* CHAT LIST */}

<div className="flex-1 overflow-y-auto">

{chats.map((chat,index)=>(
<div
key={index}
className="px-5 py-3 cursor-pointer hover:text-blue-400 hover:bg-slate-800 transition"
>
# {chat}
</div>
))}

</div>

</div>

)

}