import express from "express";
import multer from "multer";
import { storage } from "../utils/cloudinary.js";


const router = express.Router();

const upload = multer({ storage });

router.post("/", upload.single("image"), (req, res)=>{
    res.status(200).json({
        message: "Image upload successfully!",
        imageUrl: req.file.path
    })
});

export default router;