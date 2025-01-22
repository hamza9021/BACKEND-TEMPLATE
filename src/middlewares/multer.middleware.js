import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/public/temp");
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)  LATER STUDY
        cb(null, file.originalname); // + uniqueSuffix
        console.log(file);
    },
});

export default upload = multer({ storage: storage });
