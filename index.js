const { lstat, readdir, readFile, writeFile } = require("fs");
const { resolve } = require("path");
const { promisify } = require("util");

const readdirPromise = promisify(readdir);
const readFilePromise = promisify(readFile);
const writeFilePromise = promisify(writeFile);

const readDirs = async () => {
  const observedRepos = (await readdirPromise(resolve(__dirname, ".."))).filter(
    (dir) => resolve(__dirname, "..", dir) !== __dirname
  );

  const readMes = await Promise.all(
    observedRepos.map(async (repo) => {
      const repoRootFiles = await readdirPromise(
        resolve(__dirname, "..", repo)
      );
      const readmeFiles = repoRootFiles.filter((file) => file === "README.md");

      return {
        repoName: repo,
        readme: readmeFiles.map((file) => resolve(__dirname, "..", repo, file)),
      };
    })
  );

  const final = await Promise.all(
    readMes.map(async (readme) => {
      const inner = await Promise.all(
        readme.readme.map(async (path) => {
          const fileContent = await readFilePromise(path);
          return fileContent.toString();
        })
      );

      return { repoName: readme.repoName, readme: inner };
    })
  );

  final.forEach(async (file) => {
    file.readme.forEach(async (con) => {
      await writeFilePromise(
        resolve(__dirname, `${file.repoName}-README.md`),
        con
      );
    });
  });
};

readDirs();
// TODO: Name of the README files.
// TODO: Regex search for all files that contain README in the name.
// TODO: Make this typescript.
// TODO: Give this one a good README.
// TODO: Give this repo some kind of coherent folder structure.
// TODO: Recursively scan all of the directories.
