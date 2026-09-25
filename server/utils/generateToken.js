import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const secretKey =
    process.env.SECRET_KEY || "snjekfiejgcxkakasdfjd_skillstack_jwt_secret_2026";
  const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, {
    expiresIn: "1d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message,
      user,
    });
};
