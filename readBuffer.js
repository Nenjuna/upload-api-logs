/**
 * Function was broken down in such a way that it can be imported to other files and can be reused
 * Author: Not Found :P
 * Git/Nenjuna
 */

/**
 * Importing required modules here
 *
 * Node Stream Zip package is used. Versatile package to read the zip files in memory.
 *  Allowing us to create a entry point where we can specify which file we want to stream
 */

const StreamZip = require("node-stream-zip");
var text;
var resu = [];

async function readBuffers() {
  var sp;
  let res = [];
  let result = [];
  return new Promise((resolve, reject) => {
    const zip = new StreamZip({
      file: "./uploads/Feb_1_2021_15_58_43_sd_11135_logs.zip",
      storeEntries: true,
      skipEntryNameValidation: true,
    });

    // zip.on("")
    zip.on("error", (err) => {
      console.log(err);
      reject(err);
    });

    zip.on("ready", () => {
      console.log("Entries read: " + zip.entriesCount);
      for (const entry of Object.values(zip.entries())) {
        const desc = entry.isDirectory ? "directory" : `${entry.size} bytes`;
        // console.log(`Entry ${entry.name}: ${desc}`);
      }

      const data = zip.entryDataSync(
        "D:\\ManageEngine\\ServiceDesk\\logs\\serverout1.txt"
      );
      text = Buffer.from(data).toString();

      sp = text.replace(/\n/g, "").split("\r");

      resu = [];

      resu = resu.concat(sp);
      zip.close();
      result = resu;
      let slide = 0;

      /**
       * Finding whether the line starts with either a [ or as [SYSERR], to have it appended to the previous element.
       * In most of the cases, it was seen the stack trace was printed in this way in ServiceDesk Plus's logger
       *
       */

      result.forEach((i) => {
        if (!i.startsWith("[") || i.includes("[SYSERR]")) {
          res[slide - 1] = res[slide - 1] + i;
        } else {
          res[slide] = i;
          slide++;
        }
      });

      //Returning after completion

      resolve(res);
    });
  });
}

module.exports = readBuffers;
