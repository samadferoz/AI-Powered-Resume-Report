const express=require("express")
const cookieParser= require("cookie-parser")
const cors = require("cors")


const app=express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

const authRouter=require("./routes/auth.routes")
const interviewRouter= require('./routes/interview.routes')

app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)

const server = app.listen(3000, () => {
    console.log("Server running on port 3000");
});

// Timeout badhakar 5 minutes kar dein (Puppeteer ke liye zaroori hai)
server.timeout = 300000;

module.exports=app

