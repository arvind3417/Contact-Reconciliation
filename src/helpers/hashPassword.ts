import bcrypt from "bcrypt";

export const hashPassword = (password: string) => {
  const salt = 10;
  const hashed = bcrypt.hashSync(password, salt);
  return hashed;
};

export const hashCompare = (pass: string, hashpass: string) => {
  const success = bcrypt.compareSync(pass, hashpass);
  return success;
};
