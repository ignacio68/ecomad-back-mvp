import { Readable } from "node:stream";
import { parse } from "csv-parse";
import type { ZodSchema } from "zod";

type ValidationResult<T> = {
	valid: T[];
	invalid: any[];
};

export const validateCSV = async <T>(
	csvText: string,
	schema: ZodSchema<any, any, T>,
	options: {
		delimiter?: string;
		skipEmptyLines?: boolean;
	} = {},
): Promise<ValidationResult<T>> => {
	const valid: T[] = [];
	const invalid: any[] = [];

	const parser = parse(csvText, {
		delimiter: options.delimiter ?? ";",
		columns: true,
		skip_empty_lines: options.skipEmptyLines ?? true,
	});

	for await (const row of Readable.from(parser)) {
		const parsed = schema.safeParse(row);

		if (parsed.success) {
			valid.push(parsed.data);
		} else {
			invalid.push(parsed.error.format());
		}
	}

	return { valid, invalid };
};
