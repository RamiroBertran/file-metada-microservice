require("dotenv").config();
var express = require("express");
var cors = require("cors");
var mongoURL = process.env.MONGO_URI;
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var multer = require("multer");
let Upfile;

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({});
const upload = multer({ storage: storage });
app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database");
    createCollection();
  })
  .catch((err) => {
    console.error(err);
  });
async function createCollection() {
  try {
    const fileSchema = new mongoose.Schema({
      name: String,
      type: String,
      size: String,
    });
    Upfile = mongoose.model("Upfile", fileSchema);
    await Upfile.createCollection();
    console.log("file collection created");
  } catch (err) {
    console.error("Error found: " + err);
  }
}

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/fileanalyse", upload.single("file"), (req, res) => {
  const file = req.file;
  const fileType = file.mimetype;
  const { originalname, size } = file;
  const newFile = new Upfile({
    name: originalname,
    type: fileType,
    size: size,
  })
    .save()
    .then((result) => {
      res.json({
        name: result.name,
        type: result.type,
        size: result.size,
      });
    })
    .catch((error) => {
      console.error("Error found: " + error);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});
