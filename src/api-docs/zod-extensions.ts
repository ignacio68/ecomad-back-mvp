import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extender Zod con las funciones de OpenAPI
extendZodWithOpenApi(z);

export { z };
