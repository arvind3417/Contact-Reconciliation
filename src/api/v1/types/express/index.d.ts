import express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
	  access_token?: string;
      role?: string;
    }
  }
}
