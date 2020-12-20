const express = require('express');

const multer = require('multer');

const port = process.env.PORT || 3344;

const app = express();

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage })

// const upload = multer({
//     dest: './uploads/'
// })

app.post('/upload',upload.single('file') ,(req,res)=>{
    res.json({"status": "success",file: req.file})
})

app.listen(port, ()=>console.log("running on 3344 port"));