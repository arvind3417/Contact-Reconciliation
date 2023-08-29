import jwt from "jsonwebtoken";

export interface SerializedUser {
  userId: string;
  userEmail: string;
  userRole: string;
}

type UserDocument = any;

export const serializeUser = (user: UserDocument): SerializedUser => {
  return { userId: user._id, userEmail: user.email, userRole: user.role };
};

export const genAccessToken = (user: UserDocument | SerializedUser) => {
  const userToken = !user.hasOwnProperty("userId")
    ? serializeUser(user as UserDocument)
    : {
        userId: (user as SerializedUser).userId,
        userEmail: (user as SerializedUser).userEmail,
        userRole: (user as SerializedUser).userRole,
      };
  if (!process.env.JWT_ACCESS_SECRET) {
    console.log("JWT_ACCESS_SECRET not found");
    throw new Error("JWT_ACCESS_SECRET not found");
  }
  return jwt.sign(userToken, process.env.JWT_ACCESS_SECRET);
};

export const genRefreshToken = (user: UserDocument | SerializedUser) => {
  const userToken = !user.hasOwnProperty("userId")
    ? serializeUser(user as UserDocument)
    : {
        userId: (user as SerializedUser).userId,
        userEmail: (user as SerializedUser).userEmail,
        userRole: (user as SerializedUser).userRole,
      };
  return jwt.sign(userToken, process.env.JWT_REFRESH_SECRET!);
};

export const verifyAccessToken = (token: string): SerializedUser => {
  if (!process.env.JWT_ACCESS_SECRET) {
    console.log("JWT_ACCESS_SECRET not found");
    throw new Error("JWT_ACCESS_SECRET not found");
  }
  const deserializedUser = jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET
  ) as SerializedUser;
  return deserializedUser;
};
