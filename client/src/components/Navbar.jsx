import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { api } from "../context/AppContext";
import {toast} from "react-toastify"

const Navbar = () => {
const { toggleTheme, isDarkMode } = useAppContext();
    const navigate = useNavigate();
    
  const {  setIsLoggedin, userData, setUserData } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await api.post("/api/auth/logout")
      data.success && setIsLoggedin(false);
      data.success && setUserData(false);
    } catch (error) {
      toast.error(error.message);
    }
  }

  const sendVerificationOtp = async () => {
    try {
      const { data } = await api.post("/api/auth/send-verify-otp");
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message)
      }
    } catch (error) {
       toast.error(error.message);
    }
  }
  


  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center bg-white/80 backdrop-blur-md shadow-sm p-4 sm:px-16 md:px-24 z-50 transition-all">
      <div className="flex items-center gap-2">
        <img
          src={assets.logo}
          alt="App Logo"
          className="w-28 sm:w-32 object-contain"
        />
      </div>

      {/*<button
        onClick={toggleTheme}
        className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>*/}

      {userData ? (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
          {userData.name[0].toUpperCase()}
          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {/**Show verify email only when the user is authenticated */}
              {!userData.isAccountVerified && (
                <li
                  onClick={sendVerificationOtp}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                >
                  Verify email
                </li>
              )}

              <li
                onClick={logout}
                className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-indigo-500 rounded-full px-6 py-2 text-indigo-700 font-medium hover:bg-indigo-50 hover:shadow transition-all"
        >
          Login
          <img
            src={assets.arrow_icon}
            alt="arrow icon"
            className="w-5 h-5 transition-transform group-hover:translate-x-1"
          />
        </button>
      )}
    </nav>
  );
};

export default Navbar;


//list-none-->It removes the default bullets (•) or numbers from <ul> and <ol> lists.Commonly used for navigation menus, dropdowns, or custom-styled lists.

/**group-hover:block
This one is super useful for hover-based interactions (like dropdowns or tooltips).

🧠 What it means:
group-hover:block means:
👉 “Make this element display: block when the parent element (with class group) is hovered.”

📘 The logic:
Tailwind has a concept of group — you wrap multiple elements in a container that acts as a hover trigger for all its children. */