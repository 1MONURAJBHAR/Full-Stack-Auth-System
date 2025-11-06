import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export const register = async (req,res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing details' });
    }
 
    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.json({
          success: false,
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      /**Explanation:
         User is a Mongoose model (a class).
         new User({...}) creates a new document instance of that model.
         Then, user.save() actually writes it to the database.
         This gives you full control — you can modify fields before saving.

         ✅ Recommended when:
         You want to validate, modify, or log the data before saving.
         You want to handle .save() errors manually. */

      const user = new User({
        name,
        email,
        password: hashedPassword,
      });

      await user.save();

      //Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "2d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 2 * 24 * 60 * 60 * 1000,
      });

      // ✅ Send Beautiful Welcome Email
      const mailOptions = {
        from: `"MERN Auth Website" <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: "🎉 Welcome to MERN Auth Website — Your Account is Ready!",
        text: `Welcome to MERN Auth Website! Your account has been created successfully with email: ${email}`,
        html: `
  <div style="background-color:#f3f4f6; padding:40px 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden;">
      
      <!-- Header -->
      <div style="background:linear-gradient(90deg, #2563eb, #1e40af); color:white; text-align:center; padding:25px 10px;">
        <h1 style="margin:0; font-size:26px; letter-spacing:0.5px;">MERN Auth Website</h1>
        <p style="margin:5px 0 0; font-size:14px; opacity:0.9;">Empowering secure authentication with style</p>
      </div>
      
      <!-- Body -->
      <div style="padding:30px 25px; color:#111827;">
        <h2 style="font-size:22px; margin-bottom:15px;">Welcome aboard, 👋</h2>
        <p style="font-size:16px; line-height:1.6; margin-bottom:15px;">
          We're thrilled to have you join our platform. Your account has been created successfully using:
        </p>
        <div style="background:#f9fafb; border-left:4px solid #2563eb; padding:10px 15px; border-radius:6px; margin-bottom:25px;">
          <strong style="color:#2563eb;">Email:</strong> ${email}
        </div>
        <p style="font-size:16px; line-height:1.6;">
          You can now sign in and start exploring the MERN Auth Website.  
          If you have any questions, our support team is just an email away.
        </p>

        <!-- Button -->
        <div style="text-align:center; margin:35px 0;">
          <a href="https://your-frontend-url.com/login" 
             style="background:#2563eb; color:white; text-decoration:none; padding:12px 28px; font-size:16px; border-radius:8px; display:inline-block;">
             Go to Dashboard
          </a>
        </div>

        <p style="font-size:14px; color:#6b7280;">
          Best wishes,<br/>The <strong>MERN Auth Website</strong> Team
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb; text-align:center; padding:15px;">
        <small style="color:#9ca3af;">© ${new Date().getFullYear()} MERN Auth Website. All rights reserved.</small>
      </div>

    </div>
  </div>
  `,
      };

      // Send email safely with error handling
      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${email}`);
      } catch (error) {
        console.error("❌ Error sending email:", error);
      }

      return res.json({ success: true, message: "user registered" });
    } catch (error) {
        res.json({ success: true, message: error.message });
    }

}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Email and password are required' });
    }

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.json({ success: false, message: "Invalid email" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.json({ success: false, message: "Invalid password" });
      }

      //Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "2d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 2 * 24 * 60 * 60 * 1000,
      });
        

        return res.json({ success: true, message:"User successfully logged in.." });
        
        
    } catch (error) {
        
    }
  };


export const logout = async (req,res) => {
      try {
          res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          });
          
          return res.json({ success: true, message: "Logged Out" });
          
      } catch (error) {
        return res.json({
          success: false,
          message: error.message,
        });
      }
  } 

 //Sent OTP for email verification 
export const sendVerifyOtp = async (req,res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    //  Send Beautiful OTP Verification Email
    const mailOptions = {
      from: `"MERN Auth Website" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "🔐 Verify Your Account — OTP Inside!",
      text: `Your OTP is ${otp}. Verify your account using this code.`,
      html: `
  <div style="background-color:#f3f4f6; padding:40px 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden;">
      
      <!-- Header -->
      <div style="background:linear-gradient(90deg, #2563eb, #1e40af); color:white; text-align:center; padding:25px 10px;">
        <h1 style="margin:0; font-size:26px; letter-spacing:0.5px;">MERN Auth Website</h1>
        <p style="margin:5px 0 0; font-size:14px; opacity:0.9;">Secure • Modern • Reliable</p>
      </div>
      
      <!-- Body -->
      <div style="padding:30px 25px; color:#111827;">
        <h2 style="font-size:22px; margin-bottom:15px;">Account Verification 🔐</h2>
        <p style="font-size:16px; line-height:1.6; margin-bottom:15px;">
          Hello <strong>${user.name || "User"}</strong>,<br/>
          To complete your registration, please verify your account using the OTP below:
        </p>

        <!-- OTP Box -->
        <div style="background:#f9fafb; border-left:4px solid #2563eb; padding:18px 25px; border-radius:6px; margin:25px 0; text-align:center;">
          <p style="font-size:32px; font-weight:bold; color:#2563eb; margin:0;">${otp}</p>
          <p style="font-size:14px; color:#6b7280; margin-top:5px;">This OTP is valid for the next 15 minutes.</p>
        </div>

        <!-- Verify Button -->
        <div style="text-align:center; margin:35px 0;">
          <a href="https://your-frontend-url.com/verify?email=${user.email}" 
             style="background:#2563eb; color:white; text-decoration:none; padding:12px 28px; font-size:16px; border-radius:8px; display:inline-block;">
             Verify My Account
          </a>
        </div>

        <p style="font-size:15px; line-height:1.6; color:#374151;">
          Didn't request this email? You can safely ignore it — your account remains secure.
        </p>

        <p style="font-size:14px; color:#6b7280; margin-top:30px;">
          Best,<br/>The <strong>MERN Auth Website</strong> Team
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb; text-align:center; padding:15px;">
        <small style="color:#9ca3af;">© ${new Date().getFullYear()} MERN Auth Website. All rights reserved.</small>
      </div>

    </div>
  </div>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Verification OTP Sent on Email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

//verify the email using OTP
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userId;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.json({success:false, message:"User not found"})
    }

    if (user.verifyOtp === '' || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    //if verifyOtpExpireAt is less then Date.now then the otp is expired
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;
    
    await user.save();
    
    return res.json({success:true, message: 'Email verified successfully'})

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

//check if the user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, message:"User is successfully authenticated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
   
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    // ✅ Send Password Reset OTP Email
const mailOptions = {
  from: `"MERN Auth Website" <${process.env.SENDER_EMAIL}>`,
  to: user.email,
  subject: "🔑 Password Reset Request — Your OTP Inside!",
  text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`,
  html: `
  <div style="background-color:#f3f4f6; padding:40px 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden;">
      
      <!-- Header -->
      <div style="background:linear-gradient(90deg, #2563eb, #1e40af); color:white; text-align:center; padding:25px 10px;">
        <h1 style="margin:0; font-size:26px;">MERN Auth Website</h1>
        <p style="margin:5px 0 0; font-size:14px; opacity:0.9;">Reset your password securely 🔐</p>
      </div>
      
      <!-- Body -->
      <div style="padding:30px 25px; color:#111827;">
        <h2 style="font-size:22px; margin-bottom:15px;">Password Reset Request</h2>
        <p style="font-size:16px; line-height:1.6; margin-bottom:15px;">
          Hello <strong>${user.name || "User"}</strong>,<br/>
          We received a request to reset your account password. Use the OTP below to proceed:
        </p>

        <!-- OTP Box -->
        <div style="background:#f9fafb; border-left:4px solid #2563eb; padding:18px 25px; border-radius:6px; margin:25px 0; text-align:center;">
          <p style="font-size:32px; font-weight:bold; color:#2563eb; margin:0;">${otp}</p>
          <p style="font-size:14px; color:#6b7280; margin-top:5px;">This OTP is valid for the next 15 minutes.</p>
        </div>

        <p style="font-size:15px; color:#374151; line-height:1.6;">
          Enter this OTP in the password reset page to create a new password.  
          If you didn’t request this, you can safely ignore this email — your account is secure.
        </p>

        <!-- Button -->
        <div style="text-align:center; margin:35px 0;">
          <a href="https://your-frontend-url.com/reset-password" 
             style="background:#2563eb; color:white; text-decoration:none; padding:12px 28px; font-size:16px; border-radius:8px; display:inline-block;">
             Reset Password
          </a>
        </div>

        <p style="font-size:14px; color:#6b7280;">
          Regards,<br/>The <strong>MERN Auth Website</strong> Team
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb; text-align:center; padding:15px;">
        <small style="color:#9ca3af;">© ${new Date().getFullYear()} MERN Auth Website. All rights reserved.</small>
      </div>

    </div>
  </div>`,
};

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: 'OTP sent to your email' });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}


//verify otp and reset password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Email, OTP and new password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Inavlid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "password has been reset successfully" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}



















/**Using new User({...}) + await user.save()
const user = new User({
  name,
  email,
  password: hashedPassword
});

await user.save();


Explanation:
User is a Mongoose model (a class).
new User({...}) creates a new document instance of that model.
Then, user.save() actually writes it to the database.
This gives you full control — you can modify fields before saving.

✅ Recommended when:
You want to validate, modify, or log the data before saving.
You want to handle .save() errors manually. 


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Using User.create({...})
const user = await User.create({
  name,
  email,
  password: hashedPassword
});


Explanation:
User.create() is a shortcut provided by Mongoose.

It does both:
Creates a new document.
Saves it directly to MongoDB.
So it’s equivalent to:

const user = new User({...});
await user.save();

but in one line.

✅ Recommended when:
You just want to insert data quickly.
You don’t need to modify or validate manually before saving.*/