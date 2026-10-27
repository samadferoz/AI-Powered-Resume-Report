const express=require("express")
const cookieParser= require("cookie-parser")
const cors = require("cors")


const app=express()

app.use(express.json())

app.get("/", (req, res) => {
  res.status(200).json({
    message: "AI-Powered Resume Report API is running!"
  });
});

app.use(cookieParser())
app.use(cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials:true
}))

const authRouter=require("./routes/auth.routes")
const interviewRouter= require('./routes/interview.routes')

app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)

module.exports=app

