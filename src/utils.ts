import { readFile, writeFile } from "fs";
import { promisify } from "util";

export const readFilePromise = promisify(readFile);
export const writeFilePromise = promisify(writeFile);
