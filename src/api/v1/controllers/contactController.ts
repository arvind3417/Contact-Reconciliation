import { Request, Response, NextFunction } from "express";
import * as CustomErrors from "../errors";
import asyncWrapper from "../helpers/asyncWrapper";
import { StatusCodes } from "http-status-codes";

import { httpResponse } from "../helpers";
import { createContact, updateContact } from "../config/dao/contact";
import db from "../config/db";
import { log } from "console";

//linked-contact-handler
async function findLinkedContact(email: string, phoneNumber: Number) {
  let matchedContacts = await db("Contact")
    .select("*")
    .where("email", email)
    .orWhere("phone_number", phoneNumber);
  if (matchedContacts.length == 0) {
    console.log("length =0");

    const contactEntry = {
      email: email,
      phone_number: phoneNumber,
      link_precedence: "primary",
    };
    const createdContact = await createContact(contactEntry);
    console.log((createdContact[0] as any).id);

    return (createdContact[0] as any).id;
  } else if (matchedContacts.length == 1) {
    console.log("length =1");

    if (
      email &&
      phoneNumber &&
      (matchedContacts[0].email != email ||
        matchedContacts[0].phone_number != phoneNumber)
    ) {
      // insert
      const contactEntry = {
        email: email,
        phone_number: phoneNumber,
        link_precedence: "secondary",
        linked_id: matchedContacts[0].id,
      };
      const createdContact = await createContact(contactEntry);

      return (createdContact[0] as any).id;
    }
    return matchedContacts[0].id;
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
    (phoneObj as any).link_precedence = "secondary";
    (phoneObj as any).linked_id = (emailObj as any).id;
    if (email && phoneNumber) {
      const res = await updateContact(phoneObj);
      return (res[0] as any).id;
    } else {
      return matchedContacts.slice(-1)[0].id;
    }
  }
}

async function root_rescursive(id) {
  const query = `WITH RECURSIVE FindRoot AS (SELECT id, email, phone_number, link_precedence, linked_id
    FROM "Contact"
    WHERE id = ?
  
    UNION ALL
  
    SELECT c.id, c.email, c.phone_number, c.link_precedence, c.linked_id
    FROM "Contact" c
             JOIN FindRoot r ON c.id = r.linked_id)
  SELECT *
  FROM FindRoot
  WHERE link_precedence = 'primary';`;
  const dbquery = await db.raw(query, [id]);

  return dbquery.rows[0].id;
}

async function child_recursive(id) {
  const query = `WITH RECURSIVE ChildHierarchy AS (
    SELECT
      id,
      email,
      phone_number,
      linked_id,
      link_precedence
    FROM "Contact"
    WHERE id = ?
  
    UNION ALL
  
    SELECT
      c.id,
      c.email,
      c.phone_number,
      c.linked_id,
      c.link_precedence
    FROM "Contact" c
    INNER JOIN ChildHierarchy ch ON c.linked_id = ch.id
  )
  SELECT
    array_remove(array_agg(DISTINCT email), null) AS emails,
    array_remove(array_agg(DISTINCT phone_number), null) AS phoneNumbers,
    MAX(CASE WHEN link_precedence = 'primary' THEN id END) AS primaryContatctId,
    array_remove(array_agg(CASE WHEN link_precedence = 'secondary' THEN id END), null) AS secondaryContactIds
  FROM ChildHierarchy;
  ;
  `;

  const dbquery = db.raw(query, [id]);
  const res = await dbquery;

  return res.rows[0];
}

export const handleContactCreation = asyncWrapper(
  async (_req: Request, _res: Response, _next: NextFunction) => {
    try {
      const { email, phoneNumber } = _req.body;
      const contactid = await findLinkedContact(
        email || null,
        phoneNumber || null
      );

      const rootid = await root_rescursive(contactid);
      console.log(rootid);

      const childs = await child_recursive(rootid);

      _res.status(StatusCodes.CREATED).json(
        httpResponse(true, "Journal Created successfully", {
          childs,
        })
      );
    } catch (error: any) {
      console.error("Error:", error);
      return _next(new CustomErrors.InternalServerError(error.message));
    }
  }
);
