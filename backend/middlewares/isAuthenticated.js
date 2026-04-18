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
    req.id = decode.userId;
    next();
  } catch (error) {
    console.error("Authentication Error:", error.name, error.message);
    let message = "Authentication failed";
    if (error.name === 'TokenExpiredError') {
      message = "Session expired. Please login again.";
    } else if (error.name === 'JsonWebTokenError') {
      message = "Invalid token. Please login again.";
    }
    return res.status(401).json({
      message,
      success: false
    });
  }
};

export default isAuthenticated;