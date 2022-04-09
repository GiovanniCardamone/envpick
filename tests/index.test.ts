import { env, opt, EnvError } from "../src/index";

describe("env", () => {
	test("should return env value when present", () => {
		process.env.envTestPresent = "test";

		expect(env("envTestPresent")).toBe("test");
	});

	test("should raise EnvError when value missing", () => {
		expect(() => env("envTestMissing")).toThrow(EnvError);
	});

	test(".int should return an integer", () => {
		process.env.envIntValid = "42";

		expect(env.int("envIntValid")).toBe(42);
	});

	test(".int should raise EnvError when value missing", () => {
		expect(() => env.int("envIntMissing")).toThrow(EnvError);
	});

	test(".int should raise EnvError when value is not an int", () => {
		process.env.envIntNotInt = "45.7";

		expect(() => env.int("envIntNotInt")).toThrow(EnvError);
	});

	test(".int should raise EnvError when value is not an number", () => {
		process.env.envIntNotNumber = "hello world";

		expect(() => env.int("envIntNotNumber")).toThrow(EnvError);
	});

	test(".number should be a number", () => {
		process.env.envNumberValid = "123.45";

		expect(env.number("envNumberValid")).toBe(123.45);
	});

	test(".number should raise EnvError when value missing", () => {
		expect(() => env.number("envNumberMissing")).toThrow(EnvError);
	});

	test(".number raise EnvError when value is not an number", () => {
		process.env.envNumberNotNumber = "hello world";

		expect(() => env.number("envNumberNotNumber")).toThrow(EnvError);
	});

	test(".enum should be one of expected values", () => {
		type MyEnum = "one" | "two" | "three";
		const myEnum: readonly MyEnum[] = ["one", "two", "three"];

		process.env.envNumberValid = myEnum[2];

		expect(env.enum<MyEnum>("envNumberValid", myEnum)).toBe(myEnum[2]);
	});

	test(".enum should raise EnvError when is none of expected values", () => {
		type MyEnum = "one" | "two" | "three";
		const myEnum: readonly MyEnum[] = ["one", "two", "three"];

		process.env.envEnumInvalid = "four";

		expect(() => env.enum<MyEnum>("envEnumInvalid", myEnum)).toThrow(EnvError);
	});

	test(".enum should raise EnvError when env missing", () => {
		type MyEnum = "one" | "two" | "three";
		const myEnum: readonly MyEnum[] = ["one", "two", "three"];

		expect(() => env.enum<MyEnum>("envEnumMissing", myEnum)).toThrow(EnvError);
	});

	test(".bool should be boolean when valid", () => {
		process.env.envBooolean_0 = "0";
		process.env.envBooolean_1 = "1";
		process.env.envBooolean_false = "false";
		process.env.envBooolean_true = "true";
		process.env.envBooolean_False = "False";
		process.env.envBooolean_True = "True";
		process.env.envBooolean_FALSE = "FALSE";
		process.env.envBooolean_TRUE = "TRUE";

		expect(env.bool("envBooolean_0")).toBe(false);
		expect(env.bool("envBooolean_1")).toBe(true);
		expect(env.bool("envBooolean_false")).toBe(false);
		expect(env.bool("envBooolean_true")).toBe(true);
		expect(env.bool("envBooolean_False")).toBe(false);
		expect(env.bool("envBooolean_True")).toBe(true);
		expect(env.bool("envBooolean_FALSE")).toBe(false);
		expect(env.bool("envBooolean_TRUE")).toBe(true);
	});

	test(".bool should raise EnvError when missing", () => {
		expect(() => env.bool("envBoooleanMissing")).toThrow(EnvError);
	});

	test(".bool should raise EnvError when not a valid value", () => {
		process.env.envBoooleanInvalid_string = "hello";
		process.env.envBoooleanInvalid_number = "23";

		expect(() => env.bool("envBoooleanInvalid_string")).toThrow(EnvError);
		expect(() => env.bool("envBoooleanInvalid_number")).toThrow(EnvError);
	});

	test(".array should be array values", () => {
		process.env.envArray = "one,two,three";
		process.env.envArrayMySeparator = "one:two:three";

		expect(env.array("envArray")).toEqual(["one", "two", "three"]);
		expect(env.array("envArrayMySeparator", ":")).toEqual([
			"one",
			"two",
			"three",
		]);
	});

	test(".array should return array with one value when noSeparator", () => {
		process.env.envArrayNoSeparator = "one";
		expect(env.array("envArrayNoSeparator")).toEqual(["one"]);
	});

	test(".array should throw EnvError when missing", () => {
		expect(() => env.array("envArrayMissing")).toThrow(EnvError);
	});

	test(".transform should transform value", () => {
		process.env.envTransform = "test";

		expect(
			env.transform("envTransform", (v) => (v === "test" ? true : false))
		).toBe(true);
	});

	test(".transform should raise EnvError when env missing", () => {
		expect(() =>
			env.transform("envTransformMissing", (v) => (v === "test" ? true : false))
		).toThrow(EnvError);
	});

	test(".transformArray should return transformed values", () => {
		process.env.envTransformArray = "1,2,3";
		process.env.envTransformArrayMySeparator = "1:2:3";

		expect(
			env.transformArray("envTransformArray", (v) => parseInt(v, 10) + 1)
		).toEqual([2, 3, 4]);

		expect(
			env.transformArray(
				"envTransformArrayMySeparator",
				(v) => parseInt(v, 10) + 1,
				":"
			)
		).toEqual([2, 3, 4]);
	});

	test(".transformArray should raise EnvError when env missing", () => {
		process.env.envTransformArray = "1,2,3";
		process.env.envTransformArrayMySeparator = "1:2:3";

		expect(() =>
			env.transformArray("envTransformArrayMissing", (v) => parseInt(v, 10) + 1)
		).toThrow(EnvError);
	});
});
