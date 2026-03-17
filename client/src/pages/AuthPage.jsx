import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

export default function AuthPage({ goChat, goBack }) {

  const [isSignup, setIsSignup] = useState(true);

  const { register, handleSubmit, reset } = useForm();

  const signup = async (data) => {
    try {

      await axios.post(
        "http://localhost:4000/user-api/register",
        data
      );

      alert("User Registered Successfully");

      reset();

      setIsSignup(false);

    } catch (error) {
      console.log(error.response?.data || error);
      alert("Registration Failed");
    }
  };

  const login = async (data) => {
    try {

      await axios.post(
        "http://localhost:4000/user-api/login",
        data,
        { withCredentials: true }
      );

      alert("Login Successful");

      reset();

      goChat();

    } catch (error) {
      console.log(error.response?.data || error);
      alert("Login Failed");
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-[#0f235e]">

      <div className="bg-slate-100 shadow-2xl rounded-xl p-10 w-96">

        <button
          onClick={goBack}
          className="text-blue-600 text-sm mb-4"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>

        <form onSubmit={handleSubmit(isSignup ? signup : login)}>

          {isSignup && (
            <input
              {...register("name")}
              placeholder="Full Name"
              className="w-full border p-3 mb-3 rounded-lg"
            />
          )}

          <input
            {...register("email")}
            placeholder="Email Address"
            className="w-full border p-3 mb-3 rounded-lg"
          />

          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full border p-3 mb-4 rounded-lg"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>

        </form>

        <p className="text-center mt-5 text-sm text-gray-600">

          {isSignup
            ? "Already have an account?"
            : "New here?"
          }

          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-600 ml-1 font-semibold"
          >
            {isSignup ? "Login" : "Signup"}
          </button>

        </p>

      </div>

    </div>

  );
}