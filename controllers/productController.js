import Product from "../models/Product.js";

export const createProduct = async (req, res, next) => {
    try{
         const createdproduct = await Product.create(req.body);
         res.status(200).json(createdproduct)
    }catch(err){
        next(err)
    };};


export const getProduct = async (req, res, next) =>{
    try{
        const product = await Product.findById(req.params.id);
    res.status(200).json(product)
    }catch(err){
        next(err)
    };
};
   
export const getAllProducts = async (req, res, next)=>{
    try{
        const products = await Product.find();
        res.status(200).json(products);

    }catch(err){
        next(err)
    };
};

export const updateProduct = async (req, res, next)=>{
    try{
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true}); 

        res.status(200).json(updatedProduct)

    }catch(err){
        next(err)
    };
};

export const deleteProduct = async (req,res, next)=>{
    try{
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({mesage:"Product deleted!"})
     
    }catch(err){
        next(err)
    }
};