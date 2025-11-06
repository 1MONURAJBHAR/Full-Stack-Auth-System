import mongoose from "mongoose"


const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("MongoDB connection successfull ✅"));
        await mongoose.connect(`${process.env.MONGODB_URI}/Mern-auth`); 
          
    } catch (error) {
        console.log("MongoDB connection failed ❌");
        console.log(error.message);
        
    }
}

export default connectDB;