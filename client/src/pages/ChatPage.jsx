export default function ChatPage({logout}){

return(

<div className="flex h-screen">

<div className="w-64 bg-blue-900 text-white p-4">

<h2 className="text-xl font-bold mb-4">
Channels
</h2>

<p># general</p>
<p># team-chat</p>

<button
onClick={logout}
className="mt-10 bg-red-500 px-3 py-1 rounded"
>
Logout
</button>

</div>

<div className="flex-1 bg-slate-100 flex items-center justify-center">

<h1 className="text-3xl">
Chat Window
</h1>

</div>

</div>

)

}