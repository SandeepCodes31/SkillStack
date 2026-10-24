import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { generateToken } from "../utils/generateToken.js";
// import { useReducer } from "react";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

// Business logic behind Signup page
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
      $or: [
        { email: normalizedEmail },
        { email: email.trim() },
        { email: { $regex: new RegExp(`^${normalizedEmail.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") } },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const requestedRole = (role || "").trim().toLowerCase();
    const isAdminRegistration = requestedRole === "admin" || requestedRole === "instructor";

    let finalRole = "student";
    if (isAdminRegistration) {
      const authorizedAdminEmails = [
        "sandeeppal6926@gmail.com",
        (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
      ].filter(Boolean);

      if (authorizedAdminEmails.includes(normalizedEmail)) {
        finalRole = "admin";
      } else {
        return res.status(403).json({
          success: false,
          message:
            "Admin registration is restricted. Only authorized platform administrator emails can create an admin account.",
        });
      }
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: finalRole,
      isVerified: true,
    });

    return generateToken(
      res,
      newUser,
      finalRole === "admin"
        ? "Admin account created successfully! Welcome to SkillStack Admin Portal."
        : "Student account created successfully! Welcome to SkillStack."
    );
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to register",
    });
  }
};

// Business logic behind Login page
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
      $or: [
        { email: normalizedEmail },
        { email: email.trim() },
        { email: { $regex: new RegExp(`^${normalizedEmail.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") } },
      ],
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // Strict Role-Based Access Validation
    const selectedRole = (role || "").trim().toLowerCase();
    const isUserAdmin = user.role === "admin" || user.role === "instructor";

    if (selectedRole === "admin") {
      if (!isUserAdmin) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. This is a student account. Please select 'Student' to log in to the Student Portal.",
        });
      }
    } else if (selectedRole === "student") {
      if (isUserAdmin) {
        return res.status(403).json({
          success: false,
          message:
            "This account has administrator privileges. Please select 'Admin' to log in to the Admin Portal.",
        });
      }
    }

    // Ensure user account verification
    if (user.isVerified === false) {
      user.isVerified = true;
      try {
        await User.findByIdAndUpdate(user._id, { isVerified: true });
      } catch (e) {}
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
    const isProduction =
      process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

    // Explicitly invalidate cookies across all possible browser variations
    const cookieVariations = [
      { httpOnly: true, sameSite: isProduction ? "none" : "lax", secure: isProduction, path: "/" },
      { httpOnly: true, sameSite: "none", secure: true, path: "/" },
      { httpOnly: true, sameSite: "lax", secure: false, path: "/" },
      { httpOnly: true, sameSite: "strict", secure: false, path: "/" },
      { httpOnly: true, sameSite: "lax", secure: true, path: "/" },
      { httpOnly: true, path: "/" },
      { path: "/" },
      {},
    ];

    cookieVariations.forEach((opts) => {
      res.clearCookie("token", opts);
      res.cookie("token", "", {
        ...opts,
        expires: new Date(0),
        maxAge: 0,
      });
    });

    // Also clear other possible cookie variants
    ["token", "Token", "jwt", "session"].forEach((cName) => {
      res.clearCookie(cName, { path: "/" });
      res.cookie(cName, "", { path: "/", expires: new Date(0), maxAge: 0 });
    });

    try {
      res.setHeader("Clear-Site-Data", '"cookies"');
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
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
