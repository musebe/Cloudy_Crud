const express = require("express");
const app = express();
const hbs = require("express-handlebars");
const bodyParser = require("body-parser");
const upload = require("./handlers/multer");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");

require("dotenv").config();
require("./handlers/cloudinary");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine("handlebars", hbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// @route GET /
// @desc Loads form
app.get("/", (req, res) => {
  res.render("index");
});

// @route POST /upload
// @desc  Uploads file to Cloudinary
app.post("/uploads", upload.single("image"), async (req, res) => {
  const result = await cloudinary.v2.uploader.upload(req.file.path);
  // res.send(result);
  res.redirect("/");
  console.log(result);
});

// @route GET /files - Api
// @desc  Display all files in JSON
app.get("/files", async (req, res) => {
  const images = await cloudinary.v2.api.resources({
    type: "upload",
    prefix: "image"
  });
  // Check if files
  if (!images || images.length === 0) {
    return res.status(404).json({
      err: "No files exist"
    });
  }

  // Files exist
  return res.json(images);
  //console.log(images);
});

// @route GET /files/:filename
// @desc  Display single file object
app.get("/files/:id", async (req, res) => {
  const id = "Images/" + req.params.id;
  console.log(id);
  cloudinary.v2.search
    .expression({ public_id: id })
    .execute(function(error, result) {
      console.log(result);
    });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running ${PORT}`);
});
