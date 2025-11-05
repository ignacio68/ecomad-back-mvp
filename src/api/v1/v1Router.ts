import express, { type Router } from "express";
import binsRouter from "@/api/v1/bins/routes/binsRouter";

/**
 * Router de la versión v1 de la API
 * Maneja todos los módulos de la versión 1: /api/v1/bins, /api/v1/users, etc.
 */
const v1Router: Router = express.Router();

// Módulo de contenedores (bins)
v1Router.use("/bins/:binType", binsRouter);

// Aquí se pueden agregar más módulos en el futuro:
// v1Router.use("/users", usersRouter);
// v1Router.use("/recycling-centers", recyclingCentersRouter);
// v1Router.use("/admin", adminRouter);

export { v1Router };
