import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { api, useAppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Emailverify = () => {
  const navigate = useNavigate();
  const inputRefs = React.useRef([]);
  const { isLoggedin, userData, getUserData } = useAppContext();


  // Move to next input automatically
  const handleInput = (e, index) => {
    const value = e.target.value;

    // allow only numbers
    if (!/^\d*$/.test(value)) {
      e.target.value = ""; // clear non-numeric input
      return;
    }

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  /*
  If the user types a letter like "A", symbol like "@", or space —
it clears the box immediately and stops further logic (return exits the function).
Prevents invalid OTP characters.
Keeps only numeric input cleanly.
  
  
  value && ...
ensures we only move if the user typed something (not empty).

index < inputRefs.current.length - 1
ensures we don’t try to move beyond the last input (avoid error).

inputRefs.current[index + 1]
gives the next input element in the array.

.focus()
moves the cursor to that next input box.

So:
When you type a digit in box 1 → focus moves to box 2
When you type in box 2 → focus moves to box 3
When you reach the last box (index 5) → no movement
This gives the smooth, one-by-one input experience. */

  // Move to previous input on backspace (and clear)
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (e.target.value === "" && index > 0) {
        inputRefs.current[index - 1].focus();
        inputRefs.current[index - 1].value = ""; // clear previous box too
      } else {
        e.target.value = ""; // clear current box
      }
    }

    // Move left on ArrowLeft
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    // Move right on ArrowRight
    if (e.key === "ArrowRight" && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  //Handle paste function
  const handlePaste = (e) => {
    e.preventDefault();

    // Get only numeric characters
    const paste = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    const pasteArray = paste.split("");

    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });

    //Auto-focus next empty input after paste
    const filled = pasteArray.length;
    if (filled < inputRefs.current.length && inputRefs.current[filled]) {
      inputRefs.current[filled].focus();
    }
  };

  /**First part → filled < inputRefs.current.length
 3 < 6
 true
This just checks that you’re not going out of range —
i.e., we’re not trying to access index 6 or higher (which doesn’t exist).

 Second part → inputRefs.current[filled]
That’s inputRefs.current[3] (the 4th input box).
Now, remember how we populated that array earlier:
ref={(el) => (inputRefs.current[index] = el)}


This means each entry in inputRefs.current is a DOM element reference (like <input>),
not the text value inside it.

So:
inputRefs.current[3] → <input type="text" ... /> (truthy value)
Even if the box is empty (no text), the element itself exists,
so the expression inputRefs.current[3] will still evaluate to true.

 Combined result
Let’s plug both in:
if (3 < 6 && inputRefs.current[3]) { ... }

 3 < 6 → true
inputRefs.current[3] → exists → true
 both true → condition passes.

 The code inside runs:
inputRefs.current[filled].focus(); // focuses the 4th box

 So to answer your question directly
“If filled = 3 and inputRefs.current.length = 6, and the input at index 3 is empty —
will this condition be true or false?”

It will be TRUE.

Because the condition checks for the existence of the element,
not whether it has a value.
Even if the box’s .value is "" (empty),
the element itself still exists in the DOM — so it’s truthy.
 
This line’s purpose is:
“If there’s still another input element left in sequence, move focus there.”
We don’t care if it’s empty or not yet — we just need to make sure it exists.

If the pasted OTP filled 3 boxes,
focus should move to the 4th input (index 3).
That’s why this logic works perfectly.
*/

  //Handle OTP form submit
  const handleSubmit = async(e) => {
    try {
      e.preventDefault();

      const otpArray = inputRefs.current.map(e => e.value);
      const otp = otpArray.join('');

      const {data} = await api.post("/api/auth/verify-account", {otp})
    
      if (data.success) {
        toast.success(data.message);
        getUserData()
        navigate('/')
      } else {
        toast.error(data.message);
      }
    
    } catch (error) {
      toast.error(error.message);
    } 
  };


  useEffect(() => {
    if (isLoggedin && userData && userData.isAccountVerified) {
      navigate("/");
    }
  },[isLoggedin, userData])



  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-200 via-white to-indigo-200 relative overflow-hidden px-4">
      {/*Background decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-300/40 rounded-full blur-3xl -z-10 animate-pulse delay-300"></div>

      {/* App Logo */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="App Logo"
        className="w-28 sm:w-32 object-contain mb-8 cursor-pointer hover:scale-105 transition-transform"
      />

      {/* OTP Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100 text-sm"
      >
        <h1 className="text-indigo-700 text-2xl font-semibold text-center mb-2">
          Email Verification
        </h1>
        <p className="text-center mb-6 text-gray-600">
          Enter the 6-digit OTP code sent to your registered email.
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-between mb-6" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="w-10 h-12 text-center border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                ref={(el) => (inputRefs.current[index] = el)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2.5 rounded-full font-medium hover:bg-indigo-700 transition-all shadow"
        >
          Verify Email
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Didn't get the code?{" "}
          <button
            type="button"
            className="text-indigo-600 font-medium hover:underline"
          >
            Resend
          </button>
        </p>
      </form>
    </section>
  );
};

export default Emailverify;

/*
| Concept                                         | Description                                                 |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `useRef([])`                                    | Creates a single ref object with a mutable `.current` array |
| `ref={(el) => (inputRefs.current[index] = el)}` | Stores each input DOM node at its index                     |
| Why needed                                      | To programmatically focus/clear/move between input boxes    |
| Without it                                      | You’d lose direct access to individual inputs               |

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
| Code                            | Meaning                                                         |
| ------------------------------- | --------------------------------------------------------------- |
| `useRef([])`                    | Create an empty array to store input elements                   |
| `ref={(el) => ...}`             | Tells React to call this when each input mounts                 |
| `inputRefs.current[index] = el` | Save that input DOM node at its position                        |
| Result                          | You can later control each input (focus, clear, value) directly |

*/

/**What normally happens with ref
 * In React, when you write:
  
   const myRef = useRef(null);

   <input ref={myRef} />

   So after rendering, you can access the element directly:
   myRef.current.focus();
   myRef.current.value = "7";

   That’s a single ref for one element.
/************************************************************************************* */
  /* But in OTP forms, you have multiple inputs
   You can’t just use one ref, because you have 6 inputs
   So you create an array of refs:
   const inputRefs = useRef([]); // start with empty array
This will hold something like:
inputRefs.current = [input1, input2, input3, input4, input5, input6]


How React assigns each input:
This is the main line
ref={(el) => (inputRefs.current[index] = el)}

ref={...}
In React, the ref prop tells React:
“When you render this element, call this function with the DOM node as its argument.”

So React executes that function like this:
(el) => (inputRefs.current[index] = el)

el argument
el is the actual DOM node for that input element.
For example:
el = <input type="text" ... />

What we do inside
We assign that DOM node to a specific index:
inputRefs.current[index] = el;

So if you’re rendering the inputs in a .map() loop:
{Array(6).fill(0).map((_, index) => (
  <input
    key={index}
    ref={(el) => (inputRefs.current[index] = el)}
  />
))}


This builds an array of references like this:
| Index | Value (what’s stored)   |
| ----- | ----------------------- |
| 0     | `<input />` for 1st box |
| 1     | `<input />` for 2nd box |
| 2     | `<input />` for 3rd box |
| 3     | `<input />` for 4th box |
| 4     | `<input />` for 5th box |
| 5     | `<input />` for 6th box |



So after the page renders:

inputRefs.current[0] === <input 1st box>
inputRefs.current[1] === <input 2nd box>

 Now you can programmatically access each one.
 */

/**
useRef([])      ─────────────▶  { current: [] }

React renders inputs in loop:
 ┌────────────────────────────────────────────┐
 │  index = 0 → ref callback → store input[0] │
 │  index = 1 → ref callback → store input[1] │
 │  index = 2 → ref callback → store input[2] │
 │        ...                                 │
 └────────────────────────────────────────────┘

Now:
inputRefs.current = [input0, input1, input2, input3, input4, input5]

You can manipulate them like an array of real DOM nodes.

 */

/**Why we do this
Because we want to manually control focus between inputs:
inputRefs.current[index + 1].focus();

So if you type something in box 1 →
your code says “focus the next box” by using the stored reference.
That’s only possible because each input’s DOM node was saved earlier using:
ref={(el) => (inputRefs.current[index] = el)}

Step-by-step mental model
React renders 6 inputs.

For each input:
React calls the function (el) => ... with its DOM node.
You store that DOM node inside inputRefs.current[index].
After rendering:
inputRefs.current is an array of all your input elements.

Later in your logic:
You can access them directly:

inputRefs.current[2].focus();
inputRefs.current[4].value = ""; */