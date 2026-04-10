import mongoose from "mongoose";

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/jobportal");
        console.log("mongodb connected successfull")
    }catch(error){
            console.log(error)
    
}
}
export default connectDB;