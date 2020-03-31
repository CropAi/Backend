const express = require("express");
const bodyParser=require("body-parser")
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get("/", (req, res) => {
    res.send("Hello World!");
});


app.get("/*", (req, res) => {
    res.send("404! Not found");
});


app.post("/file_upload", (req, res) => {
    let runPy = new Promise(function (success, nosuccess) {

        const { spawn } = require('child_process');
        const pyprog = spawn('python', ['dummy.py']);

        pyprog.stdout.on('data', function (data) {
            success(data);
        });

        pyprog.stderr.on('data', (data) => {
            nosuccess(data);
        });
    });

    runPy.then(result => {
        console.log(result.toString());
        res.send(result.toString());
    })
    .catch(err => {
        console.log("Error from spawn", err)
    })
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));