import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext.jsx";

const Header = () => {


  const { userData } = useAppContext();

 

  return (
    <header className="flex flex-col items-center justify-center text-center py-24 px-6 bg-linear-to-b from-blue-50 via-white to-indigo-50 relative overflow-hidden min-h-screen ">

      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200/40 rounded-full blur-3xl -z-10 animate-pulse delay-300"></div>


      <img
        src={assets.header_img}
        alt="Developer avatar"
        className="w-40 h-40 rounded-full border-4 border-indigo-500 shadow-lg mb-6 object-cover hover:scale-105 transition-transform"
      />

      <h1 className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
        Hey {userData ? userData.name : "Developer"}! 
        <img
          src={assets.hand_wave}
          className="w-8 h-8 animate-wiggle"
          alt="👋"
        />
      </h1>

 
      <h2 className="text-xl sm:text-2xl font-medium text-indigo-600 mb-4">
        Welcome to{" "}
        <span className="font-semibold text-indigo-700">MERN Auth App</span>
      </h2>

 
      <p className="text-gray-600 max-w-xl leading-relaxed mb-8">
        Build, authenticate, and explore secure web applications with modern
        MERN stack tools. This is your playground to create, test, and deploy
        with confidence 🚀.
      </p>


      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition">
          Get Started
        </button>
        <button className="border border-indigo-600 text-indigo-700 px-6 py-3 rounded-lg hover:bg-indigo-50 transition">
          Learn More
        </button>
      </div>
    </header>
  );
};

export default Header;
