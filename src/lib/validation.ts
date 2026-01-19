export type ValidationErrors<T extends Record<string, any>> = Partial<Record<keyof T, string>>;

export function validateRequired<T extends Record<string, any>>(values: T, fields: (keyof T)[], message = "Campo obrigatório"): ValidationErrors<T> {
  const errors: ValidationErrors<T> = {};
  for (const key of fields) {
    const v = values[key];
    if (v === undefined || v === null) {
      errors[key] = message;
      continue;
    }
    if (typeof v === "string" && v.trim() === "") {
      errors[key] = message;
    }
  }
  return errors;
}