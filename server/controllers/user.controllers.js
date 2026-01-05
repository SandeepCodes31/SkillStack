import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
// import { useReducer } from "react";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

// Bussiness logic behind Signup page
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to register",
      // error:error.message
    });
  }
};

// Bussiness logic behind Login page
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
        // message:"Incorrect email or password"
      });
    }
    // generateToken(res, user, `Welcome back ${user.name}`);

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    generateToken(res, user);

    return res.status(200).json({
      success: true,
      message: `Welcome back ${user.name}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error.message,
    });
  }
};

export const logout = async (__dirname, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      success: true,
      message: "Logged out Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Logout",
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "Profile not found",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Load User",
    });
  }
};


//start here 

// export const updateProfile = async (req, res) => {
//   try {
//     const userId = req.id;
//     const { name } = req.body;
//     const profilePhoto = req.file;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     //extract public id of the old image from the url if it exists.
//     if(user.photoUrl){
//       const publicId = user.photoUrl.split("/").pop().split(".")[0]; //extract public Id
//       deleteMediaFromCloudinary(publicId);
//     }
//     //upload new photo
//     const cloudResponse  = await uploadMedia(profilePhoto.path);
//     const photoUrl = cloudResponse.secure_url;



//     const updateData = {name, photoUrl};
//     const updatedUser = await User.findByIdAndUpdate(userId, updateData, {new:true}).select("-password");

//     return res.status(200).json({
//       success:true,
//       user:updatedUser,
//       message:"Profile updated Successfully"
//     })

//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update profile",
//     });
//   }
// };


//upto here only 


export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name } = req.body;
    const profilePhoto = req.file; // may be undefined

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // update name if provided
    if (name) {
      user.name = name;
    }

    // ONLY handle image if a new file is uploaded
    if (profilePhoto) {
      // delete old image from cloudinary (if exists)
      if (user.photoURL) {
        const publicId = user.photoURL.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
        console.log("FILE SAVED AT 👉", profilePhoto.path);
      // upload new image
      const cloudResponse = await uploadMedia(profilePhoto.path);
      user.photoURL = cloudResponse.secure_url;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      user,
      message: "Profile updated Successfully",
    });
  } catch (error) {
    console.log("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};
