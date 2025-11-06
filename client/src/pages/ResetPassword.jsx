import React, { useState, useRef } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../context/AppContext";

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1=Email, 2=OTP, 3=New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const inputRefs = useRef([]); //React’s ref prop lets you directly access a DOM element.  const boxRef = useRef(); --> <input ref={boxRef} />; --> console.log(boxRef.current); -->// <input ... /> That’s for one element.
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  // =============== SEND OTP =================
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!email) return toast.error("Please enter your email");

    try {
      setLoading(true);
      const { data } = await api.post("/api/auth/send-reset-otp", { email });

      if (data.success) {
        toast.success(data.message);
        setStep(2);

        /**Start a cooldown timer of 30 seconds, during which the user can’t request a new OTP.
         * This prevents people from spamming the resend button. */
        setCooldown(30);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // =============== HANDLE OTP INPUT ===============
  const handleInput = (e, index) => {
    const Val = e.target.value;
    if (!/^\d*$/.test(Val)) {
      e.target.value = "";
      return;
    }
    if (Val && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (e.target.value === "" && index > 0) {
        inputRefs.current[index - 1].focus();
        inputRefs.current[index - 1].value = "";
      } else {
        e.target.value = "";
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    if (e.key === "ArrowRight" && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    const chars = paste.split(""); //Purpose: Split a string into an array of individual characters.

    chars.forEach((value, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = value;
      }
    });

    const filled = chars.length;
    if (filled < inputRefs.current.length && inputRefs.current[filled]) {
      inputRefs.current[filled].focus();
    }
  };

  // =============== OTP ===============
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    //Purpose: Collect the values from multiple input boxes (like OTP fields) and merge them into one string.
    /**inputRefs.current → an array of input elements (each OTP box).
       el?.value → safely get the value of each input (?. prevents errors if el is null).
       || "" → if any box is empty or undefined, replace it with an empty string.
       .map(...) → returns an array of all input values.
       .join("") → joins them into a single string (no spaces). */
    const otpValue = inputRefs.current.map((el) => el?.value || "").join("");

    if (otpValue.length !== 6) {
      return toast.error("Enter all 6 digits");
    }

    setOtp(otpValue);
    setStep(3);
  };

  // =============== RESET PASSWORD ===============
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      return toast.error("Please fill all fields");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      if (data.success) {
        toast.success("Password reset successful!");
        navigate("/login");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // =============== RESEND OTP ==================
  const resendOtp = async () => {
    if (cooldown > 0) {
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/auth/send-reset-otp", { email });
      if (data.success) {
        toast.success("OTP resent!");
        setCooldown(30);
        //Create an Interval (repeats every 1 second).This runs the function every 1000 milliseconds (1 second).
        const timer = setInterval(() => {
          //Update State Every Second
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  /**When it reaches 1, we stop the timer (clearInterval(timer)) and set it to 0.
     Why (prev) => prev - 1 instead of just cooldown - 1?
     Because setCooldown depends on the previous value of cooldown,
     and React batches state updates asynchronously. 
     
| Concept                   | Code                                        | Explanation                    |
| ------------------------- | ------------------------------------------- | ------------------------------ |
| **Start cooldown**        | `setCooldown(30)`                           | Sets initial timer value       |
| **Decrease timer**        | `setInterval(..., 1000)`                    | Runs every 1s                  |
| **Stop timer**            | `clearInterval(timer)`                      | Stops countdown when done      |
| **Keep accurate state**   | `setCooldown(prev => prev - 1)`             | Ensures proper countdown       |
| **Store multiple refs**   | `useRef([])`                                | Keeps refs for multiple inputs |
| **Assign refs**           | `ref={(el) => (inputRefs.current[i] = el)}` | Saves each input’s DOM node    |
| **Access specific input** | `inputRefs.current[i]`                      | Directly control input i       |

     
     */

  // =====================================================================
  return (
    <section className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-200 via-white to-indigo-200 relative overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-300/40 rounded-full blur-3xl -z-10 animate-pulse delay-300"></div>

      <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl w-full max-w-md p-8 sm:p-10 border border-gray-100 transition-all">
        <div className="flex justify-center mb-6">
          <img src={assets.logo} alt="App Logo" className="w-28 sm:w-32" />
        </div>

        {/* STEP 1 - EMAIL */}
        {step === 1 && (
          <>
            <h2 className="text-2xl sm:text-3xl font-semibold text-center text-indigo-700 mb-2">
              Reset Password
            </h2>
            <p className="text-gray-500 text-center mb-8">
              Enter your registered email to receive an OTP
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70"
                  />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your Email"
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {/* STEP 2 - OTP */}
        {step === 2 && (
          <>
            <h2 className="text-2xl sm:text-3xl font-semibold text-center text-indigo-700 mb-2">
              Verify OTP
            </h2>
            <p className="text-gray-500 text-center mb-8">
              Enter the 6-digit OTP sent to <b>{email}</b>.
            </p>

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div className="flex justify-between mb-6" onPaste={handlePaste}>
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-10 h-12 text-center border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      ref={(el) => (inputRefs.current[i] = el)}
                      onInput={(e) => handleInput(e, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                    />
                  ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Didn't get the code?{" "}
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={cooldown > 0}
                  className="text-indigo-600 font-medium hover:underline disabled:opacity-60"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                </button>
              </p>
            </form>
          </>
        )}

        {/* STEP 3 - NEW PASSWORD */}
        {step === 3 && (
          <>
            <h2 className="text-2xl sm:text-3xl font-semibold text-center text-indigo-700 mb-2">
              Set New Password
            </h2>
            <p className="text-gray-500 text-center mb-8">
              For <b>{email}</b>
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <p className="text-center text-sm text-gray-600 mt-6">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Back to Login
                </button>
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  );
};

export default ResetPassword;



