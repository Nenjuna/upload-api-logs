const StreamZip = require("node-stream-zip");

const zip = new StreamZip({
  file: "./uploads/Feb_1_2021_15_58_43_sd_11135_logs.zip.gz",
  storeEntries: true,
  skipEntryNameValidation: true,
});

zip.on("ready", () => {
  console.log("Entries read: " + zip.entriesCount);
  for (const entry of Object.values(zip.entries())) {
    const desc = entry.isDirectory ? "directory" : `${entry.size} bytes`;
    console.log(`Entry ${entry.name}: ${desc}`);
  }
  // Do not forget to close the file once you're done
  zip.close();
});
