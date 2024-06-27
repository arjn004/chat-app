import User from "../models/user.model.js";

export const getUsersForSideBars = async (req, res) => {
  try {
    const userId = req.user._id;

    const allUsers = await User.find({ _id: { $ne: userId } }).select("-password");
    res.status(200).json({allUsers})
  } catch (error) {
    console.log("Error in getUser for sidebar controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
