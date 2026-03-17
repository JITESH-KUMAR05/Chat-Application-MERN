import logo from "../assets/logo.png"
import profile from "../assets/profile.png"
import { Search } from "lucide-react"

import { useState } from "react"
import api from "../services/api"

export default function Navbar(){

const [query,setQuery] = useState("")
const [users,setUsers] = useState([])

const handleSearch = async(e)=>{

const text = e.target.value
setQuery(text)

if(text.trim()===""){
setUsers([])
return
}

try{

const res = await api.get(`/user-api/search?username=${text}`)

setUsers(res.data.payload)

}catch(err){
console.log(err)
}

}

return(

<div className="flex items-center justify-between px-6 py-3 bg-[#020617] border-b border-blue-900 relative">

{/* LEFT SIDE */}
<div className="flex items-center gap-3">

<img
src={logo}
className="w-10 h-10 rounded-full"
/>

<span className="text-white font-semibold text-lg">
Spark
</span>

</div>


{/* SEARCH BAR */}

<div className="relative">

<input
type="text"
value={query}
onChange={handleSearch}
placeholder="Search users..."
className="w-[400px] px-4 py-2 pr-10 rounded-lg bg-slate-800 text-white outline-none"
/>

<Search
size={18}
className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
/>


{/* SEARCH RESULTS */}

{users.length>0 && (

<div className="absolute top-12 w-full bg-slate-900 rounded-lg shadow-lg border border-slate-700 max-h-60 overflow-y-auto">

{users.map(user=>(
<div
key={user._id}
className="px-4 py-2 cursor-pointer hover:bg-slate-800 hover:text-blue-400 text-white flex items-center gap-3"
>

<img
src={user.profilePic || profile}
className="w-8 h-8 rounded-full"
/>

<span>{user.name}</span>

</div>
))}

</div>

)}

</div>


{/* PROFILE */}

<img
src={profile}
className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-400"
/>

</div>

)

}