import mongoose from "mongoose";

export const isString = (value: any) => typeof value === "string";

export const isNumber = (value: any) => !isNaN(value);
export const isArray = (value: any) => Array.isArray(value);

export const isValidUrl = (value: any) => {
  const url =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  return url.test(value);
};

export const isValidEmail = (email: any) => {
  const valid = new RegExp(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  return valid.test(email);
};

export const isBoolean = (value: any) => value === "true" || value === "false";

export const isValidUserName = (userName: string) => {
  const regex = /^[a-z]+\d*[a-z\d]*$/;
  return regex.test(userName) && userName.length < 8;
};

export const isObjectId = (value: any) =>
  mongoose.Types.ObjectId.isValid(value);

export const isprofessional_or_semiprofessional_or_amateur = (value: string) =>
  ["professional", "semiprofessional", "amateur"].includes(value);

export const iswinner_or_loser = (groupType: string) =>
  groupType === "winner" || groupType === "loser";
