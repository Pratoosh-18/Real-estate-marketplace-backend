import app from "./app.js";
import connectDB from "./src/db/db.js";

connectDB()
.then(()=>{
    app.get("/",(req,res)=>{
        res.send("Welcome to real estate marketplace")
    })
    
    app.listen(process.env.PORT || 3000,()=>{
        console.log("App is listening on port 8000")
    })
})
.catch((error)=>{
    console.log("Mongo DB connection failed")
    console.log(error)
})