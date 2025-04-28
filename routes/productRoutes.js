import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProduct, updateProduct } from "../controllers/productController.js";

const router = express.Router();

router.get("/:id", getProduct);
router.get("/", getAllProducts)
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct)

export default router;