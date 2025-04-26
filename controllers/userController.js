

export const getUsers = (req, res)=>{
    res.json([{ id: 1 , name : "user one"}, { id: 2 , name : "user two"}])
}