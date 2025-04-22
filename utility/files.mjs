import { resolve } from "node:path";
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
const [folder] = process.argv.slice(2);

if (!folder) {
  throw new Error("No folder provided.");
}

export const readFile = (id) => {
  const file = resolve(folder, id);
  return readFileSync(file, "utf-8");
};
export const writeFile = (id, content) => {
  const file = resolve(folder, id);
  return writeFileSync(file, content, {
    encoding: "utf-8",
  });
};
export const deleteFile = (id) => {
  const file = resolve(folder, id);
  return unlinkSync(file);
};
export const listFilesIds = () => {
  return readdirSync(folder)
    .map((file) => file.replace(folder, ""))
    .filter((file) => !file.startsWith("."));
};
