const express = require("express");
const router = express.Router();
const { getDb } = require("../models/database");
const { ObjectId } = require("mongodb");
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const submissions = await db.collection("submissions").find().toArray();
    res.render("submissions", { submissions });
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).send("Error retrieving submissions");
  }
});
router.get("/download/:id", async (req, res) => {
  try {
    const db = getDb();
    const submission = await db
      .collection("submissions")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!submission || !submission.swappedImage) {
      return res.status(404).send("Image not found.");
    }

    // Fetch the image from the external API URL as a stream
    const imageResponse = await axios({
      method: "get",
      url: submission.swappedImage,
      responseType: "stream",
    });

    // Use a more specific Content-Type, or rely on the one from the external server
    const contentType = imageResponse.headers["content-type"] || "image/jpeg";
    const fileExtension = contentType.split("/")[1] || "jpg";

    // Set the appropriate headers to force a download
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="swapped_photo_${req.params.id}.${fileExtension}"`
    );

    // Pipe the image data to the response
    imageResponse.data.pipe(res);

    // Handle stream errors
    imageResponse.data.on("error", (err) => {
      console.error("Stream error during image download:", err);
      if (!res.headersSent) {
        res.status(500).send("Error downloading image.");
      }
    });
  } catch (err) {
    console.error("Error downloading image:", err);
    if (!res.headersSent) {
      res.status(500).send("Error downloading image.");
    }
  }
});

module.exports = router;
