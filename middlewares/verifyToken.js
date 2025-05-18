import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";

// ✅ Middleware عام: التحقق من JWT
export const verifyToken = (req, res, next) => {
  let token = req.cookies.access_token;

  // إذا مكاينش cookie وكاين authorization فـ headers (مثلاً من Postman)
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(createError(403, "Access denied!"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.user = user; // 👈 نخزنو user اللي جا من JWT فـ req
    next();
  });
};

// ✅ فقط المستخدم المعني أو المسؤول يقدر يدخل
export const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};

// ✅ فقط المسؤول (admin) يقدر يدخل
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, "You are not an admin!"));
    }
  });
};

// ✅ مخصص للوصفات: دعم token سواء فـ cookie أو فـ header
export const verifyTokenRecipe = (req, res, next) => {
  let token = req.cookies.access_token;

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(createError(403, "Access denied!"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.user = user;
    next();
  });
};
