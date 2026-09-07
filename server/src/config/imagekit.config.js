import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadImage = async (file, customFolder = "/Portfolio_Admin") => {
  try {
    if (!file) {
      throw new Error("Image file or data is required.");
    }

    // 1. Resolve payload whether it's a Multer file, Buffer, or Base64 string
    let uploadPayload = null;
    let originalName = `upload-${Date.now()}`;

    if (file.buffer) {
      // Standard multer.memoryStorage()
      uploadPayload = file.buffer;
      if (file.originalname) originalName = file.originalname;
    } else if (Buffer.isBuffer(file)) {
      // Direct Buffer instance
      uploadPayload = file;
    } else if (typeof file === "string") {
      // Raw or dataURI base64 string from canvas
      uploadPayload = file;
    }

    if (!uploadPayload) {
      throw new Error("Invalid image format provided.");
    }

    // 2. Upload to ImageKit
    const result = await imagekit.upload({
      file: uploadPayload,
      folder: customFolder,
      fileName: originalName.includes(".") ? originalName : `${originalName}.png`,
    });

    return result;
  } catch (error) {
    console.error("Failed to upload image to ImageKit:", error);
    throw new Error(error.message || "Problem uploading image.");
  }
};

export const deleteImage = async (fileId) => {
  try {
    if (!fileId) {
      return;
    }

    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error("Failed to delete image:", error);
    throw new Error("Problem deleting image.");
  }
};