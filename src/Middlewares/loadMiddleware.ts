import express, { Application } from "express";
import cors from "cors";

export const load = (app: Application): void => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
};
