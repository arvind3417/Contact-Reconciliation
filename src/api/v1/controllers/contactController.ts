import { Request, Response, NextFunction } from "express";
import knex from "knex"; // Assuming you are using knex for database queries
import * as CustomErrors from "../errors";
import asyncWrapper from "../helpers/asyncWrapper";
// import { AttachmentType } from "../config/constants";
import { STATUS_CODES } from "http";
import { StatusCodes } from "http-status-codes";

import { httpResponse } from "../helpers";
import { createContact, findLinkedContact } from "../config/dao/contact";

export async function handleContactCreation(
    req: Request ,
    res: Response,
    next: NextFunction
  ) {
    try {
        const { email, phoneNumber } = req.body;
        console.log(req.body);
        const existingLinkedContact = await findLinkedContact(email, phoneNumber);
        console.log(existingLinkedContact);
        

        if (existingLinkedContact) {
          // Handle the case where linked contacts are found
         return res.status(StatusCodes.OK).json(
            httpResponse(false, 'Contacts already linked', {
              existingLinkedContact
            })
          );
        //   return;
        }
        
        const contactEntry = {
            email: email || null,
            phoneNumber: phoneNumber || null,
            linkPrecedence: 'primary' // Provide the appropriate value here
          };
          
       
        const createdContact =  await createContact(contactEntry);
        
        res.status(StatusCodes.CREATED).json(
          httpResponse(true, "Journal Created successfully", {
            createdContact
          })
        );
      
    } catch (error: any) {
      console.error("Error:", error);
      return next(new CustomErrors.InternalServerError(error.message));
    }
  }
  