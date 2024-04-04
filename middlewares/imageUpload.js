var multer = require("multer");
const authConfig = require("../configs/auth.config");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: authConfig.cloud_name, api_key: authConfig.api_key, api_secret: authConfig.api_secret, });
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "mayank-project/images/product", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload = multer({ storage: storage });
const productUpload = upload.fields([{ name: 'images', maxCount: 20 }, { name: 'image', maxCount: 1 }]);
const storage1 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "mayank-project/images/banner", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const bannerUpload = multer({ storage: storage1 });
const storage2 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "mayank-project/images/blog", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const blogUpload = multer({ storage: storage2 });
const storage3 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "mayank-project/images/about", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload3 = multer({ storage: storage3 });
const aboutusUpload = upload3.fields([{ name: 'aboutusImages', maxCount: 10 }, { name: 'aboutusImage', maxCount: 1 }]);
const storage4 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "mayank-project/images/category", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const categoryUpload = multer({ storage: storage4 });
const storage5 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "mayank-project/images/subCategory", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const subCategoryUpload = multer({ storage: storage5 });
const storage6 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "mayank-project/service", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const serviceUpload = multer({ storage: storage6 });
const storage7 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "mayank-project/userProfile", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const userProfileUpload = multer({ storage: storage7 });
const storage9 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "mayank-project/E4u", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const E4UUpload = multer({ storage: storage9 });
const storage10 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "mayank-project/offer", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const offerUpload = multer({ storage: storage10 });
const storage11 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mayank-project/images/spAgreement',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF']
    }
});

const spAgreementUpload = multer({ storage: storage11 });

const storage13 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mayank-project/images/copmlaint&suggestionAudio',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF', "mp3", "wav", "ogg"]
    }
});
const complaintSuggestion = multer({ storage: storage13 });
const storage14 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mayank-project/images/testimonial',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF']
    }
});
const testimonial = multer({ storage: storage14 });
const storage15 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mayank-project/images/testimonial',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF']
    }
});
const charges = multer({ storage: storage15 });
const storage16 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mayank-project/images/serviceType',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF']
    }
});
const serviceType = multer({ storage: storage16 });
const storage17 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mayank-project/images/subCategory',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF']
    }
});
const subCategory = multer({ storage: storage17 });

const storage18 = new CloudinaryStorage({
    cloudinary: cloudinary, params: {
        folder: "mayank-project/images/mainCategory/banner", allowed_formats: [
            "jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"],
    },
});
const mainCategoryBannerUpload = multer({ storage: storage18 });
const storage19 = new CloudinaryStorage({
    cloudinary: cloudinary, params: {
        folder: "mayank-project/images/pet/image", allowed_formats: [
            "jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"],
    },
});
const petImageUpload = multer({ storage: storage19 });
const storage20 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "mayank-project/Breed", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const BreedUpload = multer({ storage: storage20 });

module.exports = { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, E4UUpload, userProfileUpload, offerUpload, spAgreementUpload, complaintSuggestion, testimonial, charges, serviceType, subCategory, mainCategoryBannerUpload, petImageUpload, BreedUpload };
