import User from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing user ID in request.",
      });
    }

    const user = await User.findById(userId);
    

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please re-login.",
      });
    }

    return res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    console.error("❌ Error in getUserData:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
