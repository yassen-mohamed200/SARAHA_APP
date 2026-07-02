import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";
import { existsSync, mkdirSync } from "fs";
export const allowedFileFormats = {
  img: ["image/webp", "image/png", "image/jpeg"],
  video: ["video/mp4"],
  audio: ["audio/mpeg"],
  pdf: ["application/pdf"],
  text: ["text/plain"],
};
function localUpload({
  folderName = "general",
  allowedFormats = allowedFileFormats.img,
  fileSize = 10,
}) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const fullPath = path.resolve(`./uploads/${folderName}`);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const filename = randomUUID() + "_" + file.originalname;
      cb(null, filename);
      // console.log({file});
      file.finalPath = `uploads/${folderName}/${filename}`;
    },
  });

  function fileFilter(req, file, cb) {
    if (allowedFormats.includes(allowedFileFormats)) {
      return cb(
        new Error("invalid format", { cause: { statuscode: 400 } }),
        false,
      );
    }
    return cb(null, true);
  }

  const upload = multer({
    storage: storage,
    fileFilter,
    limits: {
      fileSize: fileSize * 1024 * 1024,
    },
  });
  return upload;
}

export default localUpload;
