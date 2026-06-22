export const toId = (name: string) => {
  return `spec-group-${name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")}`;
};
