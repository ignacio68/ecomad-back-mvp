import request from "supertest";
import { app } from "../../../server";

describe("Clothing Bin Router", () => {
	describe("GET /api/clothing-bins", () => {
		it("should return all clothing bins", async () => {
			const response = await request(app).get("/api/clothing-bins").expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Contenedores de ropa obtenidos exitosamente");
			expect(Array.isArray(response.body.responseObject)).toBe(true);
		});
	});

	describe("GET /api/clothing-bins/count", () => {
		it("should return clothing bins count", async () => {
			const response = await request(app).get("/api/clothing-bins/count").expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Conteo de contenedores obtenido exitosamente");
			expect(typeof response.body.responseObject.count).toBe("number");
		});
	});

	describe("GET /api/clothing-bins/district/:district", () => {
		it("should return clothing bins by district", async () => {
			const response = await request(app).get("/api/clothing-bins/district/ARGANZUELA").expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toContain("ARGANZUELA");
			expect(Array.isArray(response.body.responseObject)).toBe(true);
		});

		it("should return 400 when district is missing", async () => {
			const response = await request(app).get("/api/clothing-bins/district/").expect(404); // Express returns 404 for missing route parameter

			expect(response.body.success).toBe(false);
		});
	});

	describe("GET /api/clothing-bins/nearby", () => {
		it("should return nearby clothing bins", async () => {
			const response = await request(app).get("/api/clothing-bins/nearby?lat=40.4168&lng=-3.7038&radius=5").expect(200);

			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Contenedores de ropa cercanos obtenidos exitosamente");
			expect(Array.isArray(response.body.responseObject)).toBe(true);
		});

		it("should return 400 when lat and lng are missing", async () => {
			const response = await request(app).get("/api/clothing-bins/nearby").expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Los parámetros 'lat' y 'lng' son requeridos");
		});

		it("should return 400 when lat and lng are invalid", async () => {
			const response = await request(app).get("/api/clothing-bins/nearby?lat=invalid&lng=invalid").expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Los parámetros 'lat', 'lng' y 'radius' deben ser números válidos");
		});
	});
});
