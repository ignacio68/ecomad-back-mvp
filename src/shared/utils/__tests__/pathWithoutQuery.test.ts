import { describe, expect, it } from "vitest";

import { pathWithoutQuery } from "../pathWithoutQuery";

describe("pathWithoutQuery", () => {
	it("drops the query string so coordinates are never logged", () => {
		expect(pathWithoutQuery("/api/v1/bins/clothing_bins/nearby?lat=40.4168&lng=-3.7038&radius=2")).toBe(
			"/api/v1/bins/clothing_bins/nearby",
		);
	});

	it("keeps a path without query unchanged", () => {
		expect(pathWithoutQuery("/api/v1/bins/clothing_bins")).toBe("/api/v1/bins/clothing_bins");
	});

	it("handles a missing url", () => {
		expect(pathWithoutQuery(undefined)).toBe("");
	});
});
