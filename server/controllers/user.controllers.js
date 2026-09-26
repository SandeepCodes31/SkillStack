import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { generateToken } from "../utils/generateToken.js";
// import { useReducer } from "react";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

// Bussiness logic behind Signup page
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { email: email.trim() }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdminRegistration = role === "admin" || role === "instructor";

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: isAdminRegistration ? "admin" : "student",
      isVerified: true,
    });

    if (isAdminRegistration) {
      return res.status(201).json({
        success: true,
        message:
          "Admin account created successfully! You can now log in.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully! Please log in.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to register",
    });
  }
};

// Bussiness logic behind Login page
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: normalizedEmail }, { email: email.trim() }],
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // Auto-promote platform admin/owner accounts if needed
    const ownerEmails = [
      "sandeep31@gmail.com",
      "palsandeep8656@gmail.com",
      "sandeepgcp31@gmail.com",
      "sandeeppal6926@gmail.com",
      (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
    ].filter(Boolean);

    if (ownerEmails.includes(normalizedEmail) && user.role !== "admin") {
      user.role = "admin";
      user.isVerified = true;
      try {
        await User.findByIdAndUpdate(user._id, { role: "admin", isVerified: true });
      } catch (saveErr) {
        console.warn("Could not auto-promote user in DB:", saveErr.message);
      }
    }

    // Role-based validation
    const isAdmin = user.role === "admin" || user.role === "instructor";
    if (role === "admin" && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "This account is registered with Student access. Please switch to the Student Portal tab to sign in.",
      });
    }

    // Verification check for admin accounts
    if (isAdmin && user.isVerified === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is pending verification by management. Please contact support.",
      });
    }

    return generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to login",
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 0,
      })
      .json({
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
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        populate: [
          { path: "creator", select: "name email photoURL" },
          { path: "lectures", select: "lectureTitle isPreviewFree" },
        ],
      });
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
      // upload new image
      const cloudResponse = await uploadMedia(profilePhoto.path);
      user.photoURL = cloudResponse.secure_url;

      // Clean up temporary local file safely
      try {
        const safeFilename = path.basename(profilePhoto.path || "");
        const uploadsDir = path.resolve("uploads");
        const fullSafePath = path.resolve(uploadsDir, safeFilename);
        if (fullSafePath.startsWith(uploadsDir) && fs.existsSync(fullSafePath)) {
          fs.unlinkSync(fullSafePath);
        }
      } catch (_) {}
    }

    await user.save();

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photoURL: user.photoURL || "",
      enrolledCourses: user.enrolledCourses || [],
      isVerified: user.isVerified ?? true,
    };

    return res.status(200).json({
      success: true,
      user: safeUser,
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
