const express = require('express');

const multer = require('multer');

const fs = require('fs');

const fsp = require('fs').promises

const lineByLine = require('n-readlines');

const port = process.env.PORT || 3344;

const app = express();

const handler = require('express-async-handler')

var asyncres = [];
var FinalResults = [];
var lines = []


let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const ticket = req.body.ticket
        const dir = `./uploads/${ticket}`
        fs.exists(dir, exist => {
        if (!exist) {
          return fs.mkdir(dir, error => cb(error, dir))
        }
        return cb(null, dir)
        })
      },    
    
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage });


async function nreadline(filePath){
let logs = [];
let res = []
try{
    let rl = new lineByLine(filePath);
    let line;
    let result = []
    while(line=rl.next()){
        logs.push(line.toString('utf8'));
    }
    result = logs
    let slide = 0;
    result.forEach(i => {
        if (!i.startsWith("[") || i.includes('[SYSERR]')) {
        res[slide - 1] = res[slide - 1] + i;
        } else {
        res[slide] = i;
        slide++;
        }
    });
    }catch(err){
    console.log(err)
    }   
    return res.reverse();
}

 async function readAllFiles(uid){

    let ticket = uid

    let traverseFile = './uploads/' + ticket

    async function trFolder(){
        try{
            return fsp.readdir(traverseFile)

        }catch(error){
            console.error('Error occured while scanning the file', error)
        }
    }

     let logfiles = await trFolder();
    // let a = ['./uploads/ghg/serverout0.txt','./uploads/ghg/serverout1.txt']
    let logFileArray = logfiles
    // console.log(b)
    let readvalue = []
    await logFileArray.forEach(async log=>{
        let logPath = './uploads/' + ticket + '/' + log;
        if (logPath.includes('serverout')) {
            // console.log(logPath)
            asyncres = await nreadline(logPath);
            readvalue = readvalue.concat(asyncres);
        }
        
    })
     FinalResults = FinalResults.concat(readvalue);
     
     const mailproblems = FinalResults.filter(trace => trace.includes('com.adventnet.servicedesk.common.MailUtilities'))
     
     const ex = mailproblems.filter(mailproblem=> mailproblem.includes('Exception'))
    
    return ex;

}



// Express APIs defined below
app.post('/upload',upload.single('file') ,(req,res)=>{
    res.json({"status": "success",file: req.file})
});


//API for multiple form upload
app.post('/multiple',upload.array('files') ,(req,res)=>{
    try{
        res.json({"status": "success",files: req.files})
    }
    catch(e){
        console.log(e)
    }
});

app.get('/reader',async (req,res)=>{

    console.log(req.body)
    try{
        let results = await readAllFiles()
        // console.log(results)
        res.json({"status": "failure","err": results})
    }catch(e){
        res.json({"error": e})
    }

})

app.get('/read/:ticket', handler(async(req, res)=>{
    // let results = await readAllFiles();
    
    const ticket = req.params.ticket;
    try{
        let results = await readAllFiles(ticket)
        // console.log(results)
        res.json({"status": "failure","results": results})
    }catch(e){
        res.json({"error": e})
    }
   
    // res.json({"status": "success","results": results})
    // res.json({"status": "success","results": folderlist})
}))



app.listen(port, ()=>console.log("running on 3344 port"));