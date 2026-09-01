import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});


export const uploadImage = async (file) => {
  try {
    if (!file) {
      throw new Error("Image file is required.");
    }

    const result = await imagekit.upload({
      // multer.memoryStorage() gives us a Buffer
      file: file.buffer,
        
      folder: "/Portfolio_Admin",

      fileName: `profile-${Date.now()}`,
    });

    return result;

  } catch (error) {
    console.error("Failed to upload image:", error);

    throw new Error("Problem uploading image.");
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