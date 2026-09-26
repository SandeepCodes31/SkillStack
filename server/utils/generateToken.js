import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const secretKey =
    process.env.SECRET_KEY || "snjekfiejgcxkakasdfjd_skillstack_jwt_secret_2026";
  const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, {
    expiresIn: "7d",
  });

  const isProduction =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

  if (isProduction && !process.env.SECRET_KEY) {
    console.warn(
      "[SECURITY WARNING] Running in production without a custom SECRET_KEY env variable! Set SECRET_KEY in your hosting dashboard."
    );
  }

  const userSafe = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified ?? true,
    photoURL: user.photoURL || "",
    enrolledCourses: user.enrolledCourses || [],
  };

  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message,
      user: userSafe,
      token,
    });
};

