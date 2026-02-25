export function filterObj<T extends Record<string, any>>(
  obj: T,
  ...allowedFields: (keyof T)[]
): Partial<T> {
  return allowedFields.reduce((acc, field) => {
    if (field in obj) {
      acc[field] = obj[field];
    }
    return acc;
  }, {} as Partial<T>);
}
