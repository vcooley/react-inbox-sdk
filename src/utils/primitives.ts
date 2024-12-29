/**
 * Checks if a value is a primitive type (string, number, boolean, null, undefined)
 */
export function isPrimitive(value: unknown): boolean {
  return (
    value === null ||
    ["string", "number", "boolean", "undefined"].includes(typeof value)
  );
}

/**
 * Compares two objects by checking if their primitive values are equal.
 * Non-primitive values are considered equal.
 */
export function arePrimitiveValuesEqual(a: object, b: object): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => {
    const aValue = a[key as keyof typeof a];
    const bValue = b[key as keyof typeof b];

    if (!isPrimitive(aValue) || !isPrimitive(bValue)) return true;
    return aValue === bValue;
  });
}
