const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const User = require("../models/user.model");
const mainCategory = require("../models/category/mainCategory");
const Category = require("../models/category/Category");
const subCategory = require("../models/category/subCategory");
const itemSubCategory = require("../models/category/itemSubCategory");
const item = require("../models/category/item");
const banner = require('../models/banner/banner')
const ContactDetail = require("../models/ContactDetail");
// const subscription = require('../models/subscription');
const service = require('../models/service');
const Package = require('../models/packageModel');
// const facialType = require('../models/facialType');
const Charges = require('../models/Charges');
const freeService = require('../models/freeService');
const Coupan = require('../models/Coupan')
const weCanhelpyou = require('../models/weCanhelpyou');
const e4u = require('../models/e4u')
const feedback = require('../models/feedback');
// const offer = require('../models/offer');
const ticket = require('../models/ticket');
const orderModel = require('../models/orderModel');
const Leave = require('../models/leavesModel');
const SPAgreement = require('../models/spAgreementModel');
const TrainingVideo = require('../models/traningVideoModel');
const Referral = require('../models/refferalModel');
const ConsentForm = require('../models/consentFormModel');
const offer = require('../models/offer');
const Cart = require('../models/cartModel');
const MinimumCart = require('../models/miniumCartAmountModel');
const City = require('../models/cityModel');
const Area = require('../models/areaModel');
const MainCategoryBanner = require('../models/banner/mainCategoryBanner');
const Testimonial = require("../models/testimonial");
const Slot = require('../models/SlotModel');
const moment = require('moment');
const Breed = require('../models/breedModel');
const BreedScore = require('../models/breedScoreModel');
const BreedAggressiveScore = require('../models/breedAggresiveScoreModel');
const TransportScore = require('../models/transportScoreModel');
const ProximityScore = require('../models/proximityScoreModel');
const ServiceableAreaRadius = require('../models/serviceableRadiusModel');
const ExperienceScore = require('../models/experienceScoreModel');
const Size = require('../models/sizeModel');
const Improve = require('../models/howToImproveModel');









exports.registration = async (req, res) => {
    const { phone, email } = req.body;
    try {
        req.body.email = email.split(" ").join("").toLowerCase();
        let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "ADMIN" });
        if (!user) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
            req.body.userType = "ADMIN";
            req.body.accountVerification = true;
            const userCreate = await User.create(req.body);
            return res.status(200).send({ message: "registered successfully ", data: userCreate, });
        } else {
            return res.status(409).send({ message: "Already Exist", data: [] });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email, userType: "ADMIN" });
        if (!user) {
            return res
                .status(404)
                .send({ message: "user not found ! not registered" });
        }
        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return res.status(401).send({ message: "Wrong password" });
        }
        const accessToken = jwt.sign({ id: user._id }, authConfig.secret, {
            expiresIn: authConfig.accessTokenTime,
        });
        let obj = {
            fullName: user.fullName,
            firstName: user.fullName,
            lastName: user.lastName,
            phone: user.phone,
            email: user.email,
            userType: user.userType,
        }
        return res.status(201).send({ data: obj, accessToken: accessToken });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error" + error.message });
    }
};
exports.update = async (req, res) => {
    try {
        const { fullName, firstName, lastName, email, phone, password } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        user.fullName = fullName || user.fullName;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        if (req.body.password) {
            user.password = bcrypt.hashSync(password, 8) || user.password;
        }
        const updated = await user.save();
        return res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            message: "internal server error " + err.message,
        });
    }
};
exports.createBreed = async (req, res) => {
    try {
        const { /*mainCategory: mainCategoryId,*/ name, description, size, breedAggressive, status, type } = req.body;

        let findBreed = await Breed.findOne({ name, size, type });
        console.log(findBreed);
        if (findBreed) {
            return res.status(409).json({ message: "Breed already exists.", status: 409 });
        }

        let fileUrl = req.file ? req.file.path : "";
        const data = {/* mainCategory: mainCategoryId,*/ name, description, size, breedAggressive, status, type, image: fileUrl };

        // if (mainCategoryId) {
        //     const findMainCategory = await mainCategory.findById(mainCategoryId);
        //     if (!findMainCategory) {
        //         return res.status(404).json({ message: "Main Category Not Found", status: 404 });
        //     }
        // }

        const breed = await Breed.create(data);
        return res.status(200).json({ message: "Breed added successfully.", status: 200, data: breed });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.getBreeds = async (req, res) => {
    try {
        const breeds = await Breed.find().populate("mainCategory size");
        return res.status(200).json({ status: 200, data: breeds });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};
exports.getBreedsByMaincategory = async (req, res) => {
    try {
        const mainCategoryId = req.params.id;
        const type = req.query.type;

        const category = await mainCategory.findById(mainCategoryId);
        if (!category) {
            return res.status(404).json({ message: "MainCategory Not Found", status: 404, data: {} });
        }

        if (type) {
            const breeds = await Breed.find({ mainCategory: mainCategoryId, type: type }).populate("mainCategory size");
            return res.status(200).json({ status: 200, data: breeds });
        } else {
            const breeds = await Breed.find({ mainCategory: mainCategoryId }).populate("mainCategory size");
            return res.status(200).json({ status: 200, data: breeds });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};
exports.getBreedById = async (req, res) => {
    try {
        const breed = await Breed.findById(req.params.id).populate('mainCategory size');
        if (!breed) {
            return res.status(404).json({ status: 404, message: 'Breed not found' });
        }
        return res.status(200).json({ status: 200, data: breed });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
};
exports.updateBreed = async (req, res) => {
    try {
        const breed = await Breed.findById(req.params.id);
        if (!breed) {
            return res.status(404).json({ message: 'Breed not found' });
        }
        let fileUrl = req.file ? req.file.path : breed.image;

        breed.image = fileUrl;
        // breed.mainCategory = req.body.mainCategory || breed.mainCategory;
        breed.name = req.body.name || breed.name;
        breed.description = req.body.description || breed.description;
        breed.size = req.body.size || breed.size;
        breed.status = req.body.status || breed.status;
        breed.breedAggressive = req.body.breedAggressive || breed.breedAggressive;
        breed.type = req.body.type || breed.type;

        await breed.save();

        return res.status(200).json({ status: 200, data: breed });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.deleteBreed = async (req, res) => {
    try {
        const breed = await Breed.findById(req.params.id);
        if (!breed) {
            return res.status(404).json({ message: 'Breed not found' });
        }
        await Breed.findByIdAndDelete(breed._id);
        return res.status(200).json({ status: 200, message: 'Breed deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};
exports.AddBanner = async (req, res) => {
    try {
        let fileUrl, isVideo = false;;
        if (req.file) {
            fileUrl = req.file.path;
        }

        const position = req.body.position;
        const video = req.body.video;
        if (video) {
            isVideo = true;
        }

        const existingBanners = await banner.findOne({ position: position, type: req.body.type });
        if (existingBanners) {
            return res.status(400).json({ status: 400, message: "Position already found", data: {} });
        }

        const Data = await banner.create({
            mainCategoryId: req.body.mainCategoryId,
            categoryId: req.body.categoryId,
            subCategoryId: req.body.subCategoryId,
            servicesId: req.body.servicesId,
            image: fileUrl,
            video: video,
            colour: req.body.colour,
            position: position,
            type: req.body.type,
            desc: req.body.desc,
            buttonName: req.body.buttonName,
            status: req.body.status,
            isVideo: isVideo,
        });

        return res.status(200).json({ status: 200, message: "Banner is Added", data: Data });
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "Server error.", data: {} });
    }
};
exports.getBanner = async (req, res) => {
    try {
        const banners = await banner.find().sort({ position: 1 });

        if (banners.length === 0) {
            return res.status(404).json({ status: 404, message: "No data found for the specified position", data: {} });
        }

        return res.status(200).json({ status: 200, message: "Banners found successfully.", data: banners });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 500, message: "Server error.", data: {} });
    }
};
exports.getHeroBanner = async (req, res) => {
    try {
        const banners = await banner.find({ type: "HeroBanner" }).sort({ position: 1 });

        if (banners.length === 0) {
            return res.status(404).json({ status: 404, message: "No data found for the specified position", data: {} });
        }

        return res.status(200).json({ status: 200, message: "Banners found successfully.", data: banners });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 500, message: "Server error.", data: {} });
    }
};
exports.getOfferBanner = async (req, res) => {
    try {
        const banners = await banner.find({ type: "Offer" }).sort({ position: 1 });

        if (banners.length === 0) {
            return res.status(404).json({ status: 404, message: "No data found for the specified position", data: {} });
        }

        return res.status(200).json({ status: 200, message: "Banners found successfully.", data: banners });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 500, message: "Server error.", data: {} });
    }
};
exports.getStaticBanner = async (req, res) => {
    try {
        const banners = await banner.find({ type: "Static" }).sort({ position: 1 });

        if (banners.length === 0) {
            return res.status(404).json({ status: 404, message: "No data found for the specified position", data: {} });
        }

        return res.status(200).json({ status: 200, message: "Banners found successfully.", data: banners });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 500, message: "Server error.", data: {} });
    }
};
exports.getBannerByPosition = async (req, res) => {
    try {
        const position = req.query.position;
        const type = req.query.type;

        if (!/^(?:[1-9]|[1-9][0-9]|100)$/.test(position)) {
            return res.status(400).json({ status: 400, message: "Invalid position" });
        }

        if (!["HeroBanner", "Offer", "Static"].includes(type)) {
            return res.status(400).json({ status: 400, message: "Invalid Type" });
        }

        const banners = await banner.find({ position: parseInt(position), type: type });

        if (banners.length === 0) {
            return res.status(404).json({ status: 404, message: "No data found for the specified position", data: {} });
        }

        if (banners.length === 1) {
            return res.status(200).json({ status: 200, message: "Banner found successfully.", data: banners[0] });
        }

        return res.status(200).json({ status: 200, message: "Banners found successfully.", data: banners });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 500, message: "Server error.", data: {} });
    }
};
exports.updateBannerPosition1 = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const newPosition = req.body.newPosition;
        const bannerType = req.body.type;

        const currentBanner = await banner.findOne({ _id: bannerId, type: bannerType });


        const totalBannersCount = await banner.countDocuments({ type: bannerType });

        if (parseInt(newPosition) > totalBannersCount || parseInt(newPosition) <= 0) {
            return res.status(400).json({ status: 400, message: "Invalid position" });
        }

        const existingBanner = await banner.findOne({ position: newPosition, type: bannerType });

        if (existingBanner) {
            const tempPosition = currentBanner.position;
            currentBanner.position = newPosition;
            existingBanner.position = tempPosition;

            await Promise.all([currentBanner.save(), existingBanner.save()]);
        } else {
            currentBanner.position = newPosition;
            await currentBanner.save();
        }

        return res.status(200).json({ status: 200, message: "Banner position updated successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, message: "Server error", data: {} });
    }
};
exports.updateBannerPosition = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const newPosition = req.body.newPosition;
        const bannerTypeFromBody = req.body.type;

        const currentBanner = await banner.findOne({ _id: bannerId });

        if (!currentBanner) {
            return res.status(404).json({ status: 404, message: "Banner not found" });
        }

        if (bannerTypeFromBody !== currentBanner.type) {
            return res.status(400).json({ status: 400, message: "Invalid banner type" });
        }

        const totalBannersCount = await banner.countDocuments({ type: currentBanner.type });

        if (parseInt(newPosition) > totalBannersCount || parseInt(newPosition) <= 0) {
            return res.status(400).json({ status: 400, message: "Invalid position" });
        }

        const existingBanner = await banner.findOne({ position: newPosition, type: currentBanner.type });

        if (existingBanner) {
            const tempPosition = currentBanner.position;
            currentBanner.position = newPosition;
            existingBanner.position = tempPosition;

            await Promise.all([currentBanner.save(), existingBanner.save()]);
        } else {
            currentBanner.position = newPosition;
            await currentBanner.save();
        }

        return res.status(200).json({ status: 200, message: "Banner position updated successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, message: "Server error", data: {} });
    }
};
exports.getBannerForMainCategoryByPosition = async (req, res) => {
    try {
        const mainCategoryId = req.params.mainCategoryId;
        const position = req.query.position;

        if (position) {
            if (!/^(?:[1-9]|[1-9][0-9]|100)$/.test(position)) {
                return res.status(400).json({ status: 400, message: "Invalid position" });
            }
            const banners = await banner.find({ position: position, mainCategoryId: mainCategoryId }).sort({ position: 1 });
            if (banners.length === 0) {
                return res.status(404).json({ status: 404, message: "No data found for the specified position", data: [] });
            }
            return res.status(200).json({ status: 200, message: "Banners found successfully.", position: position, data: banners });
        } else {
            const banners = await banner.find({ /*position: position,*/ mainCategoryId: mainCategoryId }).sort({ position: 1 });

            if (banners.length === 0) {
                return res.status(404).json({ status: 404, message: "No data found for the specified position", data: [] });
            }
            return res.status(200).json({ status: 200, message: "Banners found successfully.", position: position, data: banners });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 500, message: "Server error.", data: [] });
    }
};
exports.getBannersBySearch = async (req, res) => {
    try {
        const {
            mainCategoryId,
            categoryId,
            subCategoryId,
            servicesId,
            position,
            type,
            status,
            search,
            fromDate,
            toDate,
            page,
            limit,
        } = req.query;

        let query = {};

        if (mainCategoryId) {
            query.mainCategoryId = mainCategoryId;
        }

        if (categoryId) {
            query.categoryId = categoryId;
        }

        if (subCategoryId) {
            query.subCategoryId = subCategoryId;
        }

        if (servicesId) {
            query.servicesId = servicesId;
        }

        if (position) {
            query.position = position;
        }

        if (type) {
            query.type = type;
        }

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { "colour": { $regex: search, $options: "i" } },
                { "desc": { $regex: search, $options: "i" } },
            ];
        }

        if (fromDate && !toDate) {
            query.createdAt = { $gte: fromDate };
        }

        if (!fromDate && toDate) {
            query.createdAt = { $lte: toDate };
        }

        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: fromDate } },
                { createdAt: { $lte: toDate } },
            ];
        }

        let options = {
            page: Number(page) || 1,
            limit: Number(limit) || 15,
            sort: { createdAt: -1 },
            populate: ('mainCategoryId categoryId subCategoryId servicesId'),
        };

        let data = await banner.paginate(query, options);

        return res.status(200).json({
            status: 200,
            message: "Banner data found.",
            data: data,
        });
    } catch (err) {
        return res.status(500).send({
            msg: "Internal server error",
            error: err.message,
        });
    }
};
exports.getBannerById = async (req, res) => {
    try {
        const Banner = await banner.findById({ _id: req.params.id });
        if (!Banner) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "Data found successfully.", data: Banner })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.DeleteBanner = async (req, res) => {
    try {
        const Banner = await banner.findById({ _id: req.params.id });
        if (!Banner) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        await banner.findByIdAndDelete({ _id: req.params.id });
        return res.status(200).json({ status: 200, message: "Banner delete successfully.", data: {} })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.createCharge = async (req, res) => {
    try {
        let findCharges = await Charges.findOne({ name: req.body.name });
        if (findCharges) {
            return res.status(409).json({ message: "Charges already exist.", status: 409, data: {} });
        }

        let fileUrl;
        if (req.file) {
            fileUrl = req.file.path;
        }

        const data = {
            name: req.body.name,
            image: fileUrl,
            charge: req.body.charge,
            cancelation: req.body.cancelation,
            discountCharge: req.body.discountCharge,
            discount: req.body.discount,
        };
        const findCharge = await Charges.create(data);
        return res.status(200).json({ message: "Charges added successfully.", status: 200, data: findCharge });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.getCharges = async (req, res) => {
    const findCharge = await Charges.find({});
    return res.status(201).json({ message: "Charges Found", status: 200, data: findCharge, });
};
exports.updateCharge = async (req, res) => {
    const { id } = req.params;
    const findCharge = await Charges.findById(id);
    if (!findCharge) {
        return res.status(404).json({ message: "Charges Not Found", status: 404, data: {} });
    }
    let data = {
        charge: req.body.charge || findCharge.charge,
        name: req.body.name || findCharge.name,
        cancelation: req.body.cancelation || findCharge.cancelation,
        discountCharge: req.body.discountCharge || findCharge.discountCharge,
        discount: req.body.discount || findCharge.discount,
    }
    const update = await Charges.findByIdAndUpdate({ _id: findCharge._id }, { $set: data }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeCharge = async (req, res) => {
    const { id } = req.params;
    const findCharge = await Charges.findById(id);
    if (!findCharge) {
        return res.status(404).json({ message: "Charges Not Found", status: 404, data: {} });
    } else {
        await Charges.findByIdAndDelete(findCharge._id);
        return res.status(200).json({ message: "Charges Deleted Successfully !" });
    }
};
exports.addContactDetails = async (req, res) => {
    try {
        let findContact = await ContactDetail.findOne();
        if (findContact) {
            req.body.mobileNumber = req.body.mobileNumber || findContact.mobileNumber;
            req.body.mobileNumberDescription = req.body.mobileNumberDescription || findContact.mobileNumberDescription;
            req.body.email = req.body.email || findContact.email;
            req.body.emailDescription = req.body.emailDescription || findContact.emailDescription;
            req.body.whatAppchat = req.body.whatAppchat || findContact.whatAppchat;
            req.body.whatAppchatDescription = req.body.whatAppchatDescription || findContact.whatAppchatDescription;
            let updateContact = await ContactDetail.findByIdAndUpdate({ _id: findContact._id }, { $set: req.body }, { new: true });
            if (updateContact) {
                return res.status(200).send({ status: 200, message: "Contact Detail update successfully", data: updateContact });
            }
        } else {
            let result2 = await ContactDetail.create(req.body);
            if (result2) {
                return res.status(200).send({ status: 200, message: "Contact Detail update successfully", data: result2 });
            }
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ status: 500, msg: "internal server error", error: err.message, });
    }
};
exports.viewContactDetails = async (req, res) => {
    try {
        let findcontactDetails = await ContactDetail.findOne();
        if (!findcontactDetails) {
            return res.status(404).send({ status: 404, message: "Contact Detail not found.", data: {} });
        } else {
            return res.status(200).send({ status: 200, message: "Contact Detail fetch successfully", data: findcontactDetails });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: 500, msg: "internal server error", error: err.message, });
    }
};
exports.createE4u = async (req, res) => {
    try {
        let findE4U = await e4u.findOne({ title: req.body.title, type: req.body.type });
        if (findE4U) {
            return res.status(409).json({ message: "E4u already exit.", status: 404, data: {} });
        } else {
            let fileUrl;
            if (req.file) {
                fileUrl = req.file ? req.file.path : "";
            }
            const data = { title: req.body.title, type: req.body.type, description: req.body.description, image: fileUrl };
            const saved = await e4u.create(data);
            return res.status(200).json({ message: "E4u add successfully.", status: 200, data: saved });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getE4uByType = async (req, res) => {
    if (req.params.type == "FR") {
        const findE4U = await e4u.findOne({ type: req.params.type });
        if (!findE4U) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(201).json({ message: "E4u Found", status: 200, data: findE4U, });
    } else {
        const findE4U = await e4u.find({ type: req.params.type });
        if (findE4U.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(201).json({ message: "E4u Found", status: 200, data: findE4U, });
    }
};
exports.getE4u = async (req, res) => {
    const findE4U = await e4u.find({});
    if (findE4U.length == 0) {
        return res.status(404).json({ status: 404, message: "No data found", data: {} });
    }
    return res.status(201).json({ message: "E4u Found", status: 200, data: findE4U, });
};
exports.updateE4u = async (req, res) => {
    const { id } = req.params;
    const findE4U = await e4u.findById(id);
    if (!findE4U) {
        return res.status(404).json({ message: "E4u Not Found", status: 404, data: {} });
    }
    let fileUrl;
    if (req.file) {
        fileUrl = req.file ? req.file.path : "";
    }
    findE4U.title = req.body.title || findE4U.title;
    findE4U.type = req.body.type || findE4U.type;
    findE4U.description = req.body.description || findE4U.description;
    findE4U.image = fileUrl || findE4U.image;
    let update = await findE4U.save();
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeE4u = async (req, res) => {
    const { id } = req.params;
    const category = await e4u.findById(id);
    if (!category) {
        return res.status(404).json({ message: "E4u Not Found", status: 404, data: {} });
    } else {
        await e4u.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "E4u Deleted Successfully !" });
    }
};
exports.createweCanhelpyou = async (req, res) => {
    const { question, answer, type } = req.body;
    try {
        if (!question || !answer || !type) {
            return res.status(400).json({ message: "questions, answers and type cannot be blank " });
        }
        const findData = await weCanhelpyou.create(req.body);
        return res.status(200).json({ status: 200, message: "We Can help you Added Successfully ", data: findData });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error ", status: 500, data: err.message });
    }
};
exports.getAllweCanhelpyou = async (req, res) => {
    try {
        const findData = await weCanhelpyou.find({ type: req.params.type }).lean();
        if (findData.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "We Can help you retrieved successfully ", data: findData });
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.getweCanhelpyouById = async (req, res) => {
    const { id } = req.params;
    try {
        const findData = await weCanhelpyou.findById(id);
        if (!findData) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "We Can help you retrieved successfully ", data: findData });
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.updateweCanhelpyou = async (req, res) => {
    const { id } = req.params;
    try {
        const { question, answer, type } = req.body;
        const findData = await weCanhelpyou.findById(id);
        if (!findData) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        let obj = {
            question: question || findData.question,
            answer: answer || findData.answer,
            type: type || findData.type,
        }
        const update = await weCanhelpyou.findByIdAndUpdate(id, { $set: obj }, { new: true });
        return res.status(200).json({ status: 200, message: "update successfully.", data: update });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong ", status: 500, data: err.message });
    }
};
exports.deleteweCanhelpyou = async (req, res) => {
    const { id } = req.params;
    try {
        const findData = await weCanhelpyou.findById(id);
        if (!findData) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        const faq = await weCanhelpyou.findByIdAndDelete(findData._id);
        return res.status(200).json({ status: 200, message: "We Can help you Deleted Successfully ", data: faq });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong ", status: 500, data: err.message });
    }
};
exports.listTicket = async (req, res) => {
    try {
        let findUser = await User.findOne({ _id: req.user._id });
        if (!findUser) {
            return res.status(404).send({ status: 404, message: "User not found" });
        } else {
            let findTicket = await ticket.find({});
            if (findTicket.length == 0) {
                return res.status(404).send({ status: 404, message: "Data not found" });
            } else {
                res.json({ status: 200, message: 'Ticket Data found successfully.', data: findTicket });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};
exports.replyOnTicket = async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.user._id, });
        if (data) {
            const data1 = await ticket.findById({ _id: req.params.id });
            if (data1) {
                let obj = {
                    comment: req.body.comment,
                    byUser: false,
                    byAdmin: true,
                    date: Date.now(),
                }
                let update = await ticket.findByIdAndUpdate({ _id: data1._id }, { $push: { messageDetails: obj } }, { new: true })
                return res.status(200).json({ status: 200, message: "Ticket found successfully.", data: update });
            } else {
                return res.status(404).json({ status: 404, message: "No data found", data: {} });
            }
        } else {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.closeTicket = async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.user._id, });
        if (data) {
            const data1 = await ticket.findById({ _id: req.params.id });
            if (data1) {
                let update = await ticket.findByIdAndUpdate({ _id: data1._id }, { $set: { close: true } }, { new: true })
                return res.status(200).json({ status: 200, message: "Ticket close successfully.", data: update });
            } else {
                return res.status(404).json({ status: 404, message: "No data found", data: {} });
            }
        } else {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.addCoupan = async (req, res) => {
    try {
        let vendorData = await User.findOne({ _id: req.body.userId });
        if (!vendorData) {
            return res.status(404).send({ status: 404, message: "User not found" });
        } else {
            const d = new Date(req.body.expirationDate);
            req.body.expirationDate = d.toISOString();
            const de = new Date(req.body.activationDate);
            req.body.activationDate = de.toISOString();
            req.body.userId = vendorData._id;
            req.body.couponCode = await reffralCode();
            let saveStore = await Coupan(req.body).save();
            if (saveStore) {
                res.json({ status: 200, message: 'Coupan add successfully.', data: saveStore });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};
exports.listCoupan = async (req, res) => {
    try {
        let vendorData = await User.findOne({ _id: req.user._id });
        if (!vendorData) {
            return res.status(404).send({ status: 404, message: "User not found" });
        } else {
            let findService = await Coupan.find({});
            if (findService.length == 0) {
                return res.status(404).send({ status: 404, message: "Data not found" });
            } else {
                res.json({ status: 200, message: 'Coupan Data found successfully.', service: findService });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};
exports.getAllfeedback = async (req, res) => {
    try {
        const data = await feedback.find().populate('userId');
        if (data.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(201).json({ message: "feedback Found", status: 200, data: data, });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong ", status: 500, data: err.message });
    }
}
exports.getById = async (req, res) => {
    try {
        const data = await feedback.findOne({ _id: req.params.id });
        if (!data) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(201).json({ message: "feedback Found", status: 200, data: data, });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message })
    }
}
exports.DeleteFeedback = async (req, res) => {
    try {
        const category = await feedback.findById(id);
        if (!category) {
            return res.status(404).json({ message: "feedback Not Found", status: 404, data: {} });
        } else {
            await feedback.findByIdAndDelete(category._id);
            return res.status(200).json({ message: "feedback Deleted Successfully !" });
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: "Deleted " })
    }
}
exports.createMainCategory = async (req, res) => {
    try {
        let findCategory = await mainCategory.findOne({ name: req.body.name });
        if (findCategory) {
            return res.status(409).json({ message: "Service Category already exit.", status: 404, data: {} });
        } else {
            let fileUrl;
            if (req.file) {
                fileUrl = req.file ? req.file.path : "";
            }
            const data = { name: req.body.name, image: fileUrl, status: req.body.status, notice: req.body.notice, };
            const category = await mainCategory.create(data);
            return res.status(200).json({ message: "Service Category add successfully.", status: 200, data: category });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getMainCategories = async (req, res) => {
    const categories = await mainCategory.find({});
    return res.status(201).json({ message: "Service Category Found", status: 200, data: categories, });
};
exports.updateMainCategory = async (req, res) => {
    const { id } = req.params;
    const category = await mainCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Service Category Not Found", status: 404, data: {} });
    }
    let fileUrl;
    if (req.file) {
        fileUrl = req.file ? req.file.path : "";
    }
    category.image = fileUrl || category.image;
    category.name = req.body.name || category.name;
    category.status = req.body.status || category.status;
    category.notice = req.body.notice || category.notice;
    let update = await category.save();
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeMainCategory = async (req, res) => {
    const { id } = req.params;
    const category = await mainCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Service Category Not Found", status: 404, data: {} });
    } else {
        await mainCategory.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Service Category Deleted Successfully !" });
    }
};

exports.addBannerforMainCategory = async (req, res) => {
    try {
        let fileUrl, isVideo = false;
        if (req.file) {
            fileUrl = req.file ? req.file.path : "";
        }

        const data = {
            mainCategoryId: req.body.mainCategoryId,
            image: fileUrl,
            colour: req.body.colour,
            desc: req.body.desc,
            status: req.body.status,
            position: req.body.position,
            video: req.body.video,
        };

        if (req.body.video) {
            isVideo = true;
        }

        data.isVideo = isVideo;

        const bannerData = await MainCategoryBanner.create(data);

        return res.status(200).json({ status: 200, message: "Banner is Added", data: bannerData });
    } catch (err) {
        console.error(err);
        return res.status(501).json({ status: 501, message: "Server error.", data: {} });
    }
};

exports.getBannerforMainCategory = async (req, res) => {
    try {
        const Banner = await MainCategoryBanner.find();
        if (Banner.length == 0) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "All banner Data found successfully.", data: Banner })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};

exports.getBannerByPositionforMainCategory = async (req, res) => {
    try {
        const position = req.query.position;
        if (!["TOP", "MID", "BOTTOM", "MB"].includes(position)) {
            return res.status(400).json({ status: 400, message: "Invalid position" });
        }
        const banners = await MainCategoryBanner.find({ position });

        if (banners.length === 0) {
            return res.status(404).json({ status: 404, message: "No data found for the specified position", data: {} });
        }
        if (banners.length === 1) {
            return res.status(200).json({ status: 200, message: "Banner found successfully.", data: banners[0] });
        }

        return res.status(200).json({ status: 200, message: "Banners found successfully.", data: banners });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 500, message: "Server error.", data: {} });
    }
};

exports.getBannerforMainCategoryByPosition = async (req, res) => {
    try {
        const mainCategoryId = req.params.mainCategoryId;
        const position = req.query.position;
        if (!["TOP", "MID", "BOTTOM", "MB"].includes(position)) {
            return res.status(400).json({ status: 400, message: "Invalid position" });
        }
        const banners = await MainCategoryBanner.find({ position: position, mainCategoryId: mainCategoryId });

        if (banners.length === 0) {
            return res.status(404).json({ status: 404, message: "No data found for the specified position", data: [] });
        }

        return res.status(200).json({ status: 200, message: "Banners found successfully.", position: position, data: banners });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 500, message: "Server error.", data: [] });
    }
};

exports.getMainCategoryBannerById = async (req, res) => {
    try {
        const Banner = await MainCategoryBanner.findById({ _id: req.params.id });
        if (!Banner) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
        return res.status(200).json({ status: 200, message: "Data found successfully.", data: Banner })
    } catch (err) {
        console.log(err);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};

exports.getMainCategoryBannersBySearch = async (req, res) => {
    try {
        const {
            mainCategoryId,
            position,
            status,
            search,
            fromDate,
            toDate,
            page,
            limit,
        } = req.query;

        let query = {};

        if (mainCategoryId) {
            query.mainCategoryId = mainCategoryId;
        }

        if (position) {
            query.position = position;
        }

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { "position": { $regex: search, $options: "i" } },
                { "colour": { $regex: search, $options: "i" } },
                { "desc": { $regex: search, $options: "i" } },
            ];
        }

        if (fromDate && !toDate) {
            query.createdAt = { $gte: fromDate };
        }

        if (!fromDate && toDate) {
            query.createdAt = { $lte: toDate };
        }

        if (fromDate && toDate) {
            query.$and = [
                { createdAt: { $gte: fromDate } },
                { createdAt: { $lte: toDate } },
            ];
        }

        let options = {
            page: Number(page) || 1,
            limit: Number(limit) || 15,
            sort: { createdAt: -1 },
            populate: ('mainCategoryId'),
        };

        let data = await MainCategoryBanner.paginate(query, options);

        return res.status(200).json({
            status: 200,
            message: "Banner data found.",
            data: data,
        });
    } catch (err) {
        return res.status(500).send({
            msg: "Internal server error",
            error: err.message,
        });
    }
};

exports.mainCategoryDeleteBanner = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const mainCategoryBanner = await MainCategoryBanner.findById(bannerId);

        if (!mainCategoryBanner) {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }

        await MainCategoryBanner.findByIdAndDelete(bannerId);

        return res.status(200).json({ status: 200, message: "Banner deleted successfully.", data: {} });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, message: "Server error.", data: {} });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const findMainCategory = await mainCategory.findById({ _id: req.body.mainCategoryId });
        if (!findMainCategory) {
            return res.status(404).json({ message: "mainCategory Not Found", status: 404, data: {} });
        } else {
            let findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, name: req.body.name });
            if (findCategory) {
                return res.status(409).json({ message: "Category already exists with this.", status: 404, data: {} });
            } else {
                let fileUrl;
                if (req.file) {
                    fileUrl = req.file ? req.file.path : "";
                }
                const data = {
                    name: req.body.name,
                    mainCategoryId: findMainCategory._id,
                    status: req.body.status,
                    notice: req.body.notice,
                    image: fileUrl,
                    colour: req.body.colour,
                };

                const category = await Category.create(data);
                return res.status(200).json({ message: "Service Category added successfully.", status: 200, data: category });
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.getCategories = async (req, res) => {
    const mainCategoryId = req.params.mainCategoryId
    const findMainCategory = await mainCategory.findById({ _id: mainCategoryId });
    if (!findMainCategory) {
        return res.status(404).json({ message: "mainCategory Not Found", status: 404, data: {} });
    } else {
        let findCategory = await Category.find({ mainCategoryId: findMainCategory._id }).populate('mainCategoryId', 'name')
        if (findCategory.length > 0) {
            return res.status(200).json({ message: "Category Found", status: 200, data: findCategory, });
        } else {
            return res.status(404).json({ message: "Category not Found", status: 404, data: {}, });
        }
    }
};
exports.getAllCategories = async (req, res) => {
    let findCategory = await Category.find().populate('mainCategoryId', 'name')
    if (findCategory.length > 0) {
        return res.status(200).json({ message: "Category Found", status: 200, data: findCategory, });
    } else {
        return res.status(404).json({ message: "Category not Found", status: 404, data: {}, });
    }
}
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const findCategory = await Category.findById(id);
    if (!findCategory) {
        return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    }
    if (req.body.mainCategoryId != (null || undefined)) {
        const findMainCategory = await mainCategory.findById({ _id: req.body.mainCategoryId });
        if (!findMainCategory) {
            return res.status(404).json({ message: "mainCategory Not Found", status: 404, data: {} });
        }
    }
    let fileUrl;
    if (req.file) {
        fileUrl = req.file ? req.file.path : "";
    }
    let obj = {
        name: req.body.name || findCategory.name,
        mainCategoryId: req.body.mainCategoryId || findCategory.mainCategoryId,
        image: fileUrl || findCategory.image,
        status: req.body.status || findCategory.status,
        notice: req.body.notice || findCategory.notice,
        colour: req.body.colour || findCategory.colour
    }
    let update = await Category.findByIdAndUpdate({ _id: findCategory._id }, { $set: obj }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeCategory = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    } else {
        await Category.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Sub Category Deleted Successfully !" });
    }
};

exports.createSubCategory = async (req, res) => {
    try {
        const findMainCategory = await mainCategory.findById({ _id: req.body.mainCategoryId });
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        } else {
            let findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.body.categoryId });
            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            } else {
                let findSubCategory = await subCategory.findOne({ mainCategoryId: findMainCategory._id, categoryId: findCategory._id, name: req.body.name });
                if (findSubCategory) {
                    return res.status(409).json({ message: "Sub Category already exit.", status: 404, data: {} });
                } else {
                    let fileUrl;
                    if (req.file) {
                        fileUrl = req.file ? req.file.path : "";
                    }
                    const data = { mainCategoryId: findMainCategory._id, categoryId: findCategory._id, name: req.body.name, image: fileUrl, description: req.body.description, colourPicker: req.body.colourPicker, status: req.body.status };
                    const category = await subCategory.create(data);
                    return res.status(200).json({ message: "Sub Category add successfully.", status: 200, data: category });
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getSubCategories = async (req, res) => {
    const findMainCategory = await mainCategory.findById({ _id: req.params.mainCategoryId });
    if (!findMainCategory) {
        return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
    } else {
        let findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.params.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        } else {
            let findSubCategory = await subCategory.find({ mainCategoryId: findMainCategory._id, categoryId: findCategory._id, }).populate('mainCategoryId', 'name').populate('categoryId', 'name')
            if (findSubCategory.length > 0) {
                return res.status(200).json({ message: "Sub Category Found", status: 200, data: findSubCategory, });
            } else {
                return res.status(201).json({ message: "Sub Category not Found", status: 404, data: {}, });
            }
        }
    }
};
exports.getAllSubCategories = async (req, res) => {
    let findSubCategory = await subCategory.find().populate('mainCategoryId', 'name').populate('categoryId', 'name')
    if (findSubCategory.length > 0) {
        return res.status(200).json({ message: "Sub Category Found", status: 200, data: findSubCategory, });
    } else {
        return res.status(201).json({ message: "Sub Category not Found", status: 404, data: {}, });
    }
};
exports.updateSubCategory = async (req, res) => {
    const { id } = req.params;
    const findSubCategory = await subCategory.findById(id);
    if (!findSubCategory) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    }
    if (req.body.mainCategoryId != (null || undefined)) {
        const findMainCategory = await mainCategory.findById({ _id: req.body.mainCategoryId });
        if (!findMainCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
    }
    if (req.body.categoryId != (null || undefined)) {
        let findCategory = await Category.findOne({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
    }
    let fileUrl;
    if (req.file) {
        fileUrl = req.file ? req.file.path : "";
    }
    let obj = {
        name: req.body.name || findSubCategory.name,
        mainCategoryId: req.body.mainCategoryId || findSubCategory.mainCategoryId,
        categoryId: req.body.categoryId || findSubCategory.categoryId,
        status: req.body.status || findSubCategory.status,
        colourPicker: req.body.colourPicker || findSubCategory.colourPicker,
        description: req.body.description || findSubCategory.description,
        image: fileUrl || findSubCategory.image,

    }
    let update = await subCategory.findByIdAndUpdate({ _id: findSubCategory._id }, { $set: obj }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeSubCategory = async (req, res) => {
    const { id } = req.params;
    const category = await subCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    } else {
        await subCategory.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Sub Category Deleted Successfully !" });
    }
};
exports.createItemSubCategory = async (req, res) => {
    try {
        let findCategory = await Category.findOne({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        } else {
            let findSubCategory = await itemSubCategory.findOne({ categoryId: findCategory._id, name: req.body.name });
            if (findSubCategory) {
                return res.status(409).json({ message: "Item Sub Category already exit.", status: 404, data: {} });
            } else {
                const data = { categoryId: findCategory._id, name: req.body.name };
                const category = await itemSubCategory.create(data);
                return res.status(200).json({ message: "Item Sub Category add successfully.", status: 200, data: category });
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.updateItemSubCategory = async (req, res) => {
    const { id } = req.params;
    const findSubCategory = await itemSubCategory.findById(id);
    if (!findSubCategory) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    }
    if (req.body.categoryId != (null || undefined)) {
        let findCategory = await Category.findOne({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
    }
    let obj = {
        name: req.body.name || findSubCategory.name,
        categoryId: req.body.categoryId || findSubCategory.categoryId,
    }
    let update = await itemSubCategory.findByIdAndUpdate({ _id: findSubCategory._id }, { $set: obj }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeItemSubCategory = async (req, res) => {
    const { id } = req.params;
    const category = await itemSubCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
    } else {
        await itemSubCategory.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Sub Category Deleted Successfully !" });
    }
};
exports.createItem = async (req, res) => {
    try {
        const findCategory = await Category.findById({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        } else {
            let findItemSubCategory = await itemSubCategory.findOne({ categoryId: findCategory._id, _id: req.body.itemSubCategoryId });
            if (!findItemSubCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            } else {
                let findSubCategory = await item.findOne({ categoryId: findCategory._id, itemSubCategoryId: findItemSubCategory._id, name: req.body.name });
                if (findSubCategory) {
                    return res.status(409).json({ message: "Item already exit.", status: 404, data: {} });
                } else {
                    const data = { categoryId: findCategory._id, itemSubCategoryId: findItemSubCategory._id, name: req.body.name, price: req.body.price };
                    const category = await item.create(data);
                    return res.status(200).json({ message: "Item add successfully.", status: 200, data: category });
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getItem = async (req, res) => {
    try {
        const findCategory = await Category.findById({ _id: req.params.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        } else {
            let findItemSubCategory = await itemSubCategory.findOne({ categoryId: findCategory._id, _id: req.params.itemSubCategoryId });
            if (!findItemSubCategory) {
                return res.status(404).json({ message: "Sub Category Not Found", status: 404, data: {} });
            } else {
                let findSubCategory = await item.find({ categoryId: findCategory._id, itemSubCategoryId: findItemSubCategory._id, })
                if (findSubCategory.length > 0) {
                    return res.status(200).json({ message: "Item Found", status: 200, data: findSubCategory, });
                } else {
                    return res.status(201).json({ message: "Item not Found", status: 404, data: {}, });
                }
            }
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const findSubCategory = await item.findById(id);
    if (!findSubCategory) {
        return res.status(404).json({ message: "Item Not Found", status: 404, data: {} });
    }
    let findItemSubCategory, findCategory;
    if (req.body.categoryId != (null || undefined)) {
        findCategory = await Category.findById({ _id: req.body.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }
    }
    if (req.body.itemSubCategoryId != (null || undefined)) {
        findItemSubCategory = await itemSubCategory.findOne({ _id: req.body.itemSubCategoryId });
        if (!findItemSubCategory) {
            return res.status(404).json({ message: "Item sub Category Not Found", status: 404, data: {} });
        }
    }
    let obj = {
        name: req.body.name || findSubCategory.name,
        categoryId: req.body.categoryId || findSubCategory.categoryId,
        itemSubCategoryId: req.body.itemSubCategoryId || findSubCategory.itemSubCategoryId,
        price: req.body.price || findSubCategory.price,
    }
    let update = await item.findByIdAndUpdate({ _id: findSubCategory._id }, { $set: obj }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeItem = async (req, res) => {
    const { id } = req.params;
    const category = await item.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Item Not Found", status: 404, data: {} });
    } else {
        await item.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Item Deleted Successfully !" });
    }
};
exports.createService1 = async (req, res) => {
    try {
        const { mainCategoryId, categoryId, subCategoryId, size, title, description, timeInMin, isAddOnServices, variations, status } = req.body;

        const findMainCategory = await mainCategory.findById(mainCategoryId);
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        let findCategory;
        if (categoryId) {
            findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: categoryId });
            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            }
        }

        if (size) {
            const finSize = await Size.findOne({ _id: size });
            if (!finSize) {
                return res.status(404).json({ message: "size Not Found", status: 404, data: {} });
            }
        }

        const existingService = await service.findOne({
            title: req.body.title,
            mainCategoryId: findMainCategory._id,
            type: req.body.type,
            size: req.body.size,
        });

        if (existingService) {
            return res.status(409).json({ message: "Service already exists.", status: 409, data: {} });
        }

        const findSubCategories = [];
        if (subCategoryId && Array.isArray(subCategoryId)) {
            for (const subId of subCategoryId) {
                const findSubCategory = await subCategory.findOne({
                    _id: subId,
                    mainCategoryId: findMainCategory._id,
                    categoryId: findCategory ? findCategory._id : null,
                });

                if (!findSubCategory) {
                    return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
                }

                findSubCategories.push(findSubCategory);
            }
        }

        const variationsWithDiscounts = variations.map(variation => {
            const calculateDiscount = (originalPrice, discountPrice) => {
                if (originalPrice && discountPrice) {
                    let discount = ((originalPrice - discountPrice) / originalPrice) * 100;
                    discount = Math.max(discount, 0);
                    discount = Math.round(discount);
                    return discount;
                }
                return 0;
            };

            return {
                ...variation,
                oneTimediscount: calculateDiscount(variation.oneTimeoriginalPrice, variation.oneTimediscountPrice),
                Monthlydiscount: calculateDiscount(variation.MonthlyoriginalPrice, variation.MonthlydiscountPrice),
                threeMonthdiscount: calculateDiscount(variation.threeMonthoriginalPrice, variation.threeMonthdiscountPrice),
                sixMonthdiscount: calculateDiscount(variation.sixMonthoriginalPrice, variation.sixMonthdiscountPrice),
                twelveMonthdiscount: calculateDiscount(variation.twelveMonthoriginalPrice, variation.twelveMonthdiscountPrice),
            };
        });

        let totalTime;
        if (timeInMin > 60) {
            const hours = Math.floor(timeInMin / 60);
            const minutes = timeInMin % 60;
            totalTime = `${hours} hr ${minutes} min`;
        } else {
            const minutes = timeInMin % 60;
            totalTime = `00 hr ${minutes} min`;
        }

        const data = {
            mainCategoryId: findMainCategory._id,
            categoryId: findCategory ? findCategory._id : null,
            subCategoryId: findSubCategories.map(subCategory => subCategory._id),
            size,
            title,
            description,
            timeInMin,
            totalTime,
            variations: variationsWithDiscounts,
            images: req.files ? req.files.map(file => ({ img: file.path })) : [],
            type: 'Service',
            status: status,
            isAddOnServices: isAddOnServices,
        };

        const Service = await service.create(data);

        return res.status(200).json({ message: "Service added successfully.", status: 200, data: Service });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.createService = async (req, res) => {
    try {
        const { mainCategoryId, categoryId, subCategoryId, size, title, description, timeInMin, isAddOnServices, variations, status } = req.body;

        const findMainCategory = await mainCategory.findById(mainCategoryId);
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        let findCategory;
        if (categoryId) {
            findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: categoryId });
            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            }
        }

        if (size) {
            const finSize = await Size.findOne({ _id: size });
            if (!finSize) {
                return res.status(404).json({ message: "Size Not Found", status: 404, data: {} });
            }
        }

        const existingService = await service.findOne({
            title: req.body.title,
            mainCategoryId: findMainCategory._id,
            type: req.body.type,
            size: req.body.size,
        });

        if (existingService) {
            return res.status(409).json({ message: "Service already exists.", status: 409, data: {} });
        }

        const findSubCategories = [];
        if (subCategoryId && Array.isArray(subCategoryId)) {
            for (const subId of subCategoryId) {
                const findSubCategory = await subCategory.findOne({
                    _id: subId,
                    mainCategoryId: findMainCategory._id,
                    categoryId: findCategory ? findCategory._id : null,
                });

                if (!findSubCategory) {
                    return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
                }

                findSubCategories.push(findSubCategory);
            }
        }

        const calculateDiscount = (originalPrice, discountPrice) => {
            if (originalPrice && discountPrice) {
                let discount = ((originalPrice - discountPrice) / originalPrice) * 100;
                discount = Math.max(discount, 0);
                discount = Math.round(discount);
                return discount;
            }
            return 0;
        };

        const variationsWithDiscounts = [];
        for (const variation of variations) {
            if (variation.size) {
                const sizeExists = await Size.findOne({ _id: variation.size });
                if (!sizeExists) {
                    return res.status(404).json({ message: `Size Not Found for variation`, status: 404, data: {} });
                }
            }

            variationsWithDiscounts.push({
                ...variation,
                oneTimediscount: calculateDiscount(variation.oneTimeoriginalPrice, variation.oneTimediscountPrice),
                Monthlydiscount: calculateDiscount(variation.MonthlyoriginalPrice, variation.MonthlydiscountPrice),
                threeMonthdiscount: calculateDiscount(variation.threeMonthoriginalPrice, variation.threeMonthdiscountPrice),
                sixMonthdiscount: calculateDiscount(variation.sixMonthoriginalPrice, variation.sixMonthdiscountPrice),
                twelveMonthdiscount: calculateDiscount(variation.twelveMonthoriginalPrice, variation.twelveMonthdiscountPrice),
            });
        }

        let totalTime;
        if (timeInMin > 60) {
            const hours = Math.floor(timeInMin / 60);
            const minutes = timeInMin % 60;
            totalTime = `${hours} hr ${minutes} min`;
        } else {
            const minutes = timeInMin % 60;
            totalTime = `00 hr ${minutes} min`;
        }

        const data = {
            mainCategoryId: findMainCategory._id,
            categoryId: findCategory ? findCategory._id : null,
            subCategoryId: findSubCategories.map(subCategory => subCategory._id),
            size,
            title,
            description,
            timeInMin,
            totalTime,
            variations: variationsWithDiscounts,
            images: req.files ? req.files.map(file => ({ img: file.path })) : [],
            type: 'Service',
            status: status,
            isAddOnServices: isAddOnServices,
        };

        const Service = await service.create(data);

        return res.status(200).json({ message: "Service added successfully.", status: 200, data: Service });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
// exports.getService = async (req, res) => {
//     try {
//         const findMainCategory = await mainCategory.findById({ _id: req.params.mainCategoryId });
//         if (!findMainCategory) {
//             return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
//         } else {
//             let findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.params.categoryId });
//             if (!findCategory) {
//                 return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
//             } else {
//                 let findSubCategory = await subCategory.findOne({ _id: req.params.subCategoryId, mainCategoryId: findMainCategory._id, categoryId: findCategory._id, })
//                 if (!findSubCategory) {
//                     return res.status(404).json({ message: "sub category Not Found", status: 404, data: {} });
//                 } else {
//                     let findService = await service.find({ mainCategoryId: findMainCategory._id, categoryId: findCategory._id, subCategoryId: findSubCategory._id, });
//                     if (findService.length > 0) {
//                         return res.status(201).json({ message: "Service Found", status: 200, data: findService, });
//                     } else {
//                         return res.status(404).json({ message: "Service not found.", status: 404, data: {} });
//                     }
//                 }
//             }
//         }
//     } catch (error) {
//         return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
//     }
// };

exports.getService = async (req, res) => {
    try {
        const findMainCategory = await mainCategory.findById({ _id: req.params.mainCategoryId });
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        const findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.params.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }

        const findSubCategory = await subCategory.findOne({
            _id: req.params.subCategoryId, mainCategoryId: findMainCategory._id, categoryId: findCategory._id,
        });

        if (!findSubCategory) {
            return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
        }

        const userCart = await Cart.findOne({ userId: req.user.id });

        const findService = await service.find({
            mainCategoryId: findMainCategory._id,
            categoryId: findCategory._id,
            subCategoryId: findSubCategory._id,
            status: true,
        }).populate('subCategoryId categoryId mainCategoryId')
            .populate({
                path: 'variations.size',
                model: 'Size'
            });
        console.log("findServices", findService);
        let servicesWithCartInfo = [];

        let totalDiscountActive = 0;
        let totalDiscount = 0;
        let totalDiscountPrice = 0;
        let totalQuantityInCart = 0;
        let totalIsInCart = 0;
        let totalOriginalPrice = 0;

        if (findService.length > 0 && userCart) {
            servicesWithCartInfo = findService.map((product) => {
                const cartItem = userCart.services.find((item) => item.serviceId.equals(product._id));

                let totalDiscountPriceItem = 0;
                let isInCartItem = 0;

                if (cartItem) {
                    isInCartItem = 1;
                    if (product.type === "Package") {
                        totalDiscountPriceItem = product.discountActive && product.discountPrice ? product.discountPrice * cartItem.quantity : 0;
                    } else {
                        totalDiscountPriceItem = product.discountActive && product.discount ? product.discount * cartItem.quantity : 0;
                    }

                    totalOriginalPrice += (product.originalPrice || 0) * (cartItem.quantity || 0);
                }

                const countDiscountItem = product.discountActive ? 1 : 0;

                totalDiscountActive += countDiscountItem;
                totalDiscount += (product.discountActive && product.discount) ? (product.discount * (cartItem?.quantity || 0)) : 0;

                if (product.discountActive && product.discountPrice) {
                    totalDiscountPrice += product.discountPrice * (cartItem?.quantity || 0);
                }

                totalQuantityInCart += cartItem ? cartItem.quantity : 0;
                totalIsInCart += isInCartItem;

                return {
                    ...product.toObject(),
                    isInCart: cartItem ? true : false,
                    quantityInCart: cartItem ? cartItem.quantity : 0,
                    totalDiscountPrice: totalDiscountPriceItem,
                    countDiscount: countDiscountItem,
                };
            });
        } else if (findService.length > 0) {
            servicesWithCartInfo = findService.map((product) => ({
                ...product.toObject(),
                isInCart: false,
                quantityInCart: 0,
                totalDiscountPrice: product.discountActive && product.type !== "Package" ? (product.discount || 0) : 0,
                countDiscount: product.discountActive ? 1 : 0,
                totalOriginalPrice: product.originalPrice || 0,
            }));
        }

        if (findService.length > 0) {
            const response = {
                message: "Services Found",
                status: 200,
                data: servicesWithCartInfo,
                totalDiscountActive,
                totalDiscount,
                totalDiscountPrice,
                totalQuantityInCart,
                totalIsInCart,
                totalOriginalPrice,
            };
            return res.status(200).json(response);
        } else {
            return res.status(404).json({ message: "Services not found.", status: 404, data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.getServiceWithoutSubCategory = async (req, res) => {
    try {
        const findMainCategory = await mainCategory.findById({ _id: req.params.mainCategoryId });
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        const findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.params.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }

        // const findSubCategory = await subCategory.findOne({
        //     _id: req.params.subCategoryId, mainCategoryId: findMainCategory._id, categoryId: findCategory._id,
        // });

        // if (!findSubCategory) {
        //     return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
        // }

        const userCart = await Cart.findOne({ userId: req.user.id });

        const findService = await service.find({
            mainCategoryId: findMainCategory._id,
            categoryId: findCategory._id,
            // subCategoryId: findSubCategory._id,
            status: true,
        }).populate('subCategoryId categoryId mainCategoryId')
            .populate({
                path: 'variations.size',
                model: 'Size'
            });

        console.log("findServices", findService);
        let servicesWithCartInfo = [];

        let totalDiscountActive = 0;
        let totalDiscount = 0;
        let totalDiscountPrice = 0;
        let totalQuantityInCart = 0;
        let totalIsInCart = 0;
        let totalOriginalPrice = 0;

        if (findService.length > 0 && userCart) {
            servicesWithCartInfo = findService.map((product) => {
                const cartItem = userCart.services.find((item) => item.serviceId.equals(product._id));

                let totalDiscountPriceItem = 0;
                let isInCartItem = 0;

                if (cartItem) {
                    isInCartItem = 1;
                    if (product.type === "Package") {
                        totalDiscountPriceItem = product.discountActive && product.discountPrice ? product.discountPrice * cartItem.quantity : 0;
                    } else {
                        totalDiscountPriceItem = product.discountActive && product.discount ? product.discount * cartItem.quantity : 0;
                    }

                    totalOriginalPrice += (product.originalPrice || 0) * (cartItem.quantity || 0);
                }

                const countDiscountItem = product.discountActive ? 1 : 0;

                totalDiscountActive += countDiscountItem;
                totalDiscount += (product.discountActive && product.discount) ? (product.discount * (cartItem?.quantity || 0)) : 0;

                if (product.discountActive && product.discountPrice) {
                    totalDiscountPrice += product.discountPrice * (cartItem?.quantity || 0);
                }

                totalQuantityInCart += cartItem ? cartItem.quantity : 0;
                totalIsInCart += isInCartItem;

                return {
                    ...product.toObject(),
                    isInCart: cartItem ? true : false,
                    quantityInCart: cartItem ? cartItem.quantity : 0,
                    totalDiscountPrice: totalDiscountPriceItem,
                    countDiscount: countDiscountItem,
                };
            });
        } else if (findService.length > 0) {
            servicesWithCartInfo = findService.map((product) => ({
                ...product.toObject(),
                isInCart: false,
                quantityInCart: 0,
                totalDiscountPrice: product.discountActive && product.type !== "Package" ? (product.discount || 0) : 0,
                countDiscount: product.discountActive ? 1 : 0,
                totalOriginalPrice: product.originalPrice || 0,
            }));
        }

        if (findService.length > 0) {
            const response = {
                message: "Services Found",
                status: 200,
                data: servicesWithCartInfo,
                totalDiscountActive,
                totalDiscount,
                totalDiscountPrice,
                totalQuantityInCart,
                totalIsInCart,
                totalOriginalPrice,
            };
            return res.status(200).json(response);
        } else {
            return res.status(404).json({ message: "Services not found.", status: 404, data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.getAllService = async (req, res) => {
    try {
        const findService = await service.find().populate('subCategoryId categoryId mainCategoryId')
            .populate({
                path: 'variations.size',
                model: 'Size'
            });

        if (findService.length > 0) {
            return res.status(200).json({
                message: "Services found.",
                status: 200,
                data: findService,
            });
        } else {
            return res.status(404).json({ message: "Services not found.", status: 404, data: {} });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const foundService = await service.findById(id).populate('mainCategoryId').populate('categoryId').populate('subCategoryId')

        if (!foundService) {
            return res.status(404).json({ message: "Service not found.", status: 404, data: {} });
        }

        return res.status(200).json({
            message: "Service found.",
            status: 200,
            data: foundService,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.removeService = async (req, res) => {
    const { id } = req.params;
    const category = await service.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
    } else {
        const deletedPackage = await service.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Service Deleted Successfully !" });
    }
};
exports.updateIsAddOnServices = async (req, res) => {
    try {
        const serviceId = req.params.id;
        const { isAddOnServices } = req.body;

        const checkService = await service.findById(serviceId);

        if (!checkService) {
            return res.status(404).json({ message: 'Service not found' });
        }

        checkService.isAddOnServices = isAddOnServices;

        await checkService.save();

        return res.status(200).json({ status: 200, message: 'isAddOnServices updated successfully', data: checkService });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
};
exports.createPackage1 = async (req, res) => {
    try {
        let { mainCategoryId, categoryId, subCategoryId, title, packageType, description, originalPrice, discountActive, discountPrice, timeInMin, selectedCount, services, addOnServices, validUpTo, status } = req.body;

        const findMainCategory = await mainCategory.findById(mainCategoryId);
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        let findCategory;
        const findSubCategories = [];

        if (categoryId) {
            findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: categoryId });
            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            }
        } else {
            const existingPackage = await Package.findOne({
                title,
                mainCategoryId: findMainCategory._id,
                type: "Package",
                packageType,
            });

            if (existingPackage) {
                return res.status(409).json({ message: "Package already exists.", status: 409, data: {} });
            }
        }

        if (subCategoryId && Array.isArray(subCategoryId)) {
            for (const currentSubCategoryId of subCategoryId) {
                const findSubCategory = await subCategory.findOne({
                    _id: currentSubCategoryId,
                    mainCategoryId: findMainCategory._id,
                    categoryId: findCategory ? findCategory._id : null,
                });

                if (!findSubCategory) {
                    return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
                }

                findSubCategories.push(findSubCategory);
            }
        }
        let discount = 0, totalTime;
        let totalServiceOriginalPrice = 0;
        let totalServiceDiscountPrice = 0;
        let totalServiceTime = 0;
        // let totalServiceDiscount = 0;

        // if (!originalPrice) {
        //     if (services && Array.isArray(services)) {
        //         for (const serviceId of services) {
        //             const findService = await service.findById(serviceId);
        //             if (!findService) {
        //                 return res.status(404).json({ message: `Service Not Found`, status: 404, data: {} });
        //             }
        //             console.log("findService", findService);
        //             totalServiceOriginalPrice += findService.originalPrice || 0;
        //             if (!req.body.timeInMin) {
        //                 totalServiceTime += findService.timeInMin || 0;
        //             }
        //             if (findService.discountActive) {
        //                 totalServiceDiscountPrice += findService.discountPrice || 0;
        //                 discount = findService.discount || 0;
        //                 discountActive = findService.discountActive || false;
        //             } else {
        //                 totalServiceDiscountPrice += findService.originalPrice || 0;
        //                 discount = 0;
        //                 discountActive = false;
        //             }
        //         }
        //     }
        //     originalPrice = totalServiceOriginalPrice;
        //     discountPrice = totalServiceDiscountPrice;
        //     // timeInMin = totalServiceTime
        //     // discount = totalServiceDiscount;
        // }

        if (timeInMin > 60) {
            const hours = Math.floor(timeInMin / 60);
            const minutes = timeInMin % 60;
            totalTime = `${hours} hr ${minutes} min`;
        } else {
            const minutes = timeInMin % 60;
            totalTime = `00 hr ${minutes} min`;
        }

        let calculatedDiscount = 0;
        if (req.body.originalPrice) {
            if (discountActive === "true") {
                if (originalPrice && discountPrice) {
                    calculatedDiscount = Math.max(((originalPrice - discountPrice) / originalPrice) * 100, 0);
                    calculatedDiscount = Math.round(calculatedDiscount);
                }
            }
        }

        if (discountActive === "true") {
            if (originalPrice && totalServiceDiscountPrice) {
                calculatedDiscount = Math.max(((totalServiceDiscountPrice) / originalPrice) * 100, 0);
                calculatedDiscount = Math.round(calculatedDiscount);
            }
        }

        let images = [];
        if (req.files) {
            images = req.files.map(file => ({ img: file.path }));
        }

        const packageData = {
            mainCategoryId: findMainCategory._id,
            categoryId: findCategory ? findCategory._id : null,
            subCategoryId: findSubCategories.map(subCategory => subCategory._id),
            title,
            description,
            originalPrice: originalPrice || totalServiceOriginalPrice,
            discountActive: discountActive,
            discount: calculatedDiscount || discount,
            discountPrice: discountPrice || totalServiceDiscountPrice,
            totalTime,
            timeInMin: totalServiceTime || timeInMin,
            images,
            type: "Package",
            packageType,
            selected: packageType ? true : false,
            selectedCount: packageType === "Basic" || "Elite" ? selectedCount || 0 : 0,
            services: [],
            addOnServices: [],
            status,
            validUpTo,
        };
        console.log("packageData", packageData);

        if (services && Array.isArray(services)) {
            for (const serviceId of services) {
                const findService = await service.findById(serviceId);
                if (!findService) {
                    return res.status(404).json({ message: `Service Not Found`, status: 404, data: {} });
                }
                packageData.services.push({ service: findService._id });
            }
        }

        if (addOnServices && Array.isArray(addOnServices)) {
            for (const serviceId of addOnServices) {
                const findService = await service.findById(serviceId);
                if (!findService) {
                    return res.status(404).json({ message: `Service Not Found`, status: 404, data: {} });
                }
                packageData.addOnServices.push({ service: findService._id });
            }
        }

        const category = await Package.create(packageData);

        return res.status(200).json({ message: "Package added successfully.", status: 200, data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.createPackage = async (req, res) => {
    try {
        let { mainCategoryId, categoryId, subCategoryId, size, title, packageType, description, timeInMin, services, addOnServices, validUpTo, status, variations } = req.body;

        const findMainCategory = await mainCategory.findById(mainCategoryId);
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        let findCategory;
        const findSubCategories = [];

        if (categoryId) {
            findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: categoryId });
            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            }
        } else {
            const existingPackage = await Package.findOne({
                title,
                mainCategoryId: findMainCategory._id,
                type: "Package",
                packageType,
            });

            if (existingPackage) {
                return res.status(409).json({ message: "Package already exists.", status: 409, data: {} });
            }
        }

        if (subCategoryId && Array.isArray(subCategoryId)) {
            for (const currentSubCategoryId of subCategoryId) {
                const findSubCategory = await subCategory.findOne({
                    _id: currentSubCategoryId,
                    mainCategoryId: findMainCategory._id,
                    categoryId: findCategory ? findCategory._id : null,
                });

                if (!findSubCategory) {
                    return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
                }

                findSubCategories.push(findSubCategory);
            }
        }

        let totalTime;
        let totalTimeInMin = 0;

        if (timeInMin && timeInMin > 0) {
            const hours = Math.floor(timeInMin / 60);
            const minutes = timeInMin % 60;
            totalTime = `${hours} hr ${minutes} min`;
        } else {
            let totalServiceTimeInMin = 0;
            for (const serviceId of services) {
                const findService = await service.findById(serviceId);
                if (findService) {
                    totalServiceTimeInMin += findService.timeInMin || 0;
                    totalTimeInMin += findService.timeInMin || 0;
                }
            }
            const hours = Math.floor(totalServiceTimeInMin / 60);
            const minutes = totalServiceTimeInMin % 60;
            totalTime = `${hours} hr ${minutes} min`;
        }

        let images = [];
        if (req.files) {
            images = req.files.map(file => ({ img: file.path }));
        }

        if (!variations || !Array.isArray(variations) || variations.length === 0) {
            variations = [];

            for (const serviceId of services) {
                const findService = await service.findById(serviceId);

                if (findService) {
                    let walksPerDay = 0;
                    let daysPerWeek = 0;
                    let oneTimeoriginalPrice = 0;
                    let oneTimediscountActive;
                    let oneTimediscountPrice = 0;
                    let MonthlyoriginalPrice = 0;
                    let MonthlydiscountActive;
                    let MonthlydiscountPrice = 0;
                    let threeMonthoriginalPrice = 0;
                    let threeMonthdiscountActive;
                    let threeMonthdiscountPrice = 0;
                    let sixMonthoriginalPrice = 0;
                    let sixMonthdiscountActive;
                    let sixMonthdiscountPrice = 0;
                    let twelveMonthoriginalPrice = 0;
                    let twelveMonthdiscountActive;
                    let twelveMonthdiscountPrice = 0;

                    if (findService.variations && Array.isArray(findService.variations) && findService.variations.length > 0) {
                        const firstVariation = findService.variations[0];

                        walksPerDay = firstVariation.walksPerDay || 0;
                        daysPerWeek = firstVariation.daysPerWeek || 0;
                        oneTimeoriginalPrice = firstVariation.oneTimeoriginalPrice || 0;
                        oneTimediscountPrice = firstVariation.oneTimediscountPrice || 0;
                        oneTimediscountActive = firstVariation.oneTimediscountActive || false;
                        MonthlyoriginalPrice = firstVariation.MonthlyoriginalPrice || 0;
                        MonthlydiscountPrice = firstVariation.MonthlydiscountPrice || 0;
                        MonthlydiscountActive = firstVariation.MonthlydiscountActive || false;
                        threeMonthoriginalPrice = firstVariation.threeMonthoriginalPrice || 0;
                        threeMonthdiscountPrice = firstVariation.threeMonthdiscountPrice || 0;
                        threeMonthdiscountActive = firstVariation.threeMonthdiscountActive || false;
                        sixMonthoriginalPrice = firstVariation.sixMonthoriginalPrice || 0;
                        sixMonthdiscountPrice = firstVariation.sixMonthdiscountPrice || 0;
                        sixMonthdiscountActive = firstVariation.sixMonthdiscountActive || false;
                        twelveMonthoriginalPrice = firstVariation.twelveMonthoriginalPrice || 0;
                        twelveMonthdiscountPrice = firstVariation.twelveMonthdiscountPrice || 0;
                        twelveMonthdiscountActive = firstVariation.twelveMonthdiscountActive || false;
                    } else {
                        walksPerDay = findService.walksPerDay || 0;
                        daysPerWeek = findService.daysPerWeek || 0;
                        oneTimeoriginalPrice = firstVariation.oneTimeoriginalPrice || 0;
                        oneTimediscountPrice = firstVariation.oneTimediscountPrice || 0;
                        oneTimediscountActive = firstVariation.oneTimediscountActive || false;
                        MonthlyoriginalPrice = findService.MonthlyoriginalPrice || 0;
                        MonthlydiscountPrice = findService.MonthlydiscountPrice || 0;
                        MonthlydiscountActive = findService.MonthlydiscountActive || false;
                        threeMonthoriginalPrice = findService.threeMonthoriginalPrice || 0;
                        threeMonthdiscountPrice = findService.threeMonthdiscountPrice || 0;
                        threeMonthdiscountActive = findService.threeMonthdiscountActive || false;
                        sixMonthoriginalPrice = findService.sixMonthoriginalPrice || 0;
                        sixMonthdiscountPrice = findService.sixMonthdiscountPrice || 0;
                        sixMonthdiscountActive = findService.sixMonthdiscountActive || false;
                        twelveMonthoriginalPrice = findService.twelveMonthoriginalPrice || 0;
                        twelveMonthdiscountPrice = findService.twelveMonthdiscountPrice || 0;
                        twelveMonthdiscountActive = findService.twelveMonthdiscountActive || false;
                    }

                    variations.push({
                        size: findService.size,
                        walksPerDay,
                        daysPerWeek,
                        oneTimeoriginalPrice,
                        oneTimediscountPrice,
                        oneTimediscountActive,
                        MonthlyoriginalPrice,
                        MonthlydiscountActive,
                        MonthlydiscountPrice,
                        threeMonthoriginalPrice,
                        threeMonthdiscountActive,
                        threeMonthdiscountPrice,
                        sixMonthoriginalPrice,
                        sixMonthdiscountActive,
                        sixMonthdiscountPrice,
                        twelveMonthoriginalPrice,
                        twelveMonthdiscountActive,
                        twelveMonthdiscountPrice,
                    });
                }
            }
        }

        // const variationsWithDiscounts = variations.map(variation => {
        //     const calculateDiscount = (originalPrice, discountPrice) => {
        //         if (originalPrice && discountPrice) {
        //             let discount = ((originalPrice - discountPrice) / originalPrice) * 100;
        //             discount = Math.max(discount, 0);
        //             discount = Math.round(discount);
        //             return discount;
        //         }
        //         return 0;
        //     };

        //     return {
        //         ...variation,
        //         oneTimediscount: calculateDiscount(variation.oneTimeoriginalPrice, variation.oneTimediscountPrice),
        //         Monthlydiscount: calculateDiscount(variation.MonthlyoriginalPrice, variation.MonthlydiscountPrice),
        //         threeMonthdiscount: calculateDiscount(variation.threeMonthoriginalPrice, variation.threeMonthdiscountPrice),
        //         sixMonthdiscount: calculateDiscount(variation.sixMonthoriginalPrice, variation.sixMonthdiscountPrice),
        //         twelveMonthdiscount: calculateDiscount(variation.twelveMonthoriginalPrice, variation.twelveMonthdiscountPrice),
        //     };
        // });

        const variationsWithDiscounts = [];
        for (const variation of variations) {
            if (variation.size) {
                const sizeExists = await Size.findOne({ _id: variation.size });
                if (!sizeExists) {
                    return res.status(404).json({ message: `Size Not Found for variation`, status: 404, data: {} });
                }
            }

            const calculateDiscount = (originalPrice, discountPrice) => {
                if (originalPrice && discountPrice) {
                    let discount = ((originalPrice - discountPrice) / originalPrice) * 100;
                    discount = Math.max(discount, 0);
                    discount = Math.round(discount);
                    return discount;
                }
                return 0;
            };

            variationsWithDiscounts.push({
                ...variation,
                oneTimediscount: calculateDiscount(variation.oneTimeoriginalPrice, variation.oneTimediscountPrice),
                Monthlydiscount: calculateDiscount(variation.MonthlyoriginalPrice, variation.MonthlydiscountPrice),
                threeMonthdiscount: calculateDiscount(variation.threeMonthoriginalPrice, variation.threeMonthdiscountPrice),
                sixMonthdiscount: calculateDiscount(variation.sixMonthoriginalPrice, variation.sixMonthdiscountPrice),
                twelveMonthdiscount: calculateDiscount(variation.twelveMonthoriginalPrice, variation.twelveMonthdiscountPrice),
            });
        }

        if (size) {
            const findSize = await Size.findOne({ _id: size });
            if (!findSize) {
                return res.status(404).json({ message: "size Not Found", status: 404, data: {} });
            }
        }

        let preparedAddOnServices = [];
        if (addOnServices && Array.isArray(addOnServices)) {
            preparedAddOnServices = addOnServices.map(serviceId => ({ service: serviceId }));
        }

        const selectedCountArray = Array.isArray(req.body.selectedCount) ? req.body.selectedCount : [req.body.selectedCount];

        const preparedServices = services.map((serviceId, index) => ({
            service: serviceId,
            selectedCount: selectedCountArray[index] || 0,
            selected: selectedCountArray[index] ? true : false,
        }));

        const packageData = {
            mainCategoryId: findMainCategory._id,
            categoryId: findCategory ? findCategory._id : null,
            subCategoryId: findSubCategories.map(subCategory => subCategory._id),
            size,
            title,
            description,
            totalTime,
            timeInMin: timeInMin || totalTimeInMin,
            images,
            type: "Package",
            packageType,
            services: /*services.map(serviceId => ({ service: serviceId }))*/ preparedServices,
            addOnServices: preparedAddOnServices,
            status,
            validUpTo,
            variations: variationsWithDiscounts,
        };

        const createdPackage = await Package.create(packageData);

        return res.status(200).json({ message: "Package added successfully.", status: 200, data: createdPackage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.getPackage = async (req, res) => {
    try {
        const findMainCategory = await mainCategory.findById({ _id: req.params.mainCategoryId });
        if (!findMainCategory) {

            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        const findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.params.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }

        const findSubCategory = await subCategory.findOne({
            _id: req.params.subCategoryId, mainCategoryId: findMainCategory._id, categoryId: findCategory._id,
        });

        if (!findSubCategory) {
            return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
        }

        const userCart = await Cart.findOne({ userId: req.user.id });

        const findService = await Package.find({
            mainCategoryId: findMainCategory._id,
            categoryId: findCategory._id,
            subCategoryId: findSubCategory._id,
        }).populate({
            path: 'location.city',
            model: 'City',
        }).populate('services.service',).populate('addOnServices.service');;

        let servicesWithCartInfo = [];

        let totalDiscountActive = 0;
        let totalDiscount = 0;
        let totalDiscountPrice = 0;
        let totalQuantityInCart = 0;
        let totalIsInCart = 0;
        let totalOriginalPrice = 0;

        if (findService.length > 0 && userCart) {
            servicesWithCartInfo = findService.map((product) => {
                const cartItem = userCart.packages.find((item) => item.packageId.equals(product._id));

                let totalDiscountPriceItem = 0;
                let isInCartItem = 0;

                if (cartItem !== undefined) {
                    isInCartItem = 1;
                    if (product.type === "Package") {
                        totalDiscountPriceItem = product.discountActive && product.discountPrice ? product.discountPrice * cartItem.quantity : 0;
                    } else {
                        totalDiscountPriceItem = product.discountActive && product.discount ? product.discount * cartItem.quantity : 0;
                    }
                    totalOriginalPrice += (product.originalPrice || 0) * (cartItem.quantity || 0);
                }

                const countDiscountItem = product.discountActive ? 1 : 0;

                totalDiscountActive += countDiscountItem;
                totalDiscount += (product.discountActive && product.discount) ? (product.discount * (cartItem?.quantity || 0)) : 0;

                if (product.discountActive && product.discountPrice) {
                    totalDiscountPrice += product.discountPrice * (cartItem?.quantity || 0);
                }

                totalQuantityInCart += cartItem ? cartItem.quantity : 0;
                totalIsInCart += isInCartItem;

                return {
                    ...product.toObject(),
                    isInCart: isInCartItem === 1,
                    quantityInCart: cartItem ? cartItem.quantity : 0,
                    totalDiscountPrice: totalDiscountPriceItem,
                    countDiscount: countDiscountItem,
                };
            });
        } else if (findService.length > 0) {
            servicesWithCartInfo = findService.map((product) => ({
                ...product.toObject(),
                isInCart: false,
                quantityInCart: 0,
                totalDiscountPrice: product.discountActive && product.type !== "Package" ? (product.discount || 0) : 0,
                countDiscount: product.discountActive ? 1 : 0,
                totalOriginalPrice: product.originalPrice || 0,
            }));
        }

        if (findService.length > 0) {
            const response = {
                message: "Services Found",
                status: 200,
                data: servicesWithCartInfo,
                totalDiscountActive,
                totalDiscount,
                totalDiscountPrice,
                totalQuantityInCart,
                totalIsInCart,
                totalOriginalPrice,
            };
            return res.status(200).json(response);
        } else {
            return res.status(404).json({ message: "Services not found.", status: 404, data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.getPackageithoutSubCategory = async (req, res) => {
    try {
        const findMainCategory = await mainCategory.findById({ _id: req.params.mainCategoryId });
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        const findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.params.categoryId });
        if (!findCategory) {
            return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
        }

        // const findSubCategory = await subCategory.findOne({
        //     _id: req.params.subCategoryId, mainCategoryId: findMainCategory._id, categoryId: findCategory._id,
        // });

        // if (!findSubCategory) {
        //     return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
        // }

        const userCart = await Cart.findOne({ userId: req.user.id });

        const findService = await Package.find({
            mainCategoryId: findMainCategory._id,
            categoryId: findCategory._id,
            // subCategoryId: findSubCategory._id,
            // status: true,
        }).populate({
            path: 'location.city',
            model: 'City',
        }).exec();
        console.log("findServices", findService);
        let servicesWithCartInfo = [];

        let totalDiscountActive = 0;
        let totalDiscount = 0;
        let totalDiscountPrice = 0;
        let totalQuantityInCart = 0;
        let totalIsInCart = 0;
        let totalOriginalPrice = 0;

        if (findService.length > 0 && userCart) {
            servicesWithCartInfo = findService.map((product) => {
                const cartItem = userCart.services.find((item) => item.serviceId.equals(product._id));

                let totalDiscountPriceItem = 0;
                let isInCartItem = 0;

                if (cartItem) {
                    isInCartItem = 1;
                    if (product.type === "Package") {
                        totalDiscountPriceItem = product.discountActive && product.discountPrice ? product.discountPrice * cartItem.quantity : 0;
                    } else {
                        totalDiscountPriceItem = product.discountActive && product.discount ? product.discount * cartItem.quantity : 0;
                    }

                    totalOriginalPrice += (product.originalPrice || 0) * (cartItem.quantity || 0);
                }

                const countDiscountItem = product.discountActive ? 1 : 0;

                totalDiscountActive += countDiscountItem;
                totalDiscount += (product.discountActive && product.discount) ? (product.discount * (cartItem?.quantity || 0)) : 0;

                if (product.discountActive && product.discountPrice) {
                    totalDiscountPrice += product.discountPrice * (cartItem?.quantity || 0);
                }

                totalQuantityInCart += cartItem ? cartItem.quantity : 0;
                totalIsInCart += isInCartItem;

                return {
                    ...product.toObject(),
                    isInCart: cartItem ? true : false,
                    quantityInCart: cartItem ? cartItem.quantity : 0,
                    totalDiscountPrice: totalDiscountPriceItem,
                    countDiscount: countDiscountItem,
                };
            });
        } else if (findService.length > 0) {
            servicesWithCartInfo = findService.map((product) => ({
                ...product.toObject(),
                isInCart: false,
                quantityInCart: 0,
                totalDiscountPrice: product.discountActive && product.type !== "Service" ? (product.discount || 0) : 0,
                countDiscount: product.discountActive ? 1 : 0,
                totalOriginalPrice: product.originalPrice || 0,
            }));
        }

        if (findService.length > 0) {
            const response = {
                message: "Services Found",
                status: 200,
                data: servicesWithCartInfo,
                totalDiscountActive,
                totalDiscount,
                totalDiscountPrice,
                totalQuantityInCart,
                totalIsInCart,
                totalOriginalPrice,
            };
            return res.status(200).json(response);
        } else {
            return res.status(404).json({ message: "Package not found.", status: 404, data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.getAllPackage = async (req, res) => {
    try {
        const findService = await Package.find().populate('mainCategoryId', 'name').populate('categoryId', 'name').populate('subCategoryId', 'name')
            .populate({
                path: 'location.city',
                model: 'City',
            }).populate('services.service',).populate('addOnServices.service');

        if (findService.length > 0) {
            return res.status(200).json({
                message: "Services found.",
                status: 200,
                data: findService,
            });
        } else {
            return res.status(44).json({ message: "Services not found.", status: 404, data: {} });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.getPackageById = async (req, res) => {
    try {
        const { id } = req.params;

        const foundService = await Package.findById(id).populate('mainCategoryId', 'name').populate('categoryId', 'name').populate('subCategoryId', 'name')
            .populate({
                path: 'location.city',
                model: 'City',
            }).populate('services.service',).populate('addOnServices.service');;


        if (!foundService) {
            return res.status(404).json({ message: "Package not found.", status: 404, data: {} });
        }

        return res.status(200).json({
            message: "Service found.",
            status: 200,
            data: foundService,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};
exports.removePackage = async (req, res) => {
    const { id } = req.params;
    const package = await Package.findById(id);
    if (!package) {
        return res.status(404).json({ message: "Package Not Found", status: 404, data: {} });
    } else {
        const deletedPackage = await Package.findByIdAndDelete(package._id);
        return res.status(200).json({ message: "Package Deleted Successfully!" });
    }
};
exports.updatePackage1 = async (req, res) => {
    try {
        const { id } = req.params;
        let findPackage = await Package.findById(id);
        if (!findPackage) {
            return res.status(404).json({ message: "Service Not Found", status: 404, data: {} });
        } else {
            let findCategory, findSubCategory, discountPrice = 0, discount = 0, totalTime;
            if (req.body.categoryId != (null || undefined)) {
                findCategory = await Category.findById({ _id: req.body.categoryId });
                if (!findCategory) {
                    return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
                }
            }
            if (req.body.subCategoryId != (null || undefined)) {
                findSubCategory = await subCategory.findOne({ categoryId: findCategory._id || findPackage.categoryId, _id: req.body.subCategoryId });
                if (!findSubCategory) {
                    return res.status(404).json({ message: "Sub Category not found.", status: 404, data: {} });
                }
            }
            if (req.body.timeInMin != (null || undefined)) {
                if (req.body.timeInMin > 60) {
                    const hours = Math.floor(req.body.timeInMin / 60);
                    const minutes = req.body.timeInMin % 60;
                    totalTime = `${hours} hr ${minutes} min`
                } else {
                    const minutes = req.body.timeInMin % 60;
                    totalTime = `00 hr ${minutes} min`
                }
            }
            if (req.body.discountActive == true) {
                discountPrice = (req.body.price) - (((req.body.price) * (req.body.discount)) / 100);
                discount = req.body.discount;
            } else {
                discountPrice = findPackage.discountPrice;
                discount = findPackage.discount;
            }
            const data = {
                categoryId: findCategory._id || findPackage.categoryId,
                subCategoryId: findSubCategory._id || findPackage.subCategoryId,
                name: req.body.name || findPackage.name,
                totalTime: totalTime || findPackage.totalTime,
                timeInMin: req.body.timeInMin || findPackage.timeInMin,
                originalPrice: req.body.originalPrice || findPackage.originalPrice,
                discountPrice: discountPrice || findPackage.discountPrice,
                discount: discount || findPackage.discount,
                discountActive: req.body.discountActive || findPackage.discountActive,
                E4uSafety: req.body.E4uSafety || findPackage.E4uSafety,
                thingsToKnow: req.body.thingsToKnow || findPackage.thingsToKnow,
                E4uSuggestion: req.body.E4uSuggestion || findPackage.E4uSuggestion,
                type: req.body.type || findPackage.type,
                discription: req.body.discription || findPackage.discription,
                status: req.body.status
            };
            const category = await Package.findByIdAndUpdate({ _id: findPackage._id }, { $set: data }, { new: true });
            return res.status(200).json({ message: "Service add successfully.", status: 200, data: category });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.updatePackage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Package ID is required", status: 400 });
        }

        const {
            mainCategoryId, categoryId, subCategoryId, size, title, packageType, description, timeInMin, services, addOnServices, validUpTo, status, variations, selectedCount
        } = req.body;

        const existingPackage = await Package.findById(id);
        if (!existingPackage) {
            return res.status(404).json({ message: "Package not found", status: 404 });
        }

        const findMainCategory = await mainCategory.findById(mainCategoryId);
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404 });
        }

        let findCategory = null;
        if (categoryId) {
            findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: categoryId });
            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404 });
            }
        }

        const findSubCategories = [];
        if (subCategoryId && Array.isArray(subCategoryId) && subCategoryId.length > 0) {
            const subCategories = await subCategory.find({
                _id: { $in: subCategoryId },
                mainCategoryId: findMainCategory._id,
                categoryId: findCategory ? findCategory._id : null,
            });
            if (subCategories.length !== subCategoryId.length) {
                return res.status(404).json({ message: "One or more Subcategories Not Found", status: 404 });
            }
            findSubCategories.push(...subCategories);
        }

        let totalTime = '';
        if (!timeInMin || timeInMin <= 0) {
            let totalServiceTimeInMin = 0;
            for (const serviceId of services) {
                const findService = await service.findById(serviceId);
                if (findService) {
                    totalServiceTimeInMin += findService.timeInMin || 0;
                }
            }
            const hours = Math.floor(totalServiceTimeInMin / 60);
            const minutes = totalServiceTimeInMin % 60;
            totalTime = `${hours} hr ${minutes} min`;
        } else {
            const hours = Math.floor(timeInMin / 60);
            const minutes = timeInMin % 60;
            totalTime = `${hours} hr ${minutes} min`;
        }

        let images = [];
        if (req.files) {
            images = req.files.map(file => ({ img: file.path }));
        }

        let updatedVariations = [];
        if (!variations || !Array.isArray(variations) || variations.length === 0) {
            for (const serviceId of services) {
                const findService = await service.findById(serviceId);

                if (findService) {
                    updatedVariations.push({
                        size: findService.size,
                        walksPerDay: findService.walksPerDay || 0,
                        daysPerWeek: findService.daysPerWeek || 0,
                        oneTimeoriginalPrice: findService.oneTimeoriginalPrice || 0,
                        oneTimediscountActive: findService.oneTimediscountActive || false,
                        oneTimediscountPrice: findService.oneTimediscountPrice || 0,
                        MonthlyoriginalPrice: findService.MonthlyoriginalPrice || 0,
                        MonthlydiscountPrice: findService.MonthlydiscountPrice || 0,
                        MonthlydiscountActive: findService.MonthlydiscountActive || false,
                        threeMonthoriginalPrice: findService.threeMonthoriginalPrice || 0,
                        threeMonthdiscountPrice: findService.threeMonthdiscountPrice || 0,
                        threeMonthdiscountActive: findService.threeMonthdiscountActive || false,
                        sixMonthoriginalPrice: findService.sixMonthoriginalPrice || 0,
                        sixMonthdiscountPrice: findService.sixMonthdiscountPrice || 0,
                        sixMonthdiscountActive: findService.sixMonthdiscountActive || false,
                        twelveMonthoriginalPrice: findService.twelveMonthoriginalPrice || 0,
                        twelveMonthdiscountPrice: findService.twelveMonthdiscountPrice || 0,
                        twelveMonthdiscountActive: findService.twelveMonthdiscountActive || false,
                    });
                }
            }
        } else {
            updatedVariations = variations;
        }

        // const variationsWithDiscounts = updatedVariations.map(variation => ({
        //     ...variation,
        //     oneTimediscount: calculateDiscount(variation.oneTimeoriginalPrice, variation.oneTimediscountPrice),
        //     Monthlydiscount: calculateDiscount(variation.MonthlyoriginalPrice, variation.MonthlydiscountPrice),
        //     threeMonthdiscount: calculateDiscount(variation.threeMonthoriginalPrice, variation.threeMonthdiscountPrice),
        //     sixMonthdiscount: calculateDiscount(variation.sixMonthoriginalPrice, variation.sixMonthdiscountPrice),
        //     twelveMonthdiscount: calculateDiscount(variation.twelveMonthoriginalPrice, variation.twelveMonthdiscountPrice),
        // }));

        const variationsWithDiscounts = [];
        for (const variation of updatedVariations) {
            if (variation.size) {
                const sizeExists = await Size.findOne({ _id: variation.size });
                if (!sizeExists) {
                    return res.status(404).json({ message: `Size Not Found for variation`, status: 404 });
                }
            }

            const calculateDiscount = (originalPrice, discountPrice) => {
                if (originalPrice && discountPrice) {
                    let discount = ((originalPrice - discountPrice) / originalPrice) * 100;
                    discount = Math.max(discount, 0);
                    discount = Math.round(discount);
                    return discount;
                }
                return 0;
            };

            variationsWithDiscounts.push({
                ...variation,
                oneTimediscount: calculateDiscount(variation.oneTimeoriginalPrice, variation.oneTimediscountPrice),
                Monthlydiscount: calculateDiscount(variation.MonthlyoriginalPrice, variation.MonthlydiscountPrice),
                threeMonthdiscount: calculateDiscount(variation.threeMonthoriginalPrice, variation.threeMonthdiscountPrice),
                sixMonthdiscount: calculateDiscount(variation.sixMonthoriginalPrice, variation.sixMonthdiscountPrice),
                twelveMonthdiscount: calculateDiscount(variation.twelveMonthoriginalPrice, variation.twelveMonthdiscountPrice),
            });
        }

        let preparedAddOnServices = [];
        if (addOnServices && Array.isArray(addOnServices)) {
            preparedAddOnServices = addOnServices.map(serviceId => ({ service: serviceId }));
        }

        const selectedCountArray = Array.isArray(selectedCount) ? selectedCount : [selectedCount];
        const preparedServices = services.map((serviceId, index) => ({
            service: serviceId,
            selectedCount: selectedCountArray[index] || 0,
            selected: selectedCountArray[index] > 0,
        }));

        existingPackage.mainCategoryId = findMainCategory._id;
        existingPackage.categoryId = findCategory ? findCategory._id : null;
        existingPackage.subCategoryId = findSubCategories.map(subCategory => subCategory._id);
        existingPackage.size = size;
        existingPackage.title = title;
        existingPackage.description = description;
        existingPackage.totalTime = totalTime;
        existingPackage.images = images;
        existingPackage.packageType = packageType;
        existingPackage.services = preparedServices;
        existingPackage.addOnServices = preparedAddOnServices;
        existingPackage.validUpTo = validUpTo;
        existingPackage.status = status;
        existingPackage.variations = variationsWithDiscounts;

        const updatedPackage = await existingPackage.save();

        return res.status(200).json({ message: "Package updated successfully", status: 200, data: updatedPackage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", status: 500 });
    }
};
function calculateDiscount(originalPrice, discountPrice) {
    if (originalPrice && discountPrice) {
        let discount = ((originalPrice - discountPrice) / originalPrice) * 100;
        discount = Math.max(discount, 0);
        discount = Math.round(discount);
        return discount;
    }
    return 0;
}
exports.updateImagesinPackage = async (req, res) => {
    const { id } = req.params;
    let findPackage = await Package.findById({ _id: id });
    if (!findPackage) {
        return res.status(409).json({ message: "Package not found.", status: 409, data: {} });
    } else {
        let fileUrl = [];
        if (req.files) {
            for (let i = 0; i < req.files.length; i++) {
                let obj = {
                    img: req.files[i] ? req.files[i].path : ""
                };
                fileUrl.push(obj)
            }
        }
        let obj = {
            images: fileUrl || findPackage.images
        }
        let update = await Package.findByIdAndUpdate({ _id: findPackage._id }, { $set: obj }, { new: true });
        return res.status(200).json({ message: "Updated Successfully", data: update });
    }
};
exports.addOffer = async (req, res) => {
    try {
        if (!req.body.userId) {
            return res.status(400).json({ status: 400, message: "User ID is required" });
        }

        const vendorData = await User.findOne({ _id: req.body.userId });
        if (!vendorData) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        let obj = {
            userId: req.body.userId,
            title: req.body.title,
            description: req.body.description,
            color: req.body.color,
            amount: req.body.amount,
        };

        if (req.body.categoryId) {
            const findCategory = await mainCategory.findById(req.body.categoryId);
            if (!findCategory) {
                return res.status(404).json({ status: 404, message: "Category not found" });
            }
            obj.categoryId = findCategory._id;
        }

        if (req.body.serviceId) {
            const findService = await service.findById(req.body.serviceId);
            if (!findService) {
                return res.status(404).json({ status: 404, message: "Service not found" });
            }
            obj.serviceId = findService._id;
        }

        if (req.body.expirationDate) {
            const d = new Date(req.body.expirationDate);
            obj.expirationDate = d.toISOString();
        }

        if (req.body.activationDate) {
            const de = new Date(req.body.activationDate);
            obj.activationDate = de.toISOString();
        }

        if (req.file) {
            obj.image = req.file.path;
        }

        let couponCode = await reffralCode();
        obj.couponCode = couponCode;
        obj.type = req.body.type


        const saveStore = await offer(obj).save();

        if (saveStore) {
            return res.status(200).json({ status: 200, message: 'Offer added successfully', data: saveStore });
        } else {
            return res.status(500).json({ status: 500, message: 'Failed to add offer' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Server error: " + error.message });
    }
};

exports.listOffer = async (req, res) => {
    try {
        let vendorData = await User.findOne({ _id: req.user._id });
        if (!vendorData) {
            return res.status(404).send({ status: 404, message: "User not found" });
        } else {
            let findService = await offer.find({});
            if (findService.length == 0) {
                return res.status(404).send({ status: 404, message: "Data not found" });
            } else {
                res.json({ status: 200, message: 'offer Data found successfully.', service: findService });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};
exports.getUserOffer = async (req, res) => {
    try {
        let vendorData = await User.findOne({ _id: req.user._id });
        if (!vendorData) {
            return res.status(404).send({ status: 404, message: "User not found" });
        } else {
            let findService = await offer.find({ $and: [{ $or: [{ userId: vendorData._id }, { type: "user" }] }] })
                .populate('categoryId');

            if (findService.length == 0) {
                return res.status(404).send({ status: 404, message: "Data not found" });
            } else {
                res.json({ status: 200, message: 'Offer Data found successfully.', service: findService });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};

exports.getOtherOffer = async (req, res) => {
    try {
        let vendorData = await User.findOne({ _id: req.user._id });
        if (!vendorData) {
            return res.status(404).send({ status: 404, message: "User not found" });
        } else {
            let findService = await offer.find({ $and: [{ $or: [{ userId: vendorData._id }, { type: "other" }] }] });
            if (findService.length == 0) {
                return res.status(404).send({ status: 404, message: "Data not found" });
            } else {
                res.json({ status: 200, message: 'Offer Data found successfully.', service: findService });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};
exports.createFreeService = async (req, res) => {
    try {
        let findUser = await User.findById({ _id: req.body.userId });
        if (!findUser) {
            return res.status(404).json({ message: "user not found.", status: 404, data: {} });
        }
        let findService = await service.findById({ _id: req.body.serviceId });
        if (!findService) {
            return res.status(404).json({ message: "Service not found.", status: 404, data: {} });
        }
        let findFreeService = await freeService.findOne({ userId: req.body.userId, serviceId: findService._id, used: false });
        if (findFreeService) {
            return res.status(409).json({ message: "This free service already exit.", status: 404, data: {} });
        } else {
            const data = {
                userId: req.body.userId,
                serviceId: findService._id,
                used: false
            };
            const findCharge = await freeService.create(data);
            return res.status(200).json({ message: "free service add successfully.", status: 200, data: findCharge });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getFreeServices = async (req, res) => {
    const findFreeService = await freeService.find({}).populate([{ path: 'userId', select: 'fullName firstName lastName' }, { path: 'serviceId', select: 'name price totalTime' }]);
    return res.status(201).json({ message: "Free Service Found", status: 200, data: findFreeService, });
};
exports.updateFreeServices = async (req, res) => {
    const { id } = req.params;
    const findCharge = await freeService.findById(id);
    if (!findCharge) {
        return res.status(404).json({ message: "Free service Not Found", status: 404, data: {} });
    }
    let findUser = await User.findById({ _id: req.body.userId });
    if (!findUser) {
        return res.status(404).json({ message: "user not found.", status: 404, data: {} });
    }
    let findService = await service.findById({ _id: req.body.serviceId });
    if (!findService) {
        return res.status(404).json({ message: "Service not found.", status: 404, data: {} });
    }
    let findFreeService = await freeService.findOne({ _id: { $ne: findCharge._id }, userId: req.body.userId, serviceId: findService._id, used: false });
    if (findFreeService) {
        return res.status(409).json({ message: "This free service already exit.", status: 404, data: {} });
    }
    let data = {
        userId: req.body.userId || findCharge.userId,
        serviceId: req.body.serviceId || findCharge.serviceId,
        used: false || findCharge.used,
    }
    const update = await freeService.findByIdAndUpdate({ _id: findCharge._id }, { $set: data }, { new: true });
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeFreeServices = async (req, res) => {
    const { id } = req.params;
    const findCharge = await freeService.findById(id);
    if (!findCharge) {
        return res.status(404).json({ message: "freeService Not Found", status: 404, data: {} });
    } else {
        await freeService.findByIdAndDelete(findCharge._id);
        return res.status(200).json({ message: "freeService Deleted Successfully !" });
    }
};
exports.getOrders = async (req, res) => {
    try {
        const data = await orderModel.find().populate('services.serviceId');
        if (data.length > 0) {
            return res.status(200).json({ message: "All orders", data: data });
        } else {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};
exports.assignOrder = async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.user._id, });
        if (data) {
            const data1 = await User.findOne({ _id: req.params.userId, });
            if (data1) {
                const data2 = await orderModel.findById({ _id: req.params.orderId });
                if (data2) {
                    let update = await orderModel.findByIdAndUpdate({ _id: data2._id }, { $set: { partnerId: data1._id, status: "assigned" } }, { new: true })
                    return res.status(200).json({ status: 200, message: "Order assign  successfully.", data: update });
                } else {
                    return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
            } else {
                return res.status(404).json({ status: 404, message: "No data found", data: {} });
            }
        } else {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.updateImagesinService = async (req, res) => {
    const { id } = req.params;
    let findService = await service.findById({ _id: id });
    if (!findService) {
        return res.status(409).json({ message: "Service not found.", status: 409, data: {} });
    } else {
        let fileUrl = [];
        if (req.files) {
            for (let i = 0; i < req.files.length; i++) {
                let obj = {
                    img: req.files[i] ? req.files[i].path : ""
                };
                fileUrl.push(obj)
            }
        }
        let obj = {
            images: fileUrl || findService.images
        }
        let update = await service.findByIdAndUpdate({ _id: findService._id }, { $set: obj }, { new: true });
        return res.status(200).json({ message: "Updated Successfully", data: update });
    }
};
exports.getTopSellingService = async (req, res) => {
    let findCategory = await Category.findById({ _id: req.params.categoryId });
    if (!findCategory) {
        return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    } else {
        let findSubCategory = await subCategory.findOne({ categoryId: findCategory._id, _id: req.params.subCategoryId });
        if (!findSubCategory) {
            return res.status(404).json({ message: "Sub Category not found.", status: 404, data: {} });
        } else {
            let findService = await service.find({ categoryId: findCategory._id, subCategoryId: findSubCategory._id, sellCount: [4, 5] })
            let top = {
                findService: findService
            }
            let findPremiumService = await service.find({ categoryId: findCategory._id, subCategoryId: findSubCategory._id, type: "Premium" }).sort({ sellCount: -1 });
            let findClassicService = await service.find({ categoryId: findCategory._id, subCategoryId: findSubCategory._id, type: "Classic" }).sort({ sellCount: -1 });
            let obj = {
                top: top,
                Premium: findPremiumService,
                Classic: findClassicService
            }
            return res.status(201).json({ message: "Service Found", status: 200, data: obj, });

        }
    }
};
exports.updateService1 = async (req, res) => {
    try {
        const { mainCategoryId, categoryId, subCategoryId, breedId, title, description, timeInMin, variations, images, rating, sellCount, useBy, selectedCount, selected, type, status, isAddOnServices } = req.body;
        const serviceId = req.params.id;

        const Service = await service.findById(serviceId);
        if (!Service) {
            return res.status(404).json({ message: "Service not found", status: 404, data: {} });
        }

        const findMainCategory = await mainCategory.findById(mainCategoryId);
        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        let findCategory;
        if (categoryId) {
            findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: categoryId });
            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            }
        }

        const findSubCategories = [];
        if (subCategoryId && Array.isArray(subCategoryId)) {
            for (const subId of subCategoryId) {
                const findSubCategory = await subCategory.findOne({
                    _id: subId,
                    mainCategoryId: findMainCategory._id,
                    categoryId: findCategory ? findCategory._id : null,
                });

                if (!findSubCategory) {
                    return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
                }

                findSubCategories.push(findSubCategory);
            }
        }

        const variationsWithDiscounts = variations.map(variation => {
            const calculateDiscount = (originalPrice, discountPrice) => {
                if (originalPrice && discountPrice) {
                    let discount = ((originalPrice - discountPrice) / originalPrice) * 100;
                    discount = Math.max(discount, 0);
                    discount = Math.round(discount);
                    return discount;
                }
                return 0;
            };

            return {
                ...variation,
                Monthlydiscount: calculateDiscount(variation.MonthlyoriginalPrice, variation.MonthlydiscountPrice),
                threeMonthdiscount: calculateDiscount(variation.threeMonthoriginalPrice, variation.threeMonthdiscountPrice),
                sixMonthdiscount: calculateDiscount(variation.sixMonthoriginalPrice, variation.sixMonthdiscountPrice),
                twelveMonthdiscount: calculateDiscount(variation.twelveMonthoriginalPrice, variation.twelveMonthdiscountPrice),
            };
        });

        let totalTime;
        if (timeInMin > 60) {
            const hours = Math.floor(timeInMin / 60);
            const minutes = timeInMin % 60;
            totalTime = `${hours} hr ${minutes} min`;
        } else {
            const minutes = timeInMin % 60;
            totalTime = `00 hr ${minutes} min`;
        }

        service.mainCategoryId = findMainCategory._id;
        service.categoryId = findCategory ? findCategory._id : null;
        service.subCategoryId = findSubCategories.map(subCategory => subCategory._id);
        service.breedId = breedId;
        service.title = title;
        service.description = description;
        service.timeInMin = timeInMin;
        service.totalTime = totalTime;
        service.variations = variationsWithDiscounts;
        service.images = images ? images.map(image => ({ img: image.path })) : [];
        service.rating = rating;
        service.sellCount = sellCount;
        service.useBy = useBy;
        service.selectedCount = selectedCount;
        service.selected = selected;
        service.type = type;
        service.status = status;
        service.isAddOnServices = isAddOnServices;

        await service.save();

        return res.status(200).json({ message: "Service updated successfully.", status: 200, data: service });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { mainCategoryId, categoryId, subCategoryId, size, title, description, timeInMin, variations, images, rating, sellCount, useBy, selectedCount, selected, type, status, isAddOnServices } = req.body;
        const serviceId = req.params.id;

        const Service = await service.findById(serviceId);
        if (!Service) {
            return res.status(404).json({ message: "Service not found", status: 404, data: {} });
        }
        let findMainCategory;
        if (mainCategoryId) {
            findMainCategory = await mainCategory.findById(mainCategoryId);
            if (!findMainCategory) {
                return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
            }
        }

        let findCategory;
        if (categoryId) {
            findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: categoryId });
            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            }
        }

        const findSubCategories = [];
        if (subCategoryId && Array.isArray(subCategoryId)) {
            for (const subId of subCategoryId) {
                const findSubCategory = await subCategory.findOne({
                    _id: subId,
                    mainCategoryId: findMainCategory._id,
                    categoryId: findCategory ? findCategory._id : null,
                });

                if (!findSubCategory) {
                    return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
                }

                findSubCategories.push(findSubCategory);
            }
        }

        // Update service fields based on provided request data
        if (mainCategoryId) Service.mainCategoryId = findMainCategory._id;
        if (categoryId) Service.categoryId = findCategory ? findCategory._id : null;
        if (subCategoryId) Service.subCategoryId = findSubCategories.map(subCategory => subCategory._id);
        if (size) Service.size = size;
        if (title) Service.title = title;
        if (description) Service.description = description;
        if (timeInMin) {
            Service.timeInMin = timeInMin;
            const hours = Math.floor(timeInMin / 60);
            const minutes = timeInMin % 60;
            Service.totalTime = `${hours} hr ${minutes} min`;
        }
        // if (variations) {
        //     const variationsWithDiscounts = variations.map(variation => {
        //         const calculateDiscount = (originalPrice, discountPrice) => {
        //             if (originalPrice && discountPrice) {
        //                 let discount = ((originalPrice - discountPrice) / originalPrice) * 100;
        //                 discount = Math.max(discount, 0);
        //                 discount = Math.round(discount);
        //                 return discount;
        //             }
        //             return 0;
        //         };

        //         return {
        //             ...variation,
        //             oneTimediscount: calculateDiscount(variation.oneTimeoriginalPrice, variation.oneTimediscountPrice),
        //             Monthlydiscount: calculateDiscount(variation.MonthlyoriginalPrice, variation.MonthlydiscountPrice),
        //             threeMonthdiscount: calculateDiscount(variation.threeMonthoriginalPrice, variation.threeMonthdiscountPrice),
        //             sixMonthdiscount: calculateDiscount(variation.sixMonthoriginalPrice, variation.sixMonthdiscountPrice),
        //             twelveMonthdiscount: calculateDiscount(variation.twelveMonthoriginalPrice, variation.twelveMonthdiscountPrice),
        //         };
        //     });
        //     Service.variations = variationsWithDiscounts;
        // }

        if (variations && Array.isArray(variations)) {
            const variationsWithDiscounts = [];
            for (const variation of variations) {
                if (variation.size) {
                    const sizeExists = await Size.findOne({ _id: variation.size });
                    if (!sizeExists) {
                        return res.status(404).json({ message: `Size Not Found for variation`, status: 404, data: {} });
                    }
                }

                const calculateDiscount = (originalPrice, discountPrice) => {
                    if (originalPrice && discountPrice) {
                        let discount = ((originalPrice - discountPrice) / originalPrice) * 100;
                        discount = Math.max(discount, 0);
                        discount = Math.round(discount);
                        return discount;
                    }
                    return 0;
                };

                variationsWithDiscounts.push({
                    ...variation,
                    oneTimediscount: calculateDiscount(variation.oneTimeoriginalPrice, variation.oneTimediscountPrice),
                    Monthlydiscount: calculateDiscount(variation.MonthlyoriginalPrice, variation.MonthlydiscountPrice),
                    threeMonthdiscount: calculateDiscount(variation.threeMonthoriginalPrice, variation.threeMonthdiscountPrice),
                    sixMonthdiscount: calculateDiscount(variation.sixMonthoriginalPrice, variation.sixMonthdiscountPrice),
                    twelveMonthdiscount: calculateDiscount(variation.twelveMonthoriginalPrice, variation.twelveMonthdiscountPrice),
                });
            }
            Service.variations = variationsWithDiscounts;
        }

        if (images && Array.isArray(images)) {
            Service.images = images.map(image => ({ img: image.path }));
        }
        if (rating) Service.rating = rating;
        if (sellCount) Service.sellCount = sellCount;
        if (useBy) Service.useBy = useBy;
        if (selectedCount) Service.selectedCount = selectedCount;
        if (selected !== undefined) Service.isSelected = selected;
        if (type) Service.type = type;
        if (status !== undefined) Service.status = status;
        if (isAddOnServices !== undefined) Service.isAddOnServices = isAddOnServices;

        // Save the updated Service
        await Service.save();

        return res.status(200).json({ message: "Service updated successfully.", status: 200, data: Service });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

const reffralCode = async () => {
    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 36)];
    }
    return OTP;
}
exports.getAllLeaves = async (req, res) => {
    try {
        const allLeaves = await Leave.find();
        res.json({ status: 200, message: ' All Leave data retrieved successfully', data: allLeaves });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to retrieve leave requests' });
    }
};
exports.approveLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const updatedLeave = await Leave.findByIdAndUpdate(leaveId, { status: 'approved' }, { new: true });
        res.json({ status: 200, message: 'Approved leave successfully', data: updatedLeave });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to approve leave' });
    }
};
exports.cancelLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const updatedLeave = await Leave.findByIdAndUpdate(leaveId, { status: 'cancelled' }, { new: true });
        res.json({ status: 200, message: 'Cancel Leave successfully', data: updatedLeave });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to cancel leave' });
    }
};
exports.getAllSPAgreements = async (req, res) => {
    try {
        const allSPAgreements = await SPAgreement.find();
        res.json({ status: 200, message: 'All SpAgreement data retrieved successfully', data: allSPAgreements });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to retrieve SP agreements' });
    }
};
exports.getSPAgreementById = async (req, res) => {
    const { id } = req.params;
    try {
        const spAgreement = await SPAgreement.findById(id);
        if (!spAgreement) {
            return res.status(404).json({ error: 'SP agreement not found' });
        }
        res.json({ status: 200, message: 'SpAgreement retrieved successfully', data: spAgreement });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to retrieve SP agreement' });
    }
};
exports.getAllTrainingVideos = async (req, res) => {
    try {
        const allTrainingVideos = await TrainingVideo.find();
        res.json({ status: 200, message: 'All traning Video retrieved successfully', data: allTrainingVideos });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to retrieve training videos' });
    }
};
exports.getTrainingVideoById = async (req, res) => {
    const { id } = req.params;
    try {
        const trainingVideo = await TrainingVideo.findById(id);
        if (!trainingVideo) {
            return res.status(404).json({ error: 'Training video not found' });
        }
        res.json({ status: 200, message: 'Traning Video retrieved successfully', data: trainingVideo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to retrieve training video' });
    }
};

exports.getAllReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find().populate('referrer');
        return res.status(200).json({ status: 200, data: referrals });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Failed to fetch referrals' });
    }
};

exports.getReferralById = async (req, res) => {
    try {
        const referralId = req.params.id;
        const referral = await Referral.findById(referralId).populate('referrer');

        if (!referral) {
            return res.status(404).json({ status: 500, error: 'Referral not found' });
        }

        return res.status(200).json({ status: 200, data: referral });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Failed to fetch referral' });
    }
};

exports.getAllConsentForms = async (req, res) => {
    try {
        const consentForms = await ConsentForm.find();
        return res.status(200).json({ message: 'All consent forms', data: consentForms });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to get consent forms' });
    }
};

exports.getConsentFormById = async (req, res) => {
    try {
        const consentForm = await ConsentForm.findById(req.params.id);
        if (!consentForm) {
            return res.status(404).json({ message: 'Consent form not found' });
        }
        return res.status(200).json({ message: 'Consent form found', data: consentForm });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to get consent form' });
    }
};


exports.updateMinimumCartAmount = async (req, res) => {
    const { newMinimumCartAmount } = req.body;

    try {
        const updatedCart = await MinimumCart.findOneAndUpdate(
            {},
            { minimumCartAmount: newMinimumCartAmount },
            { new: true, upsert: true }
        );

        if (!updatedCart) {
            return res.status(404).json({
                status: 404,
                message: "No documents were found for updating.",
                data: {}
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Minimum cart amount updated successfully",
            data: updatedCart
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            data: {}
        });
    }
};


exports.createCity = async (req, res) => {
    try {
        const { name, status } = req.body;

        const existingCity = await City.findOne({ name });

        if (existingCity) {
            return res.status(400).json({
                status: 400,
                message: 'City with the same name already exists',
            });
        }

        const newCity = new City({ name, status });

        const savedCity = await newCity.save();

        return res.status(201).json({
            status: 201,
            message: 'City created successfully',
            data: savedCity,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllCities = async (req, res) => {
    try {
        const cities = await City.find();

        return res.status(200).json({
            status: 200,
            message: 'Cities retrieved successfully',
            data: cities,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getCityById = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);

        if (!city) {
            return res.status(404).json({ message: 'City not found' });
        }

        return res.status(200).json({
            status: 200,
            message: 'City retrieved successfully',
            data: city,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCityById = async (req, res) => {
    try {
        const { name, status } = req.body;
        const cityId = req.params.id;

        const existingCity = await City.findById(cityId);

        if (!existingCity) {
            return res.status(404).json({
                status: 404,
                message: 'City not found',
            });
        }

        if (name && name !== existingCity.name) {
            const duplicateCity = await City.findOne({ name });

            if (duplicateCity) {
                return res.status(400).json({
                    status: 400,
                    message: 'City with the updated name already exists',
                });
            }
        }

        existingCity.name = name || existingCity.name;

        if (req.body.status !== undefined) {
            existingCity.status = status;
        }

        const updatedCity = await existingCity.save();

        return res.status(200).json({
            status: 200,
            message: 'City updated successfully',
            data: updatedCity,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCityById = async (req, res) => {
    try {
        const deletedCity = await City.findByIdAndDelete(req.params.id);

        if (!deletedCity) {
            return res.status(404).json({ message: 'City not found' });
        }

        return res.status(200).json({
            status: 200,
            message: 'City deleted successfully',
            data: deletedCity,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.createArea = async (req, res) => {
    try {
        const { name, status, cityId } = req.body;

        const existingCity = await City.findById(cityId);

        if (!existingCity) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid city ID',
            });
        }

        const existingArea = await Area.findOne({ name, city: cityId });

        if (existingArea) {
            return res.status(400).json({
                status: 400,
                message: 'Area with the same name already exists in the specified city',
            });
        }

        const newArea = new Area({
            name,
            city: cityId,
            status
        });

        const savedArea = await newArea.save();

        return res.status(201).json({
            status: 201,
            message: 'Area created successfully',
            data: savedArea,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllAreas = async (req, res) => {
    try {
        const areas = await Area.find().populate('city');

        return res.status(200).json({
            status: 200,
            message: 'Areas retrieved successfully',
            data: areas,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getAreaById = async (req, res) => {
    try {
        const area = await Area.findById(req.params.id).populate('city');

        if (!area) {
            return res.status(404).json({ message: 'Area not found' });
        }

        return res.status(200).json({
            status: 200,
            message: 'Area retrieved successfully',
            data: area,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getAreasByCityId = async (req, res) => {
    try {
        const cityId = req.params.cityId;

        const existingCity = await City.findById(cityId);

        if (!existingCity) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid city ID',
            });
        }

        const areas = await Area.find({ city: cityId });

        return res.status(200).json({
            status: 200,
            message: 'Areas retrieved successfully',
            data: areas,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateAreaById = async (req, res) => {
    try {
        const { name, cityId, status } = req.body;

        const existingCity = await City.findById(cityId);

        if (!existingCity) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid city ID',
            });
        }

        const existingArea = await Area.findOne({ name, city: cityId });

        if (existingArea) {
            return res.status(400).json({
                status: 400,
                message: 'Area with the same name already exists in the specified city',
            });
        }

        const updatedArea = await Area.findByIdAndUpdate(
            req.params.id,
            { name, city: cityId, status },
            { new: true }
        );

        if (!updatedArea) {
            return res.status(404).json({ message: 'Area not found' });
        }

        return res.status(200).json({
            status: 200,
            message: 'Area updated successfully',
            data: updatedArea,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteAreaById = async (req, res) => {
    try {
        const deletedArea = await Area.findByIdAndDelete(req.params.id);

        if (!deletedArea) {
            return res.status(404).json({ message: 'Area not found' });
        }

        return res.status(200).json({
            status: 200,
            message: 'Area deleted successfully',
            data: deletedArea,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.createTestimonial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }
        const { mainCategoryId, title, description } = req.body;

        if (mainCategoryId) {
            const category = await mainCategory.findById(mainCategoryId);
            if (!category) {
                return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
            }
        }
        const testimonial = new Testimonial({
            mainCategoryId,
            title,
            description,
            image: req.file.path,
        });

        const savedTestimonial = await testimonial.save();
        return res.status(201).json({ status: 201, data: savedTestimonial });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to create testimonial" });
    }
};

exports.getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        return res.status(200).json({ status: 200, data: testimonials });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to retrieve testimonials" });
    }
};

exports.getTestimonialById = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }
        return res.status(200).json({ status: 200, data: testimonial });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to retrieve testimonial" });
    }
};

exports.updateTestimonial = async (req, res) => {
    try {
        const testimonialId = req.params.id;
        const { mainCategoryId, title, description } = req.body;

        const updateFields = {
            mainCategoryId,
            title,
            description,
        };

        if (req.file) {
            updateFields.image = req.file.path;
        }

        if (mainCategoryId) {
            const category = await mainCategory.findById(mainCategoryId);
            if (!category) {
                return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
            }
        }

        const updatedTestimonial = await Testimonial.findByIdAndUpdate(
            testimonialId,
            updateFields,
            { new: true }
        );

        if (!updatedTestimonial) {
            return res.status(404).json({ message: "Testimonial not found", status: 404, data: {} });
        }

        return res.status(200).json({ status: 200, message: "Testimonial updated successfully", data: updatedTestimonial });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to update testimonial" });
    }
};

exports.deleteTestimonial = async (req, res) => {
    try {
        const testimonialId = req.params.id;

        const deletedTestimonial = await Testimonial.findByIdAndDelete(testimonialId);

        if (!deletedTestimonial) {
            return res.status(404).json({ message: "Testimonial not found", status: 404, data: {} });
        }

        return res.status(200).json({ status: 200, message: "Testimonial deleted successfully", data: {} });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to delete testimonial" });
    }
};

exports.createSlot = async (req, res) => {
    try {
        const {
            dateFrom,
            dateTo,
            timeFrom,
            timeTo,
            selectDuration,
            jobAcceptance,
            mainCategory,
            surgeAmount
        } = req.body;

        if (!['15', '20', '30', '45', '60'].includes(selectDuration)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid selectDuration value.',
                data: {},
            });
        }

        const durationInMinutes = parseInt(selectDuration);

        const startTime = moment(`${timeFrom}`, 'h:mm A');
        const endTime = moment(`${timeTo}`, 'h:mm A');

        if (!startTime.isValid() || !endTime.isValid() || endTime.isBefore(startTime)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid time range.',
                data: {},
            });
        }

        const slots = [];

        let currentSlotTime = startTime.clone();

        while (currentSlotTime.isSameOrBefore(endTime)) {
            const currentDate = moment();

            const currentDateTime = moment(`${dateFrom} ${currentSlotTime.format('HH:mm')}`, 'YYYY-MM-DD HH:mm');

            const status = currentDate.isSameOrAfter(moment(dateTo));

            const newSlot = await Slot.create({
                dateFrom: dateFrom,
                dateTo: dateTo,
                timeFrom: currentSlotTime.format('HH:mm'),
                timeTo: currentSlotTime.clone().add(durationInMinutes, 'minutes').format('HH:mm'),
                selectDuration,
                jobAcceptance,
                mainCategory,
                surgeAmount,
                status,
            });

            slots.push(newSlot);

            currentSlotTime.add(durationInMinutes, 'minutes');
        }

        return res.status(201).json({
            status: 201,
            message: 'Slots created successfully.',
            data: slots,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: error.message,
        });
    }
};

exports.getAllSlots = async (req, res) => {
    try {
        const slots = await Slot.find();

        return res.status(200).json({
            status: 200,
            message: 'Slots retrieved successfully.',
            data: slots,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: error.message,
        });
    }
};

exports.getSlotById = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({
                status: 404,
                message: 'Slot not found.',
                data: {},
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Slot retrieved successfully.',
            data: slot,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: error.message,
        });
    }
};

exports.updateSlotById = async (req, res) => {
    try {
        const updatedSlot = await Slot.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedSlot) {
            return res.status(404).json({
                status: 404,
                message: 'Slot not found.',
                data: {},
            });
        }

        if (req.body.selectDuration && !['15', '20', '30', '45', '60'].includes(req.body.selectDuration)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid selectDuration value.',
                data: {},
            });
        }

        const isSurgeAmountProvided = req.body.surgeAmount && req.body.surgeAmount > 0;

        const isSurgeAmountInDatabase = updatedSlot.surgeAmount > 0;

        updatedSlot.isSurgeAmount = isSurgeAmountProvided || isSurgeAmountInDatabase;

        await updatedSlot.save();

        return res.status(200).json({
            status: 200,
            message: 'Slot updated successfully.',
            data: updatedSlot,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: error.message,
        });
    }
};

exports.deleteSlotById = async (req, res) => {
    try {
        const deletedSlot = await Slot.findByIdAndDelete(req.params.id);

        if (!deletedSlot) {
            return res.status(404).json({
                status: 404,
                message: 'Slot not found.',
                data: {},
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Slot deleted successfully.',
            data: deletedSlot,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: error.message,
        });
    }
};

exports.createBreedScore = async (req, res) => {
    try {
        const { breedSize, score } = req.body;

        if (breedSize) {
            const size = await Size.findById(breedSize);
            if (!size) {
                return res.status(404).json({ message: 'Size not found' });
            }
        }
        const newBreedScore = await BreedScore.create({ breedSize, score });
        return res.status(201).json({ status: 201, message: 'Breed score created successfully.', data: newBreedScore });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Failed to create breed score.', error: error.message });
    }
};

exports.getAllBreedScores = async (req, res) => {
    try {
        const breedScores = await BreedScore.find().populate('breedSize');
        return res.status(200).json({ status: 200, message: 'Breed scores retrieved successfully.', data: breedScores });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Failed to retrieve breed scores.', error: error.message });
    }
};

exports.getBreedScoreById = async (req, res) => {
    try {
        const breedScore = await BreedScore.findById(req.params.id).populate('breedSize');
        if (!breedScore) {
            return res.status(404).json({ status: 404, message: 'Breed score not found.' });
        }
        return res.status(200).json({ status: 200, message: 'Breed score retrieved successfully.', data: breedScore });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Failed to retrieve breed score.', error: error.message });
    }
};

exports.updateBreedScoreById = async (req, res) => {
    try {
        const { breedSize, score } = req.body;

        if (breedSize) {
            const size = await Size.findById(breedSize);
            if (!size) {
                return res.status(404).json({ message: 'Size not found' });
            }
        }

        const updatedBreedScore = await BreedScore.findByIdAndUpdate(req.params.id, { breedSize, score }, { new: true });
        if (!updatedBreedScore) {
            return res.status(404).json({ status: 404, message: 'Breed score not found.' });
        }
        return res.status(200).json({ status: 200, message: 'Breed score updated successfully.', data: updatedBreedScore });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Failed to update breed score.', error: error.message });
    }
};

exports.deleteBreedScoreById = async (req, res) => {
    try {
        const deletedBreedScore = await BreedScore.findByIdAndDelete(req.params.id);
        if (!deletedBreedScore) {
            return res.status(404).json({ status: 404, message: 'Breed score not found.' });
        }
        return res.status(200).json({ status: 200, message: 'Breed score deleted successfully.' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Failed to delete breed score.', error: error.message });
    }
};

exports.createBreedAggressiveScore = async (req, res) => {
    try {
        const { breedAggressive, score } = req.body;

        const existingScore = await BreedAggressiveScore.findOne({ BreedAggressive: breedAggressive });
        if (existingScore) {
            return res.status(409).json({ message: "Breed aggressiveness score already exists.", status: 409 });
        }

        const newScore = new BreedAggressiveScore({
            BreedAggressive: breedAggressive,
            score: score
        });

        await newScore.save();

        return res.status(201).json({ message: "Breed aggressiveness score created successfully.", status: 201, data: newScore });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.getAllBreedAggressiveScores = async (req, res) => {
    try {
        const scores = await BreedAggressiveScore.find();

        return res.status(200).json({ message: "Breed aggressiveness scores retrieved successfully.", status: 200, data: scores });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.getBreedAggressiveScoresById = async (req, res) => {
    try {
        const scores = await BreedAggressiveScore.findById(req.params.id);

        return res.status(200).json({ message: "Breed aggressiveness scores retrieved successfully.", status: 200, data: scores });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.updateBreedAggressiveScore = async (req, res) => {
    try {
        const { id } = req.params;
        const { score } = req.body;

        const existingScore = await BreedAggressiveScore.findById(id);
        if (!existingScore) {
            return res.status(404).json({ message: "Breed aggressiveness score not found.", status: 404 });
        }

        existingScore.score = score;

        await existingScore.save();

        return res.status(200).json({ message: "Breed aggressiveness score updated successfully.", status: 200, data: existingScore });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.deleteBreedAggressiveScore = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedScore = await BreedAggressiveScore.findByIdAndDelete(id);
        if (!deletedScore) {
            return res.status(404).json({ message: "Breed aggressiveness score not found.", status: 404 });
        }

        return res.status(200).json({ message: "Breed aggressiveness score deleted successfully.", status: 200, data: deletedScore });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.createTransportScore = async (req, res) => {
    try {
        const { modeOfTransport, distanceRange_0_1_Kms, distanceRange_1_5_Kms, distanceRange_5_10_Kms } = req.body;
        const transportScore = new TransportScore({
            modeOfTransport,
            distanceRange_0_1_Kms,
            distanceRange_1_5_Kms,
            distanceRange_5_10_Kms
        });
        const savedTransportScore = await transportScore.save();
        return res.status(201).json({ status: 201, data: savedTransportScore });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
};

exports.getAllTransportScores = async (req, res) => {
    try {
        const transportScores = await TransportScore.find();
        return res.status(200).json({ status: 200, data: transportScores });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
};

exports.getTransportScoreById = async (req, res) => {
    try {
        const transportScore = await TransportScore.findById(req.params.id);
        if (!transportScore) {
            return res.status(404).json({ message: "Transport score not found" });
        }
        return res.status(200).json({ status: 200, data: transportScore });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
};

exports.updateTransportScoreById = async (req, res) => {
    try {
        const { modeOfTransport, distanceRange_0_1_Kms, distanceRange_1_5_Kms, distanceRange_5_10_Kms } = req.body;
        const transportScore = await TransportScore.findByIdAndUpdate(
            req.params.id,
            { modeOfTransport, distanceRange_0_1_Kms, distanceRange_1_5_Kms, distanceRange_5_10_Kms },
            { new: true }
        );
        if (!transportScore) {
            return res.status(404).json({ message: "Transport score not found" });
        }
        return res.status(200).json({ status: 200, data: transportScore });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
};

exports.deleteTransportScoreById = async (req, res) => {
    try {
        const transportScore = await TransportScore.findByIdAndDelete(req.params.id);
        if (!transportScore) {
            return res.status(404).json({ message: "Transport score not found" });
        }
        return res.status(200).json({ status: 200, message: 'sucessfully deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
};

exports.createProximityScore = async (req, res) => {
    try {
        const { distanceRange, score } = req.body;
        const proximityScore = new ProximityScore({ distanceRange, score });
        const savedScore = await proximityScore.save();
        return res.status(201).json({ status: 201, message: 'Proximity score created successfully', data: savedScore });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
};

exports.getAllProximityScores = async (req, res) => {
    try {
        const scores = await ProximityScore.find();
        return res.status(200).json({ status: 200, data: scores });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
};

exports.getProximityScoreById = async (req, res) => {
    try {
        const score = await ProximityScore.findById(req.params.id);
        if (!score) {
            return res.status(404).json({ status: 404, message: 'Proximity score not found' });
        }
        return res.status(200).json({ status: 200, data: score });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
};

exports.updateProximityScore = async (req, res) => {
    try {
        const updatedScore = await ProximityScore.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedScore) {
            return res.status(404).json({ status: 404, message: 'Proximity score not found' });
        }
        return res.status(200).json({ status: 200, message: 'Proximity score updated successfully', data: updatedScore });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
};

exports.deleteProximityScore = async (req, res) => {
    try {
        const deletedScore = await ProximityScore.findByIdAndDelete(req.params.id);
        if (!deletedScore) {
            return res.status(404).json({ status: 404, message: 'Proximity score not found' });
        }
        return res.status(200).json({ status: 200, message: 'Proximity score deleted successfully', data: deletedScore });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
};

exports.createServiceableAreaRadius = async (req, res) => {
    try {
        const { transportMode, radiusInKms } = req.body;
        const newServiceableAreaRadius = await ServiceableAreaRadius.create({ transportMode, radiusInKms });
        return res.status(201).json({ status: 201, message: 'Serviceable area radius created successfully', data: newServiceableAreaRadius });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
};

exports.getAllServiceableAreaRadius = async (req, res) => {
    try {
        const allServiceableAreaRadius = await ServiceableAreaRadius.find();
        return res.status(200).json({ status: 200, message: 'Success', data: allServiceableAreaRadius });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
};

exports.getServiceableAreaRadiusById = async (req, res) => {
    try {
        const serviceableAreaRadius = await ServiceableAreaRadius.findById(req.params.id);
        if (!serviceableAreaRadius) {
            return res.status(404).json({ status: 404, message: 'Serviceable area radius not found' });
        }
        return res.status(200).json({ status: 200, message: 'Success', data: serviceableAreaRadius });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
};

exports.updateServiceableAreaRadius = async (req, res) => {
    try {
        const updatedServiceableAreaRadius = await ServiceableAreaRadius.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedServiceableAreaRadius) {
            return res.status(404).json({ status: 404, message: 'Serviceable area radius not found' });
        }
        return res.status(200).json({ status: 200, message: 'Serviceable area radius updated successfully', data: updatedServiceableAreaRadius });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
};

exports.deleteServiceableAreaRadius = async (req, res) => {
    try {
        const deletedServiceableAreaRadius = await ServiceableAreaRadius.findByIdAndDelete(req.params.id);
        if (!deletedServiceableAreaRadius) {
            return res.status(404).json({ status: 404, message: 'Serviceable area radius not found' });
        }
        return res.status(200).json({ status: 200, message: 'Serviceable area radius deleted successfully', data: deletedServiceableAreaRadius });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
};

exports.createExperienceScore = async (req, res) => {
    try {
        const { years, yearScore, months, monthScore } = req.body;

        const existingScore = await ExperienceScore.findOne({ years, months });
        if (existingScore) {
            return res.status(400).json({ status: 400, message: 'Experience score entry already exists' });
        }

        const newScore = await ExperienceScore.create({ years, yearScore, months, monthScore });

        return res.status(201).json({ status: 201, message: 'Experience score entry created successfully', data: newScore });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.getAllExperienceScores = async (req, res) => {
    try {
        const scores = await ExperienceScore.find();
        return res.status(200).json({ status: 200, data: scores });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.getExperienceScoreById = async (req, res) => {
    try {
        const scoreId = req.params.id;
        const score = await ExperienceScore.findById(scoreId);
        if (!score) {
            return res.status(404).json({ status: 404, message: 'Experience score entry not found' });
        }
        return res.status(200).json({ status: 200, data: score });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.updateExperienceScore = async (req, res) => {
    try {
        const scoreId = req.params.id;
        const { years, yearScore, months, monthScore } = req.body;

        const updatedScore = await ExperienceScore.findByIdAndUpdate(
            scoreId,
            { years, yearScore, months, monthScore },
            { new: true }
        );

        if (!updatedScore) {
            return res.status(404).json({ status: 404, message: 'Experience score entry not found' });
        }

        return res.status(200).json({ status: 200, message: 'Experience score entry updated successfully', data: updatedScore });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.deleteExperienceScore = async (req, res) => {
    try {
        const scoreId = req.params.id;
        const deletedScore = await ExperienceScore.findByIdAndDelete(scoreId);

        if (!deletedScore) {
            return res.status(404).json({ status: 404, message: 'Experience score entry not found' });
        }

        return res.status(200).json({ status: 200, message: 'Experience score entry deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.createSize = async (req, res) => {
    try {
        const { size, status } = req.body;

        const newSize = await Size.create({ size, status });

        return res.status(201).json({ status: 201, message: 'Size created successfully', data: newSize });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Failed to create size', error: error.message });
    }
};

exports.getAllSizes = async (req, res) => {
    try {
        const sizes = await Size.find();

        return res.status(200).json({ status: 200, message: 'Sizes retrieved successfully', data: sizes });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Failed to retrieve sizes', error: error.message });
    }
};

exports.getSizeById = async (req, res) => {
    try {
        const { id } = req.params;

        const size = await Size.findById(id);

        if (!size) {
            return res.status(404).json({ message: 'Size not found' });
        }

        return res.status(200).json({ status: 200, message: 'Size retrieved successfully', data: size });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Failed to retrieve size', error: error.message });
    }
};

exports.updateSizeById = async (req, res) => {
    try {
        const { id } = req.params;
        const { size, status } = req.body;

        const updatedSize = await Size.findByIdAndUpdate(
            id,
            { size, status },
            { new: true, runValidators: true }
        );

        if (!updatedSize) {
            return res.status(404).json({ message: 'Size not found' });
        }

        return res.status(200).json({ status: 200, message: 'Size updated successfully', data: updatedSize });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Failed to update size', error: error.message });
    }
};

exports.deleteSizeById = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSize = await Size.findByIdAndDelete(id);

        if (!deletedSize) {
            return res.status(404).json({ message: 'Size not found' });
        }

        return res.status(200).json({ status: 200, message: 'Size deleted successfully', data: deletedSize });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Failed to delete size', error: error.message });
    }
};

exports.createSPAgreement = async (req, res) => {
    try {
        const { userId } = req.body;
        const spAgreement = new SPAgreement({
            agreementDocument: req.files['agreementDocument'][0].path,
            userId: userId,
        });

        const savedSPAgreement = await spAgreement.save();

        res.status(201).json({ status: 201, message: "created sucessfully", data: savedSPAgreement });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create SP Agreement' });
    }
};

exports.getAllSPAgreements = async (req, res) => {
    try {
        const spAgreements = await SPAgreement.find();
        res.json({ tatus: 200, message: "spAgreement data retrived sucessfully", data: spAgreements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get SP Agreements' });
    }
};

exports.getSPAgreementById = async (req, res) => {
    const spAgreementId = req.params.id;

    try {
        const spAgreement = await SPAgreement.findById(spAgreementId);
        if (!spAgreement) {
            return res.status(404).json({ message: 'SP Agreement not found' });
        }
        res.json({ status: 200, message: "spAgreement data retrived sucessfully", data: spAgreement });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get SP Agreement' });
    }
};

exports.updateSPAgreement = async (req, res) => {
    try {
        const spAgreementId = req.params.id;
        const { userId } = req.body;
        const updatedSPAgreement = {
            agreementDocument: req.files['agreementDocument'][0].path,
            userId: userId,
        };

        const updatedSPAgreementResult = await SPAgreement.findByIdAndUpdate(
            spAgreementId,
            updatedSPAgreement,
            { new: true }
        );

        if (!updatedSPAgreementResult) {
            return res.status(404).json({ status: 404, message: 'SP Agreement not found' });
        }

        return res.json({ status: 200, message: "updated sucessfully", data: updatedSPAgreementResult });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Failed to update SP Agreement' });
    }
};
exports.deleteSPAgreementById = async (req, res) => {
    try {
        const spAgreementId = req.params.id;

        const spAgreement = await SPAgreement.findById(spAgreementId);
        if (!spAgreement) {
            return res.status(404).json({ message: 'SP Agreement not found' });
        }

        await SPAgreement.findByIdAndDelete(spAgreementId);

        return res.json({ status: 200, message: 'SP Agreement deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Failed to delete SP Agreement' });
    }
};
exports.createImprove = async (req, res) => {
    try {
        const improve = new Improve(req.body);
        await improve.save();
        return res.status(201).json({ status: 201, data: improve });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error' });
    }
};
exports.getAllImprove = async (req, res) => {
    try {
        const improves = await Improve.find();
        return res.status(200).json({ status: 200, data: improves });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error' });
    }
};
exports.getImproveById = async (req, res) => {
    try {
        const improve = await Improve.findById(req.params.id);
        if (!improve) {
            return res.status(404).json({ status: 404, message: 'Improve data not found' });
        }
        return res.status(200).json({ status: 200, data: improve });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error' });
    }
};
exports.updateImprove = async (req, res) => {
    try {
        const improve = await Improve.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!improve) {
            return res.status(404).json({ status: 404, message: 'Improve data not found' });
        }
        return res.status(200).json({ status: 200, data: improve });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error' });
    }
};
exports.deleteImprove = async (req, res) => {
    try {
        const improve = await Improve.findByIdAndDelete(req.params.id);
        if (!improve) {
            return res.status(404).json({ status: 'fail', message: 'Improve data not found' });
        }
        return res.status(204).json({ status: 204, data: null });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error' });
    }
};
exports.createNotification = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(404).json({ status: 404, message: "Admin not found" });
        }

        const createNotification = async (userId) => {
            const userData = await User.findById(userId);
            if (!userData) {
                throw new Error("User not found");
            }

            const notificationData = {
                recipient: userId,
                title: req.body.title,
                content: req.body.content,
                sendVia: req.body.sendVia,
                expireIn: req.body.expireIn,
            };
            const notification = await Notification.create(notificationData);

            if (req.body.sendVia === "FCM" && userData.deviceToken) {
                await firebase.pushNotificationforUser(userData.deviceToken, req.body.title, req.body.content);
            }

            return notification;
        };

        if (req.body.total === "ALL") {
            const users = await User.find({ userType: req.body.sendTo });
            if (users.length === 0) {
                return res.status(404).json({ status: 404, message: "Users not found" });
            }

            const notificationPromises = users.map(user => createNotification(user._id));
            await Promise.all(notificationPromises);
            await createNotification(admin._id);

            return res.status(200).json({ status: 200, message: "Notifications sent successfully to all users." });
        }

        if (req.body.total === "SINGLE") {
            const user = await User.findById(req.body._id);
            if (!user || user.userType !== req.body.sendTo) {
                return res.status(404).json({ status: 404, message: "User not found or invalid user type" });
            }

            const notificationData = await createNotification(user._id);

            return res.status(200).json({ status: 200, message: "Notification sent successfully.", data: notificationData });
        }

        return res.status(400).json({ status: 400, message: "Invalid 'total' value" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Server error", data: {} });
    }
};
exports.markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { status: 'read' },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ status: 404, message: 'Notification not found' });
        }

        return res.status(200).json({ status: 200, message: 'Notification marked as read', data: notification });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error marking notification as read', error: error.message });
    }
};
exports.getNotificationsForUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const notifications = await Notification.find({ recipient: userId });

        return res.status(200).json({ status: 200, message: 'Notifications retrieved successfully', data: notifications });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error retrieving notifications', error: error.message });
    }
};
exports.getAllNotificationsForUser = async (req, res) => {
    try {
        const notifications = await Notification.find();

        return res.status(200).json({ status: 200, message: 'Notifications retrieved successfully', data: notifications });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error retrieving notifications', error: error.message });
    }
};
exports.deleteNotificationById = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const deletedNotification = await Notification.findByIdAndDelete(notificationId);

        if (!deletedNotification) {
            return res.status(404).json({ status: 404, message: 'Notification not found' });
        }

        return res.status(200).json({ status: 200, message: 'Notification deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};
exports.deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({});
        return res.status(200).json({ status: 200, message: 'All notifications deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};