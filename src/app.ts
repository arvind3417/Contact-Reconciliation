import express from "express";
import type {Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// utils
import { PORT, BASEURL } from "./api/v1/config/constants";
import { httpResponse } from "./api/v1/helpers";
import { connectDB } from "./api/v1/config/db/index";

// middleware
import { routeNotFound } from "./api/v1/middleware/routeNotFound";
import { errorHandler } from "./api/v1/middleware/errorHandler";

// routes

import { contactRouter } from "./api/v1/routes/contactRoutes";

// Use express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes

app.use(`${BASEURL}/contact`, contactRouter);

// Ping route
app.get("/", (_req: Request, _res: Response) =>
  _res.status(200).send(httpResponse(true, "OK"))
);

// Custom middleware
app.use(routeNotFound);
app.use(errorHandler);

const port = process.env.PORT || PORT;

try {
  // connect to database
  // if (!process.env.MONGO_URI)
  //   throw new Error("No connection string found in .env file");
  // connectDB(process.env.MONGO_URI);

  // Server setup
  app.listen(port, () => {
    console.log(`Server listening on: http://localhost:${port}/`);
  });
} catch (error) {
  console.error(error);
}
