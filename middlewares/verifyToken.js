import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";


export const verifyToken = (req, res, next) => {
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


export const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.role === "admin"){
      next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};


// export const verifyAdmin = (req, res, next) => {
//   verifyToken(req, res, () => {
//     if (req.user.role === "admin"){
//       next();
//     } else {
//       return next(createError(403, "You are not an admin!"));
//     }
//   });
// };

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      return next(createError(403, "You are not an admin!"));
    }
  });
};


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
