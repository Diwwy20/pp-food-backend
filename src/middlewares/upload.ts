import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { BadRequestError } from "../utils/errors";

export const createUploadMiddleware = (baseFolder: string) => {
  const storage = multer.diskStorage({
    destination: (req: Request, _file, cb) => {
      let uploadDir = `uploaded/${baseFolder}`;

      if (baseFolder === "products") {
        const categoryName = req.body.categoryFolder
          ? req.body.categoryFolder.toString().toLowerCase()
          : "uncategorized";

        const safeCategoryName = categoryName.replace(/[^a-z0-9]/g, "");

        uploadDir = path.join(uploadDir, safeCategoryName || "uncategorized");
      }

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${baseFolder}-${uniqueSuffix}${ext}`);
    },
  });

  const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new BadRequestError("Only images are allowed"), false);
    }
  };

  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
};
