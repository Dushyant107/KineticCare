import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    if (!username || !password || !email) {
      return res.json({ message: "Missing Details" });
    }

    let user = await User.findOne({ username });
    if (!user) {
      user = await User.findOne({ email });
    }

    if (user) {
      return res.status(400).json({ message: "User Already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email: email,
      username: username,
      password: hashedPass,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({
      message: "Sign Up Successfull",
      token,
      userId: newUser._id,
    });
  } catch (err) {
        console.error("Error in signing up the user:", err);
        res.status(500).json({ message: "Server Error" });
  }
};


export const login = async (req,res)=>{

    const {email,password} = req.body;

    try {
        if (!email || !password) {
          return res
            .status(400)
            .json({ success: false, message: "Missing Details" });
        }
        const userData = await User.findOne({ email });
        if (!userData) {
          res.json({ success: false, messgae: "Invalid Credantials" });
        }

        const result = await bcrypt.compare(password, userData.password);

        if (!result) {
          res
            .status(400)
            .json({ success: false, messgae: "Invalid Credantials" });
        }

        const token = await jwt.sign(
          { id: userData._id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1h" },
        );

        const userObj = userData.toObject();
        delete userObj.password;

        res.json({
          success: true,
          userObj,
          token,
          userId: userData._id,
          message: "Login succesfull",
        });


    } catch (err) {
      console.error("Error in Loging in:", err);
      res.status(500).json({ message: "Server Error" });
    }
}


export const getUserProfile = async (req, res) => {
  const userID = req.params.id;

  try {
    const user = await User.findById(userID).select("-password");
    return res.status(200).json({ user, message: "User fetched by Id" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Cannot fetch user Profile due to Server Error" });
  }
};