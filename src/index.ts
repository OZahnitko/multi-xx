// TODO: Give this one a good README.

import { existsSync, lstatSync, mkdirSync, readdirSync, unlinkSync } from "fs";

import { resolve } from "path";

import { readFilePromise, writeFilePromise } from "./utils";

const IGNORE_LIST = [".git", ".terraform", "build", "multi-xx", "node_modules"];

const FILES = <string[]>[];

const throughDir = (parentDirectory: string) => {
  readdirSync(parentDirectory).forEach((dir) => {
    if (IGNORE_LIST.includes(dir)) return;
    const absPath = resolve(parentDirectory, dir);
    if (lstatSync(absPath).isDirectory()) {
      return throughDir(absPath);
    } else {
      return FILES.push(absPath);
    }
  });
};

throughDir(resolve(__dirname, "../.."));

const readmeFiles = FILES.filter((file) => file.match(/.*README.*\.md/g));

const writeFiles = async (files: string[]) => {
  const filesData = await Promise.all(
    files.map(async (file) => ({
      content: (await readFilePromise(file)).toString(),
      filePath: file,
      name: file.split("/").slice(4).join("."),
    }))
  );

  // Create the "docs" directory if one does not exist.
  if (!existsSync(resolve(__dirname, "../docs")))
    mkdirSync(resolve(__dirname, "../docs"));

  // Remove all old files from the "docs" directory.
  readdirSync(resolve(__dirname, "../docs")).forEach((file) => {
    unlinkSync(resolve(__dirname, "../docs", file));
  });

  // Write all the README.md files.
  filesData.forEach(async (file) => {
    await writeFilePromise(
      resolve(__dirname, "../docs", file.name),
      file.content
    );
  });
};

writeFiles(readmeFiles);
