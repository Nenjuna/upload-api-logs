/**
 * Function was broken down in such a way that it can be imported to other files and can be reused
 * Author: Not Found :P
 * Git/Nenjuna
 */

//Importing required modules to read file directory and to read files
const lineByLine = require("n-readlines");
const fsp = require("fs").promises;

var asyncres = [];
var FinalResults = [];

/**
 * Function nreadline is the main one which is going to read the file.
 * This function first convers the file into buffer and then reads it in the memory
 * Need to pass the exact path of the file from the local directory to the module and it can be iterated afterwards
 * NPM module name n-readlines
 */

async function nreadline(filePath) {
  let logs = [];
  let res = [];

  // Creating a promise to make use of async await functionality to wait for the files to resolve properly
  try {
    //Reading the actual log file happens here and is loaded in lineByLine

    let rl = new lineByLine(filePath); //Initializing LineByLine Package when the files are happend to be extracted and uploaded into the system
    let line;
    let result = [];

    //Looping through the files
    while ((line = rl.next())) {
      logs.push(line.toString("utf8"));
    }

    /**
     * Storing the results and looping through the results and removing any broken line breaks.
     * In other words catching the complete stack trace
     */

    result = logs;
    let slide = 0;
    result.forEach((i) => {
      //Finding whether the line starts with either a [ or as [SYSERR], to have it appended to the previous element.
      //In most of the cases, it was seen the stack trace was printed in this way in ServiceDesk Plus's logger
      if (!i.startsWith("[") || i.includes("[SYSERR]")) {
        res[slide - 1] = res[slide - 1] + i;
      } else {
        res[slide] = i;
        slide++;
      }
    });
  } catch (err) {
    // catching any error or exception that may occur while reading the file
    console.log(err);
  }

  //After the whole process is completed, the results are returned.
  return res.reverse();
}

//Finding the cause inside the filtered log traces

function causedBy(FLT) {
  let filteredLogTracess = FLT;
  return new Promise((resolve, reject) => {
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
            resolve(causedBy);
            // break;
          }
        }
      }
      if (!causedNotFound) reject("Oops, the cause is not found");
    });
    //   console.log(causedBy);
  });
}

function linearSearchLogs(obj, searchQuery) {
  let filteredLogTracess = obj;
  let sq = searchQuery;
  const linearResults = filteredLogTracess.filter((cause) =>
    cause.includes(sq)
  );

  return linearResults;
}

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

async function lazyFiles(logarray) {
  let readvalue = [];
  let logFileArray = logarray;
  await logFileArray.forEach(async (log) => {
    let logPath = "./some/" + log;
    if (logPath.includes("serverout")) {
      asyncres = await nreadline(logPath);
      readvalue = readvalue.concat(asyncres);
    }
  });
  FinalResults = FinalResults.concat(readvalue);

  return FinalResults;
}

async function lazyloadFiles(logpaths) {
  console.log(logpaths);
  let traverseFile = "./some/";
  async function trFolder() {
    try {
      return fsp.readdir(traverseFile);
    } catch (error) {
      console.error("Error occured while scanning the file", error);
    }
  }
  let logfiles = await trFolder();

  let logFileArray = logfiles;

  let FinalRes = await lazyFiles(logFileArray);

  //Final results where the consolidated array of traces are stored
  //   FinalResults = FinalResults.concat(readvalue);
  return FinalRes;
}

async function readAllFiles(uid, issueType) {
  let ticket = uid;

  let it = issueType;
  //   let traverseFile = "./uploads/" + ticket;

  //   console.log("inside readfile");
  //   let chunk = [];
  //   lazyloadFiles("some").then((res) => {
  //     chunk = chunk.concat(res);
  //   });

  let itchunk = await lazyloadFiles("some");
  console.log(itchunk.length);

  const classCaused2 = itchunk.filter((cause) =>
    cause.includes("com.adventnet.authentication.callback.LoginCallbackHandler")
  );

  //   var res = loopTraces("mailfetching", FinalResults);
  var res = classCaused2;
  //   console.log(chunks.length);
  // return res.slice(0, 5);
  return res;
}

module.exports = readAllFiles;
