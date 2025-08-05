import jwt from "jsonwebtoken";

export const optionalAuth = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    req.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userId = decoded.id;
    next();
  } catch (err) {
    req.userId = null;
    next();
  }
}; 