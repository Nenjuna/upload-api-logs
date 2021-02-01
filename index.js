const express = require("express");

const multer = require("multer");

const fs = require("fs");

const tracesJson = require("./traces.json");

const fsp = require("fs").promises;

const lineByLine = require("n-readlines");

const port = process.env.PORT || 3344;

const app = express();

const handler = require("express-async-handler");

var asyncres = [];
var FinalResults = [];
var lines = [];

console.log(tracesJson["mailfetching"]);

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

const upload = multer({ storage });

async function nreadline(filePath) {
  let logs = [];
  let res = [];
  try {
    let rl = new lineByLine(filePath);
    let line;
    let result = [];
    while ((line = rl.next())) {
      logs.push(line.toString("utf8"));
    }
    result = logs;
    let slide = 0;
    result.forEach((i) => {
      if (!i.startsWith("[") || i.includes("[SYSERR]")) {
        res[slide - 1] = res[slide - 1] + i;
      } else {
        res[slide] = i;
        slide++;
      }
    });
  } catch (err) {
    console.log(err);
  }
  return res.reverse();
}

//Finding the cause inside the filtered log traces
function causedBy(FLT) {
  let filteredLogTracess = FLT;

  const causedBy = filteredLogTracess.filter((trace) => {
    let causedNotFound = true;
    // if (trace.includes("Caused by:")) {
    while (causedNotFound && trace.includes("Caused by:")) {
      var trs = trace.split("\r");
      for (let i = 0; i < trs.length; i++) {
        let tr = trs[i];
        let elem = [];
        if (tr.includes("Caused by:")) {
          elem.push(trs[0]);
          elem.push(trs[1]);
          elem.push(tr);
          elem = elem.concat(trs[i + 1]);
          elem = elem.concat(trs[i + 2]);
          trav.push(elem.join().replace(`,`, ""));
          causedNotFound = false;
          break;
        }
      }
    }
  });
  console.log(causedBy);
  return causedBy;
}

function linearSearchLogs(obj, searchQuery) {
  let filteredLogTracess = obj;
  let sq = searchQuery;
  const linearResults = filteredLogTracess.filter((cause) =>
    cause.includes(sq)
  );

  return linearResults;
}

async function readAllFiles(uid, issueType) {
  let ticket = uid;

  let it = issueType;

  let traverseFile = "./uploads/" + ticket;

  async function trFolder() {
    try {
      return fsp.readdir(traverseFile);
    } catch (error) {
      console.error("Error occured while scanning the file", error);
    }
  }

  let logfiles = await trFolder();

  let logFileArray = logfiles;

  let readvalue = [];
  await logFileArray.forEach(async (log) => {
    let logPath = "./uploads/" + ticket + "/" + log;
    if (logPath.includes("serverout")) {
      asyncres = await nreadline(logPath);
      readvalue = readvalue.concat(asyncres);
    }
  });

  //Final results where the consolidated array of traces are stored
  FinalResults = FinalResults.concat(readvalue);

  //   console.log("inside readfile");

  //  const classCaused2 = FinalResults.filter(cause => cause.includes('com.adventnet.authentication.callback.LoginCallbackHandler'))

  function loopTraces(it, consolidatedLogs) {
    let finalLogs = consolidatedLogs;
    // console.log("inside loop traces");
    // let it = issueType;

    let finalres = [];

    const exList = tracesJson[it];

    exList.forEach((ex) => {
      //   console.log(ex.includes("Caused by:"));
      if (!ex.includes("Caused by:") && finalres.length == 0) {
        finalres = finalres.concat(linearSearchLogs(finalLogs, ex));
        console.log(finalres.length);
      } else if (finalres.length > 0 && !ex.includes("Caused by:")) {
        finalres = linearSearchLogs(finalres, ex);
      } else {
        finalres = causedBy(finalres);
      }
    });

    return finalres;
  }

  var res = loopTraces("mailfetching", FinalResults);

  return res.slice(0, 5);
}

// Express APIs defined below

//API for a single file upload button
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ status: "success", file: req.file });
});

//API for multiple form upload
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

// Starting the express server
app.listen(port, () => console.log("running on 3344 port"));
