/** Deep clone/freeze for the JSON-like authored-content boundary. */
export function immutableCopy<T>(value: T): Readonly<T> {
  const copy = structuredClone(value);
  const freeze = (item: unknown): void => { if (item && typeof item === "object" && !Object.isFrozen(item)) { Object.freeze(item); for (const child of Object.values(item as Record<string, unknown>)) freeze(child); } };
  freeze(copy); return copy as Readonly<T>;
}
