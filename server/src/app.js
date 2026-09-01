import express from 'express';
import cookieParser from 'cookie-parser';
import Cors from 'cors';
import authRouter from './routes/auth.routes.js';
import adminRouter from './routes/admin.routes.js';

const app = express();

const origins = process.env.ORIGINS
  ? process.env.ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

// Default Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  Cors({
    origin: origins,          // must be explicit origins, not "*"
    credentials: true,        // REQUIRED when frontend uses withCredentials
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routers
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

export default app;