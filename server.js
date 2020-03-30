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
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
