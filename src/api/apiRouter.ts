import express, { type Router } from "express";
import { v1Router } from "./v1/v1Router";

/**
 * Router principal de la API
 * Maneja todas las versiones de la API: /api/v1, /api/v2, etc.
 */
const apiRouter: Router = express.Router();

// Versión 1 de la API
apiRouter.use("/v1", v1Router);

// Aquí se pueden agregar más versiones en el futuro:
// apiRouter.use("/v2", v2Router);
// apiRouter.use("/v3", v3Router);

export { apiRouter };
