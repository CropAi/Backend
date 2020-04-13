const express = require("express");
const bodyParser=require("body-parser");
const formidable = require("formidable");
const { PythonShell } = require("python-shell");
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const resultInformation = require("./data");


app.get("/", (req, res) => {
    res.send("Hello World!");
});


app.get("/*", (req, res) => {
    res.send("404! Not found");
});


app.post("/file_upload", (req, res, next) => {
    
    const form = formidable({ multiples: true, uploadDir: __dirname, keepExtensions:true});
    
    var fileName, fileType, fileUploadPath;
    
    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
         
        fileName = files.file.name;
        fileType = files.file.type;
        fileUploadPath = files.file.path;;

        console.log(fileUploadPath);

        let options={
            args : [fileUploadPath]
        }

        PythonShell.run("label_image.py", options,(err,result)=>{
            if(err){
                throw err;
            }
            console.log(result)
            if (result.length !== 0)
                res.send(resultInformation(result[0]));
            else
                res.json({ "Error": "No information found!" });
        })
       
    });
    
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));