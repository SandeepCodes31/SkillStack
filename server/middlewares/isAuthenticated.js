import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  // ✅ allow CORS preflight to pass
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "User not Authenticated",
        success: false,
      });
    }
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.id = decode.userId;
    next();
    // if (!decode) {
    //   return res.status(401).json({
    //     message: "Invalid token",
    //     success: false,
    //   });
    // }
    // req.id = decode.userId;
    // next();
    // } catch (error) {
    //   console.log(error);
    // }
  } catch (error) {
    console.log("AUTH ERROR:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default isAuthenticated;
