import multer from "multer";
const storage = multer.memoryStorage(); // we’ll stream to Cloudinary
export const upload = multer({ storage });
