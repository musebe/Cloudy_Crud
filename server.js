const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const upload = require("./handlers/multer");
const cloudinary = require("cloudinary");

require("dotenv").config();
require("./handlers/cloudinary");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

// @route GET /
// @desc Loads form

app.get("/", async (req, res) => {
  const images = await cloudinary.v2.api.resources({
    type: "upload",
    prefix: "image"
  });
  // Check if files
  if (!images || images.length === 0) {
    res.render("index", { images: false });
  } else {
    images.resources.map(image => {
      if (
        image.format === "jpg" ||
        image.format === "png" ||
        image.format === "jpeg"
      ) {
        image.isImage = true;
      } else {
        image.isImage = false;
      }
    });
    res.render("index", { images });
  }
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
  const id = req.params.id;
  await cloudinary.v2.api.resources_by_ids(`Image/${id}`, (err, image) => {
    // Check if file
    if (!image || image.length === 0) {
      return res.status(404).json({
        err: "No image exists"
      });
    }
    // File exists
    return res.json(image);
    //console.log(result);
  });
});

// @route DELETE /files/:id
// @desc  Delete file
app.delete("/files/:id", (req, res) => {
  const id = req.params.id;
  cloudinary.v2.uploader.destroy(`Image/${id}`, (err, result) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect("/");
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running ${PORT}`);
});
