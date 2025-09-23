import { vi } from "vitest";
import { createSupabaseMock } from "../mocks/supabaseMocks";

export const supabaseMock = createSupabaseMock();

vi.mock("../../api/common/lib/supabase", () => ({
	supabase: supabaseMock,
}));
