import { lstat, readdir, readFile, writeFile } from "fs";
import { promisify } from "util";

export const lstatPromise = promisify(lstat);
export const readDirPromise = promisify(readdir);
export const readFilePromise = promisify(readFile);
export const writeFilePromise = promisify(writeFile);
