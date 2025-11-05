import dotenv from "dotenv";
import { z } from "zod";

// Load environment-specific .env file
const getEnvFile = () => {
	if (process.env.NODE_ENV === "production") return ".env.production";
	if (process.env.NODE_ENV === "test") return ".env.test";
	return ".env.development";
};

dotenv.config({ path: getEnvFile() });

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("production"),

	HOST: z.string().min(1).default("localhost"),

	PORT: z.coerce.number().int().positive().default(8080),

	CORS_ORIGIN: z.string().default("https://localhost:8080"),

	COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(1000),

	COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

	// Nearby defaults
	MAX_RADIUS_KM: z.coerce.number().positive().default(5),
	DEFAULT_LIMIT: z.coerce.number().int().positive().default(1000),

	// Supabase
	SUPABASE_URL: z.string().url(),
	SUPABASE_ANON_KEY: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error("❌ Invalid environment variables:", parsedEnv.error.format());
	throw new Error("Invalid environment variables");
}

export const env = {
	...parsedEnv.data,
	isDevelopment: parsedEnv.data.NODE_ENV === "development",
	isProduction: parsedEnv.data.NODE_ENV === "production",
	isTest: parsedEnv.data.NODE_ENV === "test",
	// Adjust rate limit based on environment (looser in dev, stricter in prod)
	get effectiveRateLimit(): number {
		return this.isDevelopment || this.isTest
			? 1000 // Permissive in dev/test
			: this.COMMON_RATE_LIMIT_MAX_REQUESTS; // Use configured value in production
	},
};
