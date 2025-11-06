import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    //1. Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login again.",
      });
    }

    //2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    //3. Check if decoding succeeded
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    //4. Attach userId to request
    req.userId = decoded.id; // attach safely to req, not req.body
    
    //5. Continue
    next();
  } catch (error) {
    console.error("JWT Auth Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Token verification failed. Please login again.",
    });
  }
};

export default userAuth;
