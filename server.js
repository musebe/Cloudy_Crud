const express = require("express");
const app = express();
const hbs = require("express-handlebars");
const bodyParser = require("body-parser");
const upload = require("./handlers/multer");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
const path = require('path');

require("dotenv").config();
require("./handlers/cloudinary");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine("handlebars", hbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Static folder
app.use(express.static(path.join(__dirname, 'public')));

// @route GET /
// @desc Loads form
app.get("/", (req, res) => {
  res.render("index");
});


// @route POST /upload
// @desc  Uploads file to Cloudinary
app.post("/uploads", upload.single("image"), async (req, res) => {
  const result = await cloudinary.v2.uploader.upload(req.file.path, {
    width: 300, height: 300, crop: "limit", tags: req.body.tags, moderation: 'manual'
  })
  res.redirect("/");
});


// @route GET /api/files - Api
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
  res.render("files", {
    images: images
  });
})

// @route GET /api/files - Api
// @desc  Display all files in JSON
app.get("/api/files", async (req, res) => {
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
  // console.log(images);

})

// @route GET /files
// @desc  Get all files from Cloudinary
app.post("/files", upload.single("image"), async (req, res) => {
  const result = await cloudinary.v2.uploader.upload(req.file.path);
  res.send(result);
  res.json(result);
  res.redirect("/");
  console.log(result);
});

// @route DELETE /files/:id
// @desc  Get all files from Cloudinary
app.delete("/files", (req, res) => {

  let id = req.body.id
  console.log(id)

  cloudinary.v2.api.delete_resources([id],
    function (error, result) { console.log(result); });

});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running ${PORT}`)
})
