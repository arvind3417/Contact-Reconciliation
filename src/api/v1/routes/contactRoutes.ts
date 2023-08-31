
import express from "express";


import {

  handleContactCreation,

 
} from "../controllers/contactController";


export const contactRouter = express.Router();

contactRouter.route("/identify").post(handleContactCreation)
