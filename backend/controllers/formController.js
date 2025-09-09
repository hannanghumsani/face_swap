const { getDb } = require("../models/database");
const fs = require("fs").promises;
const axios = require("axios");
const multer = require("multer");
const path = require("path");

// Use memoryStorage() instead of dest to handle files in memory.
// This is crucial for deployment to platforms like Vercel.
const upload = multer({ storage: multer.memoryStorage() });

const LIGHTX_API_KEY = process.env.LIGHTX_API_KEY;
const LIGHTX_BASE_URL = "https://api.lightxeditor.com/external/api/v2";
const LIGHTX_V1_BASE_URL = "https://api.lightxeditor.com/external/api/v1";

/**
 * Uploads an image to LightX using their presigned URL flow.
 *
 * @param {Buffer} fileBuffer - The image data as a buffer.
 * @param {string} mimeType - The file's MIME type.
 * @param {string} apiKey - The LightX API key.
 * @returns {Promise<string>} The final image URL hosted by LightX.
 */
async function uploadImageToLightX(fileBuffer, mimeType, apiKey) {
  try {
    const fileSize = fileBuffer.length;
    const presignedRes = await axios.post(
      `${LIGHTX_BASE_URL}/uploadImageUrl`,
      {
        uploadType: "imageUrl",
        size: fileSize,
        contentType: mimeType,
      },
      {
        headers: { "x-api-key": apiKey },
      }
    );

    const responseData =
      presignedRes.data.body ||
      presignedRes.data.data ||
      presignedRes.data.result ||
      presignedRes.data;

    const uploadUrl =
      responseData.uploadImage ||
      responseData.uploadUrl ||
      responseData.upload_url ||
      responseData.url;
    const imageUrl =
      responseData.imageUrl || responseData.image_url || responseData.outputUrl;

    if (!uploadUrl || !imageUrl) {
      console.error("LightX API response missing required URLs:", responseData);
      throw new Error("Failed to get required URLs from LightX API.");
    }

    await axios.put(uploadUrl, fileBuffer, {
      headers: { "Content-Type": mimeType },
    });

    return imageUrl;
  } catch (error) {
    console.error(
      "Error in uploadImageToLightX:",
      error.response ? error.response.data : error.message
    );
    throw new Error(`Failed to upload image to LightX: ${error.message}`);
  }
}

const getForm = (req, res) => {
  res.render("index", { errors: null, values: null });
};

/**
 * Polls the order status of a face-swap job until it's complete.
 *
 * @param {string} orderId - The order ID from the face-swap initiation.
 * @param {string} apiKey - The LightX API key.
 * @param {number} maxRetries - Max polling attempts.
 * @param {number} interval - Interval between polls in ms.
 * @returns {Promise<string>} The output image URL.
 */
async function pollOrderStatus(
  orderId,
  apiKey,
  maxRetries = 10,
  interval = 5000
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const statusRes = await axios.post(
        `${LIGHTX_V1_BASE_URL}/order-status`,
        { orderId },
        {
          headers: { "x-api-key": apiKey },
        }
      );

      const responseData =
        statusRes.data.body ||
        statusRes.data.data ||
        statusRes.data.result ||
        statusRes.data;
      const { status, output, message, description } = responseData;

      console.log(
        `Polling status for order ${orderId}: Attempt ${
          attempt + 1
        }, Status: ${status}`
      );

      if (status === "active") {
        if (!output) {
          throw new Error("Output URL missing in active status response");
        }
        return output;
      } else if (status === "failed" || status === "FAIL") {
        throw new Error(`Face swap failed: ${message} - ${description}`);
      } else if (status === "init" && attempt === maxRetries - 1) {
        throw new Error(
          `Face swap stuck in init status after ${maxRetries} attempts`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      console.error(
        `Polling attempt ${attempt + 1} failed:`,
        error.response ? error.response.data : error.message
      );
      if (attempt === maxRetries - 1) {
        throw new Error("Max retries exceeded for status polling.");
      }
    }
  }
}

const submitForm = async (req, res) => {
  const { name, email, phone } = req.body;

  if (!req.files || !req.files.originalFile || !req.files.swapFile) {
    return res.status(400).render("index", {
      errors: { general: "Both original and swap images are required." },
      values: req.body,
    });
  }

  const originalFile = req.files.originalFile[0];
  const swapFile = req.files.swapFile[0];

  let outputUrl = null;

  try {
    // Pass file buffer and MIME type to the function
    const originalImageUrl = await uploadImageToLightX(
      originalFile.buffer,
      originalFile.mimetype,
      LIGHTX_API_KEY
    );
    const swapImageUrl = await uploadImageToLightX(
      swapFile.buffer,
      swapFile.mimetype,
      LIGHTX_API_KEY
    );

    const faceSwapRes = await axios.post(
      `${LIGHTX_V1_BASE_URL}/face-swap`,
      {
        imageUrl: originalImageUrl,
        styleImageUrl: swapImageUrl,
      },
      {
        headers: { "x-api-key": LIGHTX_API_KEY },
      }
    );

    const responseData =
      faceSwapRes.data.body ||
      faceSwapRes.data.data ||
      faceSwapRes.data.result ||
      faceSwapRes.data;
    const orderId = responseData.orderId;

    if (!orderId) {
      console.error("LightX API response missing order ID:", responseData);
      throw new Error("Face swap initiation failed: missing order ID.");
    }

    outputUrl = await pollOrderStatus(orderId, LIGHTX_API_KEY);

    const db = getDb();
    const submissionsCollection = db.collection("submissions");
    const submissionRecord = {
      name,
      email,
      phone,
      originalImage: originalImageUrl,
      swappedImage: outputUrl,
      createdAt: new Date(),
    };
    await submissionsCollection.insertOne(submissionRecord);

    res.redirect("/submissions");
  } catch (error) {
    console.error("Error processing form submission:", error.message);
    res.status(500).render("index", {
      errors: {
        general:
          "An error occurred during face swap processing. Please ensure the photos contain clear faces and try again.",
      },
      values: req.body,
    });
  }
};

module.exports = {
  getForm,
  submitForm,
  upload,
};
