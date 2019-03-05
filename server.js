const express = require("express");
const app = express();
const expbs = require("express-handlebars");
const bodyParser = require("body-parser");
const upload = require("./handlers/multer");
const cloudinary = require("cloudinary");
const path = require("path");
const moment = require("moment")

require("dotenv").config();
require("./handlers/cloudinary");

const hbs = expbs.create({
  defaultLayout: "main",

  //helpers
  helpers: {
    renderDateFormat: function (time) {
      return moment(time).format('MMMM Do YYYY, h:mm:ss a')
    }
  }
})

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

//Static folder
app.use(express.static(path.join(__dirname, "public")));

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


// @route GET /files
// @desc  Display all files
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
});

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
});

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
  let id = req.body.id;
  console.log(id);

  cloudinary.v2.api.delete_resources([id], function (error, result) {
    console.log(result);
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running ${PORT}`);
});
