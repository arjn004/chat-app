import bcrypt from "bcryptjs";
import User from "../models/user.model.js"
import generateTokenAndSetCookie from "../utils/generateToken.js"

export const signup = async(req, res) => { 
    try{
        const {fullName, userName, password, confirmPassword, gender} = req.body;
        if(password !== confirmPassword){
            return res.status(400).json({error: "Passwords do not match"})
        }

        const user = await User.findOne({userName})

        if (user){
            return res.status(400).json({error: "User already exists"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const boyProfilePic = `https://avatar.iran.liara.run/public/5`;
        const girProfilePic = `https://avatar.iran.liara.run/public/80`;

        const newUser = new User({
            fullName,
            userName,
            password: hashPassword,
            gender,
            profilePic: gender === "Male" ? boyProfilePic : girProfilePic,
        })
        if(newUser){
            generateTokenAndSetCookie(newUser._id, res) 
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                userName: newUser.userName,
                gender: newUser.gender, 
                profilePic: newUser.profilePic,
        })
        }else{
            res.status(400).json({error: "Invalid user data"});
        }
    }
    catch(error){
        console.log("Error in Signup Controller", error)
        res.status(500).json({error: "Internal Server Error"})
    }
    res.send("signup")
    console.log("signup user")
}

export const login = async (req, res) => {
	try {
		const { userName, password } = req.body;
		const user = await User.findOne({ userName });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			profilePic: user.profilePic,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
    try{
        res.cookie("jwt", "", {maxAge: 0})
        res.status(200).json({message: "Logged oUT Successfully"})
    }
    catch(error){
        console.log("Error in LogOut controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    };
}