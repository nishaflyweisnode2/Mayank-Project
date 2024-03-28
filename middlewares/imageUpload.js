var multer = require("multer");
const authConfig = require("../configs/auth.config");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: authConfig.cloud_name, api_key: authConfig.api_key, api_secret: authConfig.api_secret, });
const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "parveenSalon/images/product", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload = multer({ storage: storage });
const productUpload = upload.fields([{ name: 'images', maxCount: 20 }, { name: 'image', maxCount: 1 }]);
const storage1 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "parveenSalon/images/banner", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const bannerUpload = multer({ storage: storage1 });
const storage2 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "parveenSalon/images/blog", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const blogUpload = multer({ storage: storage2 });
const storage3 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "parveenSalon/images/about", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const upload3 = multer({ storage: storage3 });
const aboutusUpload = upload3.fields([{ name: 'aboutusImages', maxCount: 10 }, { name: 'aboutusImage', maxCount: 1 }]);
const storage4 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "parveenSalon/images/category", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const categoryUpload = multer({ storage: storage4 });
const storage5 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "parveenSalon/images/subCategory", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const subCategoryUpload = multer({ storage: storage5 });
const storage6 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "parveenSalon/service", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const serviceUpload = multer({ storage: storage6 });
const storage7 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "parveenSalon/userProfile", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const userProfileUpload = multer({ storage: storage7 });
const storage8 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "parveenSalon/Brand", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const BrandUpload = multer({ storage: storage8 });
const storage9 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "parveenSalon/E4u", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const E4UUpload = multer({ storage: storage9 });
const storage10 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "parveenSalon/offer", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const offerUpload = multer({ storage: storage10 });
const storage11 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'parveenSalon/images/spAgreement',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF']
    }
});

const spAgreementUpload = multer({ storage: storage11 });

const storage12 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'parveenSalon/images/transportCharges',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF']
    }
});
const transportationCharges = multer({ storage: storage12 });

const storage13 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'parveenSalon/images/copmlaint&suggestionAudio',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF', "mp3", "wav", "ogg"]
    }
});
const complaintSuggestion = multer({ storage: storage13 });
const storage14 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'parveenSalon/images/testimonial',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF']
    }
});
const testimonial = multer({ storage: storage14 });
const storage15 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'parveenSalon/images/testimonial',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF']
    }
});
const charges = multer({ storage: storage15 });
const storage16 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'parveenSalon/images/serviceType',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF']
    }
});
const serviceType = multer({ storage: storage16 });
const storage17 = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'parveenSalon/images/subCategory',
        allowed_formats: ['jpg', 'jpeg', 'png', 'xlsx', 'xls', 'pdf', 'PDF']
    }
});
const subCategory = multer({ storage: storage17 });

const storage18 = new CloudinaryStorage({
    cloudinary: cloudinary, params: {
        folder: "parveenSalon/images/mainCategory/banner", allowed_formats: [
            "jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"],
    },
});
const mainCategoryBannerUpload = multer({ storage: storage18 });


module.exports = { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, E4UUpload, userProfileUpload, BrandUpload, offerUpload, spAgreementUpload, transportationCharges, complaintSuggestion, testimonial, charges, serviceType, subCategory, mainCategoryBannerUpload };
