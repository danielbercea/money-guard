import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Nu ești autentificat.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch {
    return res.status(401).json({
      message: "Sesiune invalidă sau expirată.",
    });
  }
};

export default authMiddleware;
