import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

import { env } from "@/shared/utils/envConfig";

const rateLimiter = rateLimit({
	legacyHeaders: true,
	limit: env.effectiveRateLimit, // Auto-adjusts: 1000 in dev/test, configured value in production
	message: "Too many requests, please try again later.",
	standardHeaders: true,
	windowMs: 15 * 60 * env.COMMON_RATE_LIMIT_WINDOW_MS,
	keyGenerator: (req: Request) => ipKeyGenerator(req.ip || "unknown"),
});

export default rateLimiter;
