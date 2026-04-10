import jwt from "jsonwebtoken";

const isAuthenticated = async(req,res,next)=>{
try{
    let token = req.cookies.token;
    
    // Check Authorization header if token not in cookies
    if(!token && req.headers.authorization){
        if(req.headers.authorization.startsWith("Bearer ")){
            token = req.headers.authorization.split(" ")[1];
        }
    }

    if(!token){
        return res.status(401).json({
            message:"User not authenticated. Please login.",
            success : false,
        })
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    if(!decode){
        return res.status(401).json({
            message:"Invalid or expired token.",
            success:false
        })
    };
    req.id = decode.userId;
    next();
}catch(error){
    console.error("Authentication Error:", error);
    return res.status(401).json({
        message: "Authentication failed",
        success: false
    });
}
}

export default isAuthenticated;