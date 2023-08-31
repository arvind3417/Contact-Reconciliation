import { Request, Response, NextFunction } from "express";
import * as CustomErrors from "../errors";
import asyncWrapper from "../helpers/asyncWrapper";
import { StatusCodes } from "http-status-codes";

import { httpResponse } from "../helpers";
import { createContact, updateContact } from "../config/dao/contact";
import db from "../config/knex-db";

//linked-contact-handler
async function findLinkedContact(email: string, phoneNumber: Number) {
  let matchedContacts = await db("Contact")
    .select("*")
    .where("email", email)
    .orWhere("phoneNumber", phoneNumber);
  if (matchedContacts.length == 0) {
    console.log("length =0");

    const contactEntry = {
      email: email,
      phoneNumber: phoneNumber,
      linkPrecedence: "primary",
    };
    const createdContact = await createContact(contactEntry);
    return createdContact;
  } else if (matchedContacts.length == 1) {
    console.log("length =1");

    const contactEntry = {
      email: email,
      phoneNumber: phoneNumber,
      linkPrecedence: "secondary",
      linkedId: matchedContacts[0].id,
    };
    const createdContact = await createContact(contactEntry);
    return createdContact;

  } else {
    console.log("length >1");

    let emailObj = {};
    let phoneObj = {};

    if (matchedContacts[0].email == email) {
      emailObj = matchedContacts[0];
      phoneObj = matchedContacts[1];
    } else {
      emailObj = matchedContacts[1];
      phoneObj = matchedContacts[0];
    }
    (phoneObj as any).linkPrecedence = "secondary";
    (phoneObj as any).linkedId = (emailObj as any).id;

    const res = await updateContact(phoneObj);

    return res;
  }
}


export const handleContactCreation = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    try {
      const { email, phoneNumber } = _req.body;
      const contact = await findLinkedContact(email || null, phoneNumber || null);
  
      _res.status(StatusCodes.CREATED).json(
        httpResponse(true, "Journal Created successfully", {
          contact,
        })
      );
    } catch (error: any) {
      console.error("Error:", error);
      return _next(new CustomErrors.InternalServerError(error.message));
    }
  }
);
