/*  
---------------------
    NPM Packages Required
    1. Express.js 
    2. Body-Parser
    3. Formidable
    4. PythonShell
    5. Cors
---------------------
*/


 // Import/Require the dependent packages

const express = require("express");
const bodyParser=require("body-parser");
const formidable = require("formidable");
const { PythonShell } = require("python-shell");
const fs = require("fs");
const path = require("path");
const cors = require("cors");



// set up the app using express framework
const app = express();

// setup the global middlewares for the app for accessing static folder 
app.use(express.static("public"));

// setup the global middleware for parsing JSON data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use cors as a global middleware
app.use(cors());

// import/require the resultant data set information to send back to user
const resultInformation = require("./data");

/*  
---------------------------------
    Routes Setup for the server
---------------------------------
*/

// create a folder by name test_images to keep images
const uploadDir = 'test_images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// function to delete all files inside test images folder
function deleteFiles(filePath) {

    fs.readdir(uploadDir, (err, files) => {
        if (err) throw err;

        for (let file of files) {
            // delete only recently uploaded file
            if (file == filePath){
                console.log("Deleted!!!");  
                fs.unlink(path.join(uploadDir, file), err => {
                    if (err) throw err;
                });
            }
           
        }
    });
}

// Index route : @GET method to access
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Wildcard route: @GET method to access (Error/Unwanted routes)
app.get("/*", (req, res) => {
    res.send("404! Not found");
});



// Post Route: @POST method to get get back the result from result analysis

/*
    @params:{Image} send from the client side
*/

app.post("/file_upload", (req, res, next) => {

    // set up the formidable package to handle images from request parameter
    const form = formidable({ multiples: true, uploadDir: __dirname + "/test_images", keepExtensions:true});
    
    var fileName, fileType, fileUploadPath;
    
    // parse the incoming request object with multiform type data
    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
         
        if(files.file == undefined){
            res.send("No Input File");
            return;
        }   
        
        // get access to required file details (name, path and type)
        
        fileName = files.file.name;
        fileType = files.file.type;
        fileUploadPath = files.file.path;

        
        const newFileName = fileName.split('.').join('-' + Date.now() + '.');
        const newPath = __dirname + "/test_images" + "/" + newFileName;
        
        fs.rename(fileUploadPath, newPath, () => {
            console.log("Renamed File");
        });

        // check to support images types
        const supportTypes = ["image/jpeg", "image/png", "image/jpg"];

        // spawn out python script with required arguments
        let options={
            args: [newPath]
        }

        // error check if incoming data is image (with limited types above)
        if (supportTypes.includes(fileType)) {
            
            let pythonScript = new PythonShell("label_image.py", options);
            
            // setting timeout race condition against python script:33 seconds
           
            let pythonKiller = setTimeout(() => {
               
                // kill python script to avoid multiple responses
                pythonScript.childProcess.kill();
                
                //delete the files
                
                deleteFiles(newFileName);
                
                //send the deafult result
                return res.send(resultInformation("Potato___healthy"));

            }, 30000);
            
            pythonScript.on('message', (result) => {
                
                console.log(result);

                // send the analysed report from the python script
                if (result.length !== 0) 
                    res.send(resultInformation(result));

                // return: Error messsage if no result is predicted
                else
                    res.json({ Error: "No information found!" });
            });

            pythonScript.end((err, signal, code) => {
                console.log("Python execution was stopped!");
                if (err)
                    console.log("Error from Python", err);
                clearTimeout(pythonKiller);

                deleteFiles(newFileName);
                
            });
        }
        
        // for not supported file types return back with appropriate message
        else {
            // call the delete method
            deleteFiles(newFileName);
            res.json({ "Error": "File type not supported! Kindly upload an image!" });
        }
        
       
    });

   

    
});


// listen the server at port:3000 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));