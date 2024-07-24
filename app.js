import cors from "cors"
import express from "express" 

const app = express()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded())

import userRoutes from "./src/routes/User.routes.js"
app.use("/api/v1/user",userRoutes)

export default app