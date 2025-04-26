import Product from "../models/Products.js";

export const createProduct = async (req, res, next) => {
    try{
         const product = await Product.create(req.body);
         res.status(200).json(product)
    }catch(err){
        next(err)
    };};
   
   

export const deleteProduct = (req,res)=>{
    const {id}= req.params;
    return(
        res.status(200).json({message:`product ${id} deleted!`})
    )
}