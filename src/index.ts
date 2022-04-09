type Key = keyof NodeJS.ProcessEnv;

// ============================================================================

/**
 * Error class related to env operations
 */
export class EnvError extends Error {
	constructor(readonly key: Key, readonly reason: string) {
		super(`[${key}]: ${reason}`);
	}
}

// ============================================================================

/**
 * throws an EnvError
 *
 * @param {string} key env key
 * @param {string} reason reason
 */
function error(key: Key, reason: string): never {
	throw new EnvError(key, reason);
}

// ============================================================================

/**
 * get enviornment variable value
 *
 * @param {string} key env key
 * @returns {string} enviornment value
 * @throws {EnvError} when #key is missing
 */
export function env(key: Key): string | never {
	return process.env[key] ?? error(key, "env variable not found");
}

/**
 * get enviornment variable value as int
 *
 * @param {string} key env key
 * @returns {number} environment value as {number} (int)
 * @throws {EnvError} when #key is missing or is not a {number}
 */
env.int = function (key: Key): number | never {
	const e = Number(env(key));

	return Number.isInteger(e) ? e : error(key, "not an int");
};

/**
 *
 * @param key
 * @returns {number} enviornment value as {number}
 * @throws {EnvError} when #key is missing
 */
env.number = function (key: Key): number {
	const e = Number(env(key));

	return Number.isNaN(e) ? error(key, "not a number") : e;
};

/**
 * get environment variable as enum
 *
 * @param {string} key env key
 * @param {Array} alloweds allowed values
 * @throws {EnvError} when key is missing or is not part of #alloweds
 */
env.enum = function <T extends string>(
	key: Key,
	alloweds: Array<T> | Readonly<Array<T>>
): T | never {
	const e = env(key);

	return alloweds.includes(e as T)
		? (e as T)
		: error(key, `must be one of [${alloweds.join(", ")}].`);
};

/**
 *
 * @param {string} key env key
 * @throws {EnvError} when key is missing or is not a booleanish string (0, 1, true, false)
 */
env.bool = function (key: Key): boolean | never {
	const e = env.enum(key, [
		"0",
		"1",
		"false",
		"true",
		"False",
		"True",
		"FALSE",
		"TRUE",
	]);

	return ["1", "true", "True", "TRUE"].includes(e);
};

env.array = function (
	key: Key,
	separator: string = ","
): Array<string> | never {
	return env(key).split(separator);
};

/**
 *
 * @param key
 * @param handler
 * @returns
 */
env.transform = function <T>(
	key: Key,
	handler: (value: string) => T
): T | never {
	return handler(env(key));
};

env.transformArray = function <T>(
	key: Key,
	handler: (value: string) => T,
	separator: string = ","
): Array<T> | never {
	return env.array(key, separator).map(handler);
};

// ============================================================================

export function opt(key: Key): string | undefined {
	return process.env[key];
}

opt.int = function (key: Key): number | undefined {
	const e = opt(key);

	return typeof e !== "undefined" && Number.isInteger(e)
		? Number(e)
		: undefined;
};

opt.number = function (key: Key) {
	const e = opt(key);

	return typeof e !== "undefined" ? Number(e) : undefined;
};

opt.enum = function <T extends string>(
	key: Key,
	alloweds: Array<T> | Readonly<Array<T>>
): T | undefined {
	const e = opt(key);

	return typeof e !== "undefined" && alloweds.includes(e as T)
		? (e as T)
		: undefined;
};

opt.bool = function (key: Key) {
	const e = opt.enum(key, [
		"0",
		"1",
		"false",
		"true",
		"False",
		"True",
		"FALSE",
		"TRUE",
	]);

	return typeof e === "undefined"
		? undefined
		: ["1", "true", "True", "TRUE"].includes(e)
		? true
		: false;
};

opt.array = function (key: Key, separator: string = ",") {
	const e = opt(key);

	return typeof e === "undefined" ? undefined : e.split(separator);
};

opt.transform = function <T>(
	key: Key,
	handler: (value: string) => T
): T | undefined {
	const e = opt(key);

	return typeof e === "undefined" ? undefined : handler(e);
};

opt.transformArray = function <T>(
	key: Key,
	separator: string = ",",
	handler: (value: string) => T
): Array<T> | undefined {
	const e = opt.array(key, separator);

	return typeof e === "undefined" ? undefined : e.map(handler);
};
