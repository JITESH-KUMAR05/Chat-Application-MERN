import { useForm } from "react-hook-form";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

import bg from "../assets/bg1.png";
import logo from "../assets/logo.png";

import { Eye, EyeOff } from "lucide-react";

export default function Login(){

const {
  register,
  handleSubmit,
  formState:{errors}
} = useForm();

const dispatch = useDispatch();
const navigate = useNavigate();

const [showPassword,setShowPassword] = useState(false);

const onSubmit = async(data)=>{

try{

const res = await api.post("/user-api/login", data);

dispatch(setUser(res.data.payload));

navigate("/chat");

}catch(err){
console.log(err)
}

}

return(

<div
className="h-screen bg-cover bg-center flex flex-col"
style={{backgroundImage:`url(${bg})`}}
>

{/* NAVBAR */}

<div className="flex items-center p-5">

<img
src={logo}
className="w-12 h-12 rounded-full border border-white"
/>

</div>


{/* LOGIN SECTION */}

<div className="flex flex-1 justify-center items-center">

<form
onSubmit={handleSubmit(onSubmit)}
className="bg-white/20 backdrop-blur-lg p-10 rounded-2xl w-[420px] shadow-xl border border-white/30"
>

<h2 className="text-white text-2xl font-semibold mb-6 text-center">

Login

</h2>


{/* EMAIL */}

<div className="mb-4">

<input
placeholder="Email"
autoFocus
className="w-full p-3 rounded-lg bg-white/90 outline-none"
{...register("email",{
required:"Enter Email"
})}
/>

{errors.email && (
<p className="text-red-400 text-sm mt-1">
{errors.email.message}
</p>
)}

</div>



{/* PASSWORD */}

<div className="mb-4 relative">

<input
type={showPassword ? "text" : "password"}
placeholder="Password"
className="w-full p-3 rounded-lg bg-white/90 outline-none"
{...register("password",{
required:"Enter Password"
})}
/>

<div
className="absolute right-3 top-3 cursor-pointer"
onClick={()=>setShowPassword(!showPassword)}
>

{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}

</div>

{errors.password && (
<p className="text-red-400 text-sm mt-1">
{errors.password.message}
</p>
)}

</div>



{/* LOGIN BUTTON */}

<button
className="w-full bg-white text-black py-3 rounded-lg font-semibold 
transition-all duration-300 mb-4 cursor-pointer
hover:bg-[#020617] hover:text-white hover:border-2 hover:border-blue-500 hover:shadow-[0_0_15px_#3b82f6]"
>
Login
</button>

{/* OR DIVIDER */}

<div className="flex items-center gap-3 mb-4">

<hr className="flex-1 border-white/50"/>
<p className="text-white text-sm">OR</p>
<hr className="flex-1 border-white/50"/>

</div>


{/* GOOGLE LOGIN */}
<button
type="button"
className="w-full bg-white text-black py-2 rounded-lg hover:shadow-[0_0_10px_white] transition cursor-pointer"
>
Continue with Google
</button>



{/* SIGNUP LINK */}

<p className="text-center text-white mt-6 text-sm">

Create new account?{" "}

<Link
to="/signup"
className="text-blue-300 hover:underline"
>

SignUp

</Link>

</p>


</form>

</div>

</div>

)

}