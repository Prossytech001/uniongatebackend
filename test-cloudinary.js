import cloudinary from "./src/config/cloudinary.js";

cloudinary.uploader.upload(
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  { folder: "test-upload" },
  (err, result) => {
    console.log("ERR:", err);
    console.log("RESULT:", result);
  }
);
