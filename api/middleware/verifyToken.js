import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next)=>{
    const token = req.headers.authorization.split(" ")[1];
    
        if(!token) return res.status(401).json({message:"Not Authenticated!"})
        
        jwt.verify(token, process.env.JWT_SECRET_KEY, async(err, payload)=>{
            if(err) return res.status(403).json({message:"token is not valid"});
            req.userId = payload.id;
            next();
    
        })
}