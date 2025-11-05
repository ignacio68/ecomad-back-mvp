import { vi } from "vitest";

type Op = "select" | "insert" | "update" | "delete" | "rpc";
type Result = { data: any; error: any; status?: number; count?: number };

export function createSupabaseMock() {
	const responses = new Map<string, Result[]>(); // clave: `${table}:${op}` -> array de respuestas
	const callCounts = new Map<string, number>(); // contador de llamadas por clave
	const calls: Array<{
		table: string;
		op: Op | null;
		method?: string;
		args: Record<string, any>;
		filters: Array<[string, string, any] | [string, string, string, any]>;
	}> = [];

	const setResponse = (table: string, op: Op, result: Result) => {
		const key = `${table}:${op}`;
		if (!responses.has(key)) {
			responses.set(key, []);
			callCounts.set(key, 0);
		}
		responses.get(key)!.push(result);
	};

	const from = vi.fn((table: string) => {
		const state = {
			table,
			op: null as Op | null,
			args: {} as Record<string, any>,
			filters: [] as Array<[string, string, any] | [string, string, string, any]>,
		};

		const builder: any = {
			// operaciones
			select: vi.fn((cols: string = "*") => {
				// No cambiar la operación si ya es insert/update/delete
				if (!state.op) {
					state.op = "select";
				}
				state.args.select = cols;
				return builder;
			}),
			insert: vi.fn((values: any) => {
				state.op = "insert";
				state.args.values = values;
				return builder;
			}),
			update: vi.fn((patch: any) => {
				state.op = "update";
				state.args.patch = patch;
				return builder;
			}),
			delete: vi.fn(() => {
				state.op = "delete";
				return builder;
			}),

			// filtros (solo registran lo pedido)
			eq: vi.fn((k: string, v: any) => {
				state.filters.push([k, "eq", v]);
				return builder;
			}),
			neq: vi.fn((k: string, v: any) => {
				state.filters.push([k, "neq", v]);
				return builder;
			}),
			ilike: vi.fn((k: string, v: any) => {
				state.filters.push(["ilike", k, v]);
				return builder;
			}),
			gte: vi.fn((k: string, v: any) => {
				state.filters.push(["gte", k, v]);
				return builder;
			}),
			lte: vi.fn((k: string, v: any) => {
				state.filters.push(["lte", k, v]);
				return builder;
			}),
			in: vi.fn((k: string, vals: any[]) => {
				state.filters.push(["in", k, vals]);
				return builder;
			}),
			is: vi.fn((k: string, v: any) => {
				state.filters.push(["is", k, v]);
				return builder;
			}),
			not: vi.fn((k: string, op: string, v: any) => {
				state.filters.push([k, "not", op, v]);
				return builder;
			}),
			upsert: vi.fn((values: any, options?: any) => {
				state.op = "insert"; // upsert es una variante de insert
				state.args.values = values;
				state.args.options = options;
				return builder;
			}),
			order: vi.fn((k: string, opts?: any) => {
				state.args.order = [k, opts];
				return builder;
			}),
			limit: vi.fn((n: number) => {
				state.args.limit = n;
				return builder;
			}),
			range: vi.fn((a: number, b: number) => {
				state.args.range = `${a},${b}`;
				return builder;
			}),
			single: vi.fn(() => {
				state.args.single = true;
				return builder;
			}),
			maybeSingle: vi.fn(() => {
				state.args.maybeSingle = true;
				return builder;
			}),

			// thenable: resuelve al resultado inyectado por test
			// biome-ignore lint: noThenProperty: necesario para simular Supabase
			then: (onFulfilled: any, onRejected?: any) => {
				calls.push({ ...state });
				const key = `${state.table}:${state.op ?? "select"}`;

				// Obtener respuestas para esta clave
				const responseArray = responses.get(key) || [];
				const currentCount = callCounts.get(key) || 0;

				// Si hay respuestas programadas, usar la siguiente en orden
				if (responseArray.length > 0 && currentCount < responseArray.length) {
					const res = responseArray[currentCount];
					callCounts.set(key, currentCount + 1);
					return Promise.resolve(res).then(onFulfilled, onRejected);
				}

				// Si no hay respuestas programadas, devolver respuesta por defecto
				const defaultRes = { data: null, error: null };
				return Promise.resolve(defaultRes).then(onFulfilled, onRejected);
			},
			catch: (onRejected: any) => Promise.resolve({ data: null, error: null }).catch(onRejected),
			finally: (onFinally: any) => Promise.resolve().finally(onFinally),
		};

		return builder;
	});

	const rpc = vi.fn(async (fnName: string, params?: any) => {
		// Registrar la llamada
		calls.push({
			table: "rpc",
			op: "rpc" as Op,
			method: "rpc",
			args: { function: fnName, params },
			filters: [],
		});

		// Buscar respuesta mockeada para este RPC
		const key = `rpc:${fnName}`;
		const responseArray = responses.get(key) || [];
		const currentCount = callCounts.get(key) || 0;

		// Si hay respuestas programadas, usar la siguiente en orden
		if (responseArray.length > 0 && currentCount < responseArray.length) {
			const res = responseArray[currentCount];
			callCounts.set(key, currentCount + 1);
			return res;
		}

		// Respuesta por defecto
		return { data: null, error: null };
	});

	const auth = {
		getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
	};

	const client = {
		from,
		rpc,
		auth,
		// helpers para los tests
		__setResponse: setResponse,
		__getCalls: () => calls,
		__getResponses: () => responses,
		__getCallCounts: () => callCounts,
		__reset: () => {
			responses.clear();
			callCounts.clear();
			calls.length = 0;
			from.mockClear();
			rpc.mockClear();
			auth.getUser.mockClear();
		},
	};

	return client;
}
