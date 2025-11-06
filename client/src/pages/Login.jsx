import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { api } from "../context/AppContext";
import { toast } from "react-toastify";

const Login = () => {
    const [state, setState] = useState("Sign Up");
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password,setPassword] = useState('')

    const { setIsLoggedin, getUserData } = useAppContext();

    const navigate = useNavigate();

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();

            if (state === "Sign Up") {

               const {data} =  await api.post("/api/auth/register", { name, email, password });
                
                if (data.success) {
                  setIsLoggedin(true);
                  toast.success(data.message)
                  getUserData()
                  navigate("/");
                }
                else {
                  toast.error(data.message);
                }

            } else {
                const {data} =  await api.post("/api/auth/login", { email, password });
                
                if (data.success) {
                  toast.success(data.message);
                  setIsLoggedin(true);
                  getUserData();
                  navigate("/");
                }
                else {
                  toast.error(data.message);
                }
            }
        } catch (error) {
              toast.error(error.message);
        }
    }



  return (
    <section className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-200 via-white to-indigo-200 relative overflow-hidden px-4">
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-300/40 rounded-full blur-3xl -z-10 animate-pulse delay-300"></div>

      <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl w-full max-w-md p-8 sm:p-10 border border-gray-100">
        <div className="flex justify-center mb-6">
          <img
            onClick={() => navigate('/')}
            src={assets.logo}
            alt="App Logo"
            className="w-28 sm:w-32 object-contain"
          />
        </div>

        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-indigo-700 mb-2">
          {state === "Sign Up" ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-gray-500 text-center mb-8">
          {state === "Sign Up"
            ? "Join us and start building your secure MERN apps 🚀"
            : "Login to continue your journey 💻"}
        </p>

        <form onSubmit={onSubmitHandler} className="space-y-5">
          {state === "Sign Up" && (
            /*<-------------------Full name Only for SignUp--------------------> */
            <div className="relative">
                
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              
              <div className="relative">
                <img
                  src={assets.person_icon}
                  alt="name icon"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-70"
                />
                <input
                  type="text"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  id="name"
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              
            </div>
          )}

            {/*<----------------------Common Inputs for Login and SignUp---------------------------> */}   
          <div className="relative">
            
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            
            <div className="relative">
              <img
                src={assets.mail_icon}
                alt="email icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-70"
              />
              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                id="email"
                placeholder="Enter your email "
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            
          </div>

          <div className="relative">
            
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            
            <div className="relative">
              <img
                src={assets.lock_icon}
                alt="lock icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-70"
              />
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                id="password"
                placeholder="Enter your Password"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            
          </div>

          {state === "Login" && (
            <div className="flex justify-end">
              <button
              onClick={()=>navigate('/resetPassword')}
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Forgot password?
              </button>
            </div>
          )} 

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow  "
          >
            {state === "Sign Up" ? "Create Account" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {state === "Sign Up" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setState("Login")}
                className="text-indigo-600 font-medium hover:underline"
              >
                Login here
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setState("Sign Up")}
                className="text-indigo-600 font-medium hover:underline"
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </section>
  );
};

export default Login;
