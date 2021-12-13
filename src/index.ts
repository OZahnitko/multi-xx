import { existsSync, lstatSync, mkdirSync, readdirSync, unlinkSync } from "fs";

import { resolve } from "path";

import {
  lstatPromise,
  readDirPromise,
  readFilePromise,
  writeFilePromise,
} from "./utils";

// const readDirs = async () => {
//   const observedRepos = (
//     await readDirPromise(resolve(__dirname, "../.."))
//   ).filter(
//     (dir) => resolve(__dirname, "../..", dir) !== resolve(__dirname, "..")
//   );
//   console.log(observedRepos);
// };

// readDirs();

// (async () => {
//   const content = (await readDirPromise(resolve(__dirname, "../../multi-24")))
//     .filter((dir) => !IGNORE_LIST.includes(dir))
//     .map(async (dir) => {
//       return (
//         await lstatPromise(resolve(__dirname, "../../multi-24", dir))
//       ).isDirectory();
//     });
//   console.log(content);
// })();

// (async () => {
//   const f = await Promise.all(
//     (
//       await readDirPromise(resolve(__dirname, "../..", "multi-24"))
//     ).filter((dir) => !IGNORE_LIST.includes(dir))
//   );
//   f.forEach(async (f) => {
//     const isDir = (
//       await lstatPromise(resolve(__dirname, "../../multi-24", f))
//     ).isDirectory();
//   });
// })();

// const files = <string[]>[];

// const throughDir = async (parentDir: string) => {
//   const dirContent = (await readDirPromise(parentDir))
//     .filter((dir) => !IGNORE_LIST.includes(dir))
//     .filter(
//       (dir) => resolve(parentDir, dir) !== resolve(parentDir, "multi-xx")
//     );

//   dirContent.forEach(async (dir) => {
//     const absPath = resolve(parentDir, dir);
//     if (!(await lstatPromise(absPath)).isDirectory()) {
//       return files.push(absPath);
//     } else {
//       return throughDir(absPath);
//     }
//   });
// };

// (async () => {
//   const s = await throughDir(resolve(__dirname, "../.."));
//   console.log(s);
// })();

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
    readmeFiles.map(async (file) => ({
      content: (await readFilePromise(file)).toString(),
      filePath: file,
      name: file.split("/").slice(4).join("-"),
    }))
  );

  // Create the "docs" directory if one does not exist.
  if (!existsSync(resolve(__dirname, "../docs")))
    mkdirSync(resolve(__dirname, "../docs"));

  // Remove all old files from the "docs" directory.
  readdirSync(resolve(__dirname, "../docs")).forEach((file) => {
    console.log(resolve(__dirname, "../docs", file));
    // unlinkSync(resolve(__dirname))
  });

  // filesData.forEach(async (file) => {
  //   await writeFilePromise(
  //     resolve(__dirname, "../docs", file.name),
  //     file.content
  //   );
  // });
};

writeFiles(readmeFiles);
