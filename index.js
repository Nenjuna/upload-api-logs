/**
 * Function was broken down in such a way that it can be imported to other files and can be reused
 * Author: Not Found :P
 * Git/Nenjuna
 */

//Importing required modules here

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const handler = require("express-async-handler");

const readBuf = require("./readBuffer"); //To load files without extracting or from the ZIP (NOT GUNZIP)
const readLogFiles = require("./readExtractedFiles"); //To read files which were extracted already and allows reading via Byte array

/**
 * Configuring the port and instantiating required modules and files
 * Custom files and functinos are already loaded above
 */
const PORT = process.env.PORT || 3344;

const app = express();

const tracesJson = require("./traces.json");

/**
 * Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum efficiency.
 * NOTE: Multer will not process any form which is not multipart (multipart/form-data).
 * In the below function we are taking in the req object and using a callback we are writing the file to the storage and returning
 * the list of files with their path informaiton.
 */

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ticket = req.body.ticket;
    const dir = `./uploads/${ticket}`;
    fs.exists(dir, (exist) => {
      if (!exist) {
        return fs.mkdir(dir, (error) => cb(error, dir));
      }
      return cb(null, dir);
    });
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage }); // Multer storage class ends

/**
 * API end points for communication from the frontend are defined below
 * It is where the actual functions are called from other files/modules
 * The fucntion execution happens in real time SYNCHRONOUSLY. Need to load only necessary files as overloading may cause the server to crash
 */

//API endpoint for single file upload. Used to upload Support files

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ status: "success", file: req.file });
});

//API endpoint for uploading multiple files. Used to upload extracted files and folder

app.post("/multiple", upload.array("files"), (req, res) => {
  try {
    res.json({ status: "success", files: req.files });
  } catch (e) {
    console.log(e);
  }
});

// API to initiate reading mechanism
app.get(
  "/read/:ticket",
  handler(async (req, res) => {
    const ticket = req.params.ticket;
    // const issuetype = req.params.issueType;

    // console.log(issuetype);
    // console.log(ticket);
    try {
      let results = await readAllFiles(ticket, "mailfetching");
      console.log(results);
      res.send({ status: "Success", results: results });
    } catch (e) {
      res.json({ error: e });
    }
  })
);

app.get("/readbuffer", (req, res) => {
  readBuf()
    .then((results) => {
      res.json({ success: results });
    })
    .catch((err) => {
      res.json({ oops: "some error" });
    });
});

app.get("/readLogFromExtracted", async (req, res) => {
  let answer = await readLogFiles("hello", "there");
  res.json({ success: answer });
});

// Starting the express server
app.listen(PORT, () => console.log(`Express Running on port ${PORT}`));
