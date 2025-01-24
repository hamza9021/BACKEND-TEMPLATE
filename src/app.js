import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const app = express();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(express.static("public"));

//ROUTES IMPORT
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);

export { app };
