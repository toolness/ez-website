/**
 * Ensure that the given value never occurs. This is type-checked by
 * TypeScript, but we also throw a helpful error if the real-world
 * data doesn't match the expectations of our type system.
 */
export function assertUnreachable(never: never, message: string): never {
  throw new Error(
    `Assertion failure, value should never have existed (${message}): ${JSON.stringify(
      never
    )}`
  );
}
