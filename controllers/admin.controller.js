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
const servicePackage = require('../models/servicePackage');
const Package = require('../models/packageModel');
// const facialType = require('../models/facialType');
const Charges = require('../models/Charges');
const freeService = require('../models/freeService');
const Coupan = require('../models/Coupan')
const Brand = require('../models/brand');
const weCanhelpyou = require('../models/weCanhelpyou');
const e4u = require('../models/e4u')
const feedback = require('../models/feedback');
// const offer = require('../models/offer');
const ticket = require('../models/ticket');
const orderModel = require('../models/orderModel');
const partnerItems = require('../models/partnerItems');
const Leave = require('../models/leavesModel');
const subscription = require('../Old/models/subscription');
const SPAgreement = require('../models/spAgreementModel');
const TrainingVideo = require('../models/traningVideoModel');
const TransportationCharge = require('../models/transportationModel');
const Referral = require('../models/refferalModel');
const ConsentForm = require('../models/consentFormModel');
const offer = require('../models/offer');
const Cart = require('../models/cartModel');
const MinimumCart = require('../models/miniumCartAmountModel');
const ServiceType = require("../models/category/serviceType");
const ServiceTypeRef = require("../models/servicetypeRef");
const City = require('../models/cityModel');
const Area = require('../models/areaModel');
const MainCategoryBanner = require('../models/banner/mainCategoryBanner');
const Testimonial = require("../models/testimonial");
const Slot = require('../models/SlotModel');
const moment = require('moment');









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
exports.createBrands = async (req, res) => {
    try {
        let findBrand = await Brand.findOne({ name: req.body.name });
        if (findBrand) {
            return res.status(409).json({ message: "Brand already exit.", status: 404, data: {} });
        } else {
            let fileUrl;
            if (req.file) {
                fileUrl = req.file ? req.file.path : "";
            }
            const data = { name: req.body.name, image: fileUrl };
            const category = await Brand.create(data);
            return res.status(200).json({ message: "Brand add successfully.", status: 200, data: category });
        }
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
    }
};
exports.getBrands = async (req, res) => {
    const categories = await Brand.find({});
    if (categories.length > 0) {
        return res.status(201).json({ message: "Brand Found", status: 200, data: categories, });
    }
    return res.status(201).json({ message: "Brand not Found", status: 404, data: {}, });

};
exports.updateBrand = async (req, res) => {
    const { id } = req.params;
    const category = await Brand.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Brand Not Found", status: 404, data: {} });
    }
    let fileUrl;
    if (req.file) {
        fileUrl = req.file ? req.file.path : "";
    }
    category.image = fileUrl || category.image;
    category.name = req.body.name || category.name;
    let update = await category.save();
    return res.status(200).json({ message: "Updated Successfully", data: update });
};
exports.removeBrand = async (req, res) => {
    const { id } = req.params;
    const category = await Brand.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Brand Not Found", status: 404, data: {} });
    } else {
        await Brand.findByIdAndDelete(category._id);
        return res.status(200).json({ message: "Brand Deleted Successfully !" });
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
exports.getItemSubCategories = async (req, res) => {
    let findCategory = await Category.findOne({ _id: req.params.categoryId });
    if (!findCategory) {
        return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
    } else {
        let findSubCategory = await itemSubCategory.find({ categoryId: findCategory._id, })
        if (findSubCategory.length > 0) {
            return res.status(200).json({ message: "Item Sub Category Found", status: 200, data: findSubCategory, });
        } else {
            return res.status(201).json({ message: "Item Sub Category not Found", status: 404, data: {}, });
        }
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
// exports.createService = async (req, res) => {
//     try {
//         const findMainCategory = await mainCategory.findById({ _id: req.body.mainCategoryId });
//         if (!findMainCategory) {
//             return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
//         } else {
//             let findCategory, findSubCategory;
//             if (req.body.categoryId != (null || undefined)) {
//                 findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.body.categoryId });
//                 if (!findCategory) {
//                     return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
//                 }
//             } else {
//                 let findService = await service.findOne({ title: req.body.title, mainCategoryId: findMainCategory._id, type: req.body.type, packageType: req.body.packageType });
//                 if (findService) {
//                     return res.status(409).json({ message: "Service already exit.", status: 409, data: {} });
//                 }
//             }
//             if (req.body.subCategoryId != (null || undefined)) {
//                 findSubCategory = await subCategory.findOne({ _id: req.body.subCategoryId, mainCategoryId: findMainCategory._id, categoryId: findCategory._id, })
//                 if (!findSubCategory) {
//                     return res.status(404).json({ message: "sub category Not Found", status: 404, data: {} });
//                 }
//                 let findService = await service.findOne({ title: req.body.title, mainCategoryId: findMainCategory._id, type: req.body.type, packageType: req.body.packageType, categoryId: findCategory._id, subCategoryId: findSubCategory._id, });
//                 if (findService) {
//                     return res.status(409).json({ message: "Service already exit.", status: 409, data: {} });
//                 }
//             }
//             let discountPrice = 0, discount = 0, totalTime;
//             if (req.body.timeInMin > 60) {
//                 const hours = Math.floor(req.body.timeInMin / 60);
//                 const minutes = req.body.timeInMin % 60;
//                 totalTime = `${hours} hr ${minutes} min`
//             } else {
//                 const minutes = req.body.timeInMin % 60;
//                 totalTime = `00 hr ${minutes} min`
//             }
//             if (req.body.discountActive == "true") {
//                 discountPrice = Number((req.body.originalPrice) - ((Number(req.body.originalPrice) * Number(req.body.discount)) / 100)).toFixed();
//                 discount = req.body.discount;
//             } else {
//                 discountPrice = discountPrice;
//                 discount = discount;
//             }
//             let images = [];
//             if (req.files) {
//                 for (let j = 0; j < req.files.length; j++) {
//                     let obj = {
//                         img: req.files[j].path
//                     }
//                     images.push(obj)
//                 }
//             }
//             let items = [], services = [];
//             if (req.body.services != (null || undefined)) {
//                 for (let i = 0; i < req.body.services.length; i++) {
//                     let findItem = await service.findById({ _id: req.body.services[i] });
//                     if (findItem) {
//                         let item1 = {
//                             service: findItem._id
//                         }
//                         services.push(item1);
//                     } else {
//                         return res.status(404).json({ message: `service Not Found`, status: 404, data: {} });
//                     }
//                 }
//             }
//             if (req.body.items != (null || undefined)) {
//                 for (let i = 0; i < req.body.items.length; i++) {
//                     let findItem = await item.findById({ _id: req.body.items[i] });
//                     if (findItem) {
//                         let item1 = {
//                             item: findItem._id
//                         }
//                         items.push(item1);
//                     } else {
//                         return res.status(404).json({ message: `item Not Found`, status: 404, data: {} });
//                     }
//                 }
//             }
//             if (req.body.type == "Service") {
//                 // const descriptions = req.body.description || [];
//                 // const descriptionObjects = descriptions.map((description, index) => ({
//                 //     _id: index + 1,
//                 //     text: description,
//                 // }));
//                 // console.log("Description:", descriptionObjects);

//                 const data = {
//                     mainCategoryId: findMainCategory._id,
//                     categoryId: findCategory._id,
//                     subCategoryId: findSubCategory._id,
//                     title: req.body.title,
//                     description: req.body.description /*descriptionObjects*/,
//                     originalPrice: req.body.originalPrice,
//                     discountActive: req.body.discountActive,
//                     discount: req.body.discount,
//                     discountPrice: discountPrice,
//                     totalTime: totalTime,
//                     timeInMin: req.body.timeInMin,
//                     images: images,
//                     E4uSafety: req.body.E4uSafety,
//                     thingsToKnow: req.body.thingsToKnow,
//                     E4uSuggestion: req.body.E4uSuggestion,
//                     type: req.body.type,
//                     items: items
//                 };
//                 const category = await service.create(data);
//                 return res.status(200).json({ message: "Service add successfully.", status: 200, data: category });
//             }
//             if (req.body.type == "Package") {
//                 if (req.body.packageType == "Customise") {
//                     const data = {
//                         mainCategoryId: findMainCategory._id,
//                         categoryId: findCategory._id,
//                         subCategoryId: findSubCategory._id,
//                         title: req.body.title,
//                         description: req.body.description,
//                         originalPrice: req.body.originalPrice,
//                         discountActive: req.body.discountActive,
//                         discount: req.body.discount,
//                         discountPrice: discountPrice,
//                         totalTime: totalTime,
//                         timeInMin: req.body.timeInMin,
//                         images: images,
//                         E4uSafety: req.body.E4uSafety,
//                         thingsToKnow: req.body.thingsToKnow,
//                         E4uSuggestion: req.body.E4uSuggestion,
//                         type: "Package",
//                         packageType: "Customise",
//                         selected: true,
//                         selectedCount: req.body.selectedCount,
//                         services: services,
//                         items: items
//                     };
//                     const category = await service.create(data);
//                     return res.status(200).json({ message: "Service add successfully.", status: 200, data: category });
//                 }
//                 if (req.body.packageType == "Normal") {
//                     const data = {
//                         mainCategoryId: findMainCategory._id,
//                         categoryId: findCategory._id,
//                         subCategoryId: findSubCategory._id,
//                         title: req.body.title,
//                         description: req.body.description,
//                         originalPrice: req.body.originalPrice,
//                         discountActive: req.body.discountActive,
//                         discount: req.body.discount,
//                         discountPrice: discountPrice,
//                         totalTime: totalTime,
//                         timeInMin: req.body.timeInMin,
//                         images: images,
//                         E4uSafety: req.body.E4uSafety,
//                         thingsToKnow: req.body.thingsToKnow,
//                         E4uSuggestion: req.body.E4uSuggestion,
//                         type: "Package",
//                         packageType: "Normal",
//                         selected: false,
//                         selectedCount: 0,
//                         services: services,
//                         items: items
//                     };
//                     const category = await service.create(data);
//                     return res.status(200).json({ message: "Service add successfully.", status: 200, data: category });
//                 }
//                 if (req.body.packageType == "Edit") {
//                     const data = {
//                         mainCategoryId: findMainCategory._id,
//                         categoryId: findCategory._id,
//                         subCategoryId: findSubCategory._id,
//                         title: req.body.title,
//                         description: req.body.description,
//                         originalPrice: req.body.originalPrice,
//                         discountActive: req.body.discountActive,
//                         discount: req.body.discount,
//                         discountPrice: discountPrice,
//                         totalTime: totalTime,
//                         timeInMin: req.body.timeInMin,
//                         images: images,
//                         E4uSafety: req.body.E4uSafety,
//                         thingsToKnow: req.body.thingsToKnow,
//                         E4uSuggestion: req.body.E4uSuggestion,
//                         type: "Package",
//                         packageType: "Edit",
//                     };
//                     let findCategories = await Category.find({ mainCategoryId: findMainCategory._id });
//                     if (findCategories.length == 0) {
//                         return res.status(404).json({ message: "first add Category in this main category", status: 404, data: {} });
//                     }
//                     const saveService = await service.create(data);
//                     if (saveService) {
//                         for (let i = 0; i < findCategories.length; i++) {
//                             let findServices = await service.find({ categoryId: findCategories[i]._id });
//                             if (findServices.length == 0) {
//                                 return res.status(404).json({ message: "first add Services in categories", status: 404, data: {} });
//                             }
//                             let services = [];
//                             for (let j = 0; j < findServices.length; j++) {
//                                 let obj = {
//                                     service: findServices[j]._id,
//                                 }
//                                 services.push(obj)
//                             }
//                             let obj1 = {
//                                 serviceId: saveService._id,
//                                 categoryId: findCategories[i]._id,
//                                 services: services,
//                             }
//                             let savePackage = await servicePackage.create(obj1);
//                             if (savePackage) {
//                                 await service.findByIdAndUpdate({ _id: saveService._id }, { $push: { servicePackageId: savePackage._id } }, { new: true })
//                             }
//                         }
//                         let x = await service.findById({ _id: saveService._id })
//                         return res.status(200).json({ message: "Service add successfully.", status: 200, data: x });
//                     }
//                 }
//             }

//         }
//     } catch (error) {
//         return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
//     }
// };

exports.createService1 = async (req, res) => {
    try {
        const findMainCategory = await mainCategory.findById(req.body.mainCategoryId);

        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        let findCategory;
        const findSubCategories = [];

        if (req.body.categoryId) {
            findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.body.categoryId });

            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            }
        } else {
            const existingService = await service.findOne({
                title: req.body.title,
                mainCategoryId: findMainCategory._id,
                type: req.body.type,
                packageType: req.body.packageType,
            });

            if (existingService) {
                return res.status(409).json({ message: "Service already exists.", status: 409, data: {} });
            }
        }

        if (req.body.subCategoryId && Array.isArray(req.body.subCategoryId)) {
            for (const subCategoryId of req.body.subCategoryId) {
                const findSubCategory = await subCategory.findOne({
                    _id: subCategoryId,
                    mainCategoryId: findMainCategory._id,
                    categoryId: findCategory._id,
                });

                if (!findSubCategory) {
                    return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
                }

                findSubCategories.push(findSubCategory);
            }
        }

        let discountPrice, originalPrice, discount = 0, totalTime;
        if (req.body.timeInMin > 60) {
            const hours = Math.floor(req.body.timeInMin / 60);
            const minutes = req.body.timeInMin % 60;
            totalTime = `${hours} hr ${minutes} min`;
        } else {
            const minutes = req.body.timeInMin % 60;
            totalTime = `00 hr ${minutes} min`;
        }

        if (req.body.discountActive === "true") {
            originalPrice = req.body.originalPrice;
            discountPrice = req.body.discountPrice;

            if (originalPrice && discountPrice) {
                discount = ((originalPrice - discountPrice) / originalPrice) * 100;
                discount = Math.max(discount, 0);
                discount = Math.round(discount);
            }
        }

        let images = [];
        if (req.files) {
            for (let j = 0; j < req.files.length; j++) {
                let obj = {
                    img: req.files[j].path,
                };
                images.push(obj);
            }
        }

        let items = [], services = [], servicePackages = [];

        if (req.body.services) {
            for (let i = 0; i < req.body.services.length; i++) {
                let findItem = await service.findById(req.body.services[i]);

                if (!findItem) {
                    return res.status(404).json({ message: `Service Not Found`, status: 404, data: {} });
                }

                let item1 = {
                    service: findItem._id,
                };
                services.push(item1);
            }
        }

        if (req.body.items) {
            for (let i = 0; i < req.body.items.length; i++) {
                let findItem = await item.findById(req.body.items[i]);

                if (!findItem) {
                    return res.status(404).json({ message: `Item Not Found`, status: 404, data: {} });
                }

                let item1 = {
                    item: findItem._id,
                };
                items.push(item1);
            }
        }

        if (req.body.type === "Service") {
            const data = {
                mainCategoryId: findMainCategory._id,
                categoryId: findCategory._id,
                subCategoryId: findSubCategories.map(subCategory => subCategory._id),
                title: req.body.title,
                description: req.body.description,
                originalPrice: req.body.originalPrice,
                discountActive: req.body.discountActive,
                discount: discount,
                discountPrice: discountPrice,
                totalTime: totalTime,
                timeInMin: req.body.timeInMin,
                images: images,
                E4uSafety: req.body.E4uSafety,
                thingsToKnow: req.body.thingsToKnow,
                E4uSuggestion: req.body.E4uSuggestion,
                type: req.body.type,
                items: items,
            };
            const category = await service.create(data);

            const serviceTypeRef = await ServiceTypeRef.create({
                service: category._id,
                serviceType: req.body.serviceTypesId,
            });
            category.serviceTypes = serviceTypeRef._id;
            await category.save();

            return res.status(200).json({ message: "Service added successfully.", status: 200, data: category });
        }

        if (req.body.type === "Package") {
            const packageData = {
                mainCategoryId: findMainCategory._id,
                categoryId: findCategory._id,
                subCategoryId: findSubCategories.map(subCategory => subCategory._id),
                title: req.body.title,
                description: req.body.description,
                originalPrice: req.body.originalPrice,
                discountActive: req.body.discountActive,
                discount: discount,
                discountPrice: discountPrice,
                totalTime: totalTime,
                timeInMin: req.body.timeInMin,
                images: images,
                E4uSafety: req.body.E4uSafety,
                thingsToKnow: req.body.thingsToKnow,
                E4uSuggestion: req.body.E4uSuggestion,
                type: req.body.type,
                packageType: req.body.packageType,
                selected: req.body.packageType === "Normal" ? false : true,
                selectedCount: req.body.selectedCount || 0,
                services: services,
                items: items,
            };

            const category = await service.create(packageData);

            const serviceTypeRef = await ServiceTypeRef.create({
                service: category._id,
                serviceType: req.body.serviceTypesId,
            });
            category.serviceTypes = serviceTypeRef._id;
            await category.save();

            for (let i = 0; i < req.body.selectedCount; i++) {
                let obj1 = {
                    serviceId: category._id,
                    categoryId: findCategory._id,
                    services: services,
                }
                let savePackage = await servicePackage.create(obj1);
                if (savePackage) {
                    await service.findByIdAndUpdate({ _id: category._id }, { $push: { servicePackageId: savePackage._id } }, { new: true })
                }
                servicePackages.push(savePackage);
            }

            category.servicePackages = servicePackages;
            await category.save();


            return res.status(200).json({ message: "Service added successfully.", status: 200, data: category });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.createService = async (req, res) => {
    try {
        const findMainCategory = await mainCategory.findById(req.body.mainCategoryId);

        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        let findCategory;
        const findSubCategories = [];

        if (req.body.categoryId) {
            findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.body.categoryId });

            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            }
        } else {
            const existingService = await service.findOne({
                title: req.body.title,
                mainCategoryId: findMainCategory._id,
                type: req.body.type,
                packageType: req.body.packageType,
            });

            if (existingService) {
                return res.status(409).json({ message: "Service already exists.", status: 409, data: {} });
            }
        }

        if (req.body.subCategoryId && Array.isArray(req.body.subCategoryId)) {
            for (const subCategoryId of req.body.subCategoryId) {
                const findSubCategory = await subCategory.findOne({
                    _id: subCategoryId,
                    mainCategoryId: findMainCategory._id,
                    categoryId: findCategory._id,
                });

                if (!findSubCategory) {
                    return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
                }

                findSubCategories.push(findSubCategory);
            }
        }

        let discountPrice, originalPrice, discount = 0, totalTime;
        if (req.body.timeInMin > 60) {
            const hours = Math.floor(req.body.timeInMin / 60);
            const minutes = req.body.timeInMin % 60;
            totalTime = `${hours} hr ${minutes} min`;
        } else {
            const minutes = req.body.timeInMin % 60;
            totalTime = `00 hr ${minutes} min`;
        }

        if (req.body.discountActive === "true") {
            originalPrice = req.body.originalPrice;
            discountPrice = req.body.discountPrice;

            if (originalPrice && discountPrice) {
                discount = ((originalPrice - discountPrice) / originalPrice) * 100;
                discount = Math.max(discount, 0);
                discount = Math.round(discount);
            }
        }

        let images = [];
        if (req.files) {
            for (let j = 0; j < req.files.length; j++) {
                let obj = {
                    img: req.files[j].path,
                };
                images.push(obj);
            }
        }

        let items = [];

        if (req.body.items) {
            for (let i = 0; i < req.body.items.length; i++) {
                let findItem = await item.findById(req.body.items[i]);

                if (!findItem) {
                    return res.status(404).json({ message: `Item Not Found`, status: 404, data: {} });
                }

                let item1 = {
                    item: findItem._id,
                };
                items.push(item1);
            }
        }

        const data = {
            mainCategoryId: findMainCategory._id,
            categoryId: findCategory ? findCategory._id : null,
            subCategoryId: findSubCategories.map(subCategory => subCategory._id),
            title: req.body.title,
            description: req.body.description,
            originalPrice: req.body.originalPrice,
            discountActive: req.body.discountActive,
            discount: discount,
            discountPrice: discountPrice,
            totalTime: totalTime,
            timeInMin: req.body.timeInMin,
            images: images,
            // E4uSafety: req.body.E4uSafety,
            // thingsToKnow: req.body.thingsToKnow,
            // E4uSuggestion: req.body.E4uSuggestion,
            type: req.body.type,
            items: items,
            status: req.body.status
        };
        const category = await service.create(data);
        if (req.body.serviceTypesId) {
            const serviceTypeRef = await ServiceTypeRef.create({
                service: category._id,
                serviceType: req.body.serviceTypesId,
            });

            category.serviceTypes = serviceTypeRef._id;
            category.isServiceTypes = true;
            await category.save();
        }
        return res.status(200).json({ message: "Service added successfully.", status: 200, data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.addServiceLocation = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;

        const existingService = await service.findById(serviceId);
        if (!existingService) {
            return res.status(404).json({ message: "Service not found", status: 404, data: {} });
        }

        const newLocations = req.body.location.map(loc => ({
            city: loc.city,
            sector: loc.sector,
        }));
        const existingLocations = existingService.location.map(loc => ({
            city: loc.city,
            sector: loc.sector,
        }));

        const duplicateLocation = newLocations.find(newLoc => existingLocations.some(existingLoc => existingLoc.city.toString() === newLoc.city.toString() && existingLoc.sector.toString() === newLoc.sector.toString()));

        if (duplicateLocation) {
            return res.status(409).json({
                message: `Location for city ${duplicateLocation.city} and sector ${duplicateLocation.sector} already exists for this service.`,
                status: 409,
                data: {},
            });
        }

        for (const loc of req.body.location) {
            const existingCity = await City.findById(loc.city);
            const existingSector = await Area.findById(loc.sector);

            if (!existingCity || !existingSector) {
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid city or sector ID',
                });
            }
        }

        if (req.body.location && Array.isArray(req.body.location)) {
            existingService.location = existingService.location.concat(req.body.location.map(loc => {
                const newLocation = {
                    city: loc.city,
                    sector: loc.sector,
                    originalPrice: loc.originalPrice,
                    discountActive: loc.discountActive || false,
                    discountPrice: loc.discountPrice || 0,
                };

                if (newLocation.discountActive && newLocation.originalPrice && newLocation.discountPrice) {
                    newLocation.discount = ((newLocation.originalPrice - newLocation.discountPrice) / newLocation.originalPrice) * 100;
                    newLocation.discount = Math.max(newLocation.discount, 0);
                    newLocation.discount = Math.round(newLocation.discount);
                } else {
                    newLocation.discount = 0;
                }

                return newLocation;
            }));
        }

        const updatedService = await existingService.save();

        return res.status(200).json({ message: "Service location updated successfully.", status: 200, data: updatedService });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.updateServiceLocation = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const locationId = req.params.locationId;

        const existingService = await service.findById(serviceId);
        if (!existingService) {
            return res.status(404).json({ message: "Service not found", status: 404, data: {} });
        }

        const locationIndex = existingService.location.findIndex(loc => loc._id.toString() === locationId);
        if (locationIndex === -1) {
            return res.status(404).json({ message: "Location not found", status: 404, data: {} });
        }

        const updatedLocation = existingService.location[locationIndex];

        const existingCity = await City.findById(req.body.city);
        const existingSector = await Area.findById(req.body.sector);

        if (!existingCity || !existingSector) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid city or sector ID',
            });
        }
        console.log("449", existingService);
        const isDuplicateLocation = existingService.location.some(loc =>
            loc._id.toString() !== locationId &&
            loc.city.toString() === req.body.city &&
            loc.sector.toString() === req.body.sector
        );

        if (isDuplicateLocation) {
            return res.status(400).json({
                status: 400,
                message: 'Location with the same city and sector already exists for this service.',
            });
        }

        if (req.body.city) {
            updatedLocation.city = req.body.city;
        }
        if (req.body.sector) {
            updatedLocation.sector = req.body.sector;
        }
        if (req.body.originalPrice) {
            updatedLocation.originalPrice = req.body.originalPrice;
        }
        if (req.body.discountActive !== undefined) {
            updatedLocation.discountActive = req.body.discountActive;
        }
        if (req.body.discountPrice) {
            updatedLocation.discountPrice = req.body.discountPrice;
        }

        if (updatedLocation.discountActive && updatedLocation.originalPrice && updatedLocation.discountPrice) {
            updatedLocation.discount = ((updatedLocation.originalPrice - updatedLocation.discountPrice) / updatedLocation.originalPrice) * 100;
            updatedLocation.discount = Math.max(updatedLocation.discount, 0);
            updatedLocation.discount = Math.round(updatedLocation.discount);
        } else {
            updatedLocation.discount = 0;
        }

        const updatedService = await existingService.save();

        return res.status(200).json({ message: "Service location updated successfully.", status: 200, data: updatedService });
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
        }).populate({
            path: 'location.city',
            model: 'City',
        }).populate({
            path: 'location.sector',
            model: 'Area',
        }).populate({
            path: 'serviceTypes',
            model: 'ServiceTypeRef',
            populate: [{
                //     path: 'service',
                //     model: 'Service'
                // }, 
                // {
                path: 'serviceType',
                model: 'ServiceType'
            }]
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
        const findService = await service.find().populate('mainCategoryId', 'name').populate('categoryId', 'name').populate('subCategoryId', 'name')
            .populate({
                path: 'location.city',
                model: 'City',
            }).populate({
                path: 'location.sector',
                model: 'Area',
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

        const foundService = await service.findById(id).populate('mainCategoryId', 'name').populate('categoryId', 'name').populate('subCategoryId', 'name')
            .populate({
                path: 'location.city',
                model: 'City',
            }).populate({
                path: 'location.sector',
                model: 'Area',
            });

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

exports.createPackage1 = async (req, res) => {
    try {
        const findMainCategory = await mainCategory.findById(req.body.mainCategoryId);

        if (!findMainCategory) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        let findCategory;
        const findSubCategories = [];

        if (req.body.categoryId) {
            findCategory = await Category.findOne({ mainCategoryId: findMainCategory._id, _id: req.body.categoryId });

            if (!findCategory) {
                return res.status(404).json({ message: "Category Not Found", status: 404, data: {} });
            }
        } else {
            const existingPackage = await Package.findOne({
                title: req.body.title,
                mainCategoryId: findMainCategory._id,
                type: "Package",
                packageType: req.body.packageType,
            });

            if (existingPackage) {
                return res.status(409).json({ message: "Package already exists.", status: 409, data: {} });
            }
        }

        if (req.body.subCategoryId && Array.isArray(req.body.subCategoryId)) {
            for (const subCategoryId of req.body.subCategoryId) {
                const findSubCategory = await subCategory.findOne({
                    _id: subCategoryId,
                    mainCategoryId: findMainCategory._id,
                    categoryId: findCategory._id,
                });

                if (!findSubCategory) {
                    return res.status(404).json({ message: "Subcategory Not Found", status: 404, data: {} });
                }

                findSubCategories.push(findSubCategory);
            }
        }

        let discountPrice, originalPrice, discount = 0, totalTime;
        if (req.body.timeInMin > 60) {
            const hours = Math.floor(req.body.timeInMin / 60);
            const minutes = req.body.timeInMin % 60;
            totalTime = `${hours} hr ${minutes} min`;
        } else {
            const minutes = req.body.timeInMin % 60;
            totalTime = `00 hr ${minutes} min`;
        }

        if (req.body.discountActive === "true") {
            originalPrice = req.body.originalPrice;
            discountPrice = req.body.discountPrice;

            if (originalPrice && discountPrice) {
                discount = ((originalPrice - discountPrice) / originalPrice) * 100;
                discount = Math.max(discount, 0);
                discount = Math.round(discount);
            }
        }

        let images = [];
        if (req.files) {
            for (let j = 0; j < req.files.length; j++) {
                let obj = {
                    img: req.files[j].path,
                };
                images.push(obj);
            }
        }

        let items = [], services = [], servicePackages = [];

        if (req.body.services) {
            for (let i = 0; i < req.body.services.length; i++) {
                let findItem = await service.findById(req.body.services[i]);

                if (!findItem) {
                    return res.status(404).json({ message: `Service Not Found`, status: 404, data: {} });
                }

                let item1 = {
                    service: findItem._id,
                };
                services.push(item1);
            }
        }


        if (req.body.items) {
            for (let i = 0; i < req.body.items.length; i++) {
                let findItem = await item.findById(req.body.items[i]);

                if (!findItem) {
                    return res.status(404).json({ message: `Item Not Found`, status: 404, data: {} });
                }

                let item1 = {
                    item: findItem._id,
                };
                items.push(item1);
            }
        }

        const packageData = {
            mainCategoryId: findMainCategory._id,
            categoryId: findCategory ? findCategory._id : null,
            subCategoryId: findSubCategories.map(subCategory => subCategory._id),
            title: req.body.title,
            description: req.body.description,
            originalPrice: req.body.originalPrice,
            discountActive: req.body.discountActive,
            discount: discount,
            discountPrice: discountPrice,
            totalTime: totalTime,
            timeInMin: req.body.timeInMin,
            images: images,
            E4uSafety: req.body.E4uSafety,
            thingsToKnow: req.body.thingsToKnow,
            E4uSuggestion: req.body.E4uSuggestion,
            type: "Package",
            packageType: req.body.packageType,
            selected: req.body.packageType === "Normal" ? false : true,
            selectedCount: req.body.selectedCount || 0,
            services: services,
            items: items,
        };

        const category = await Package.create(packageData);

        if (req.body.serviceTypesId) {
            const serviceTypeRef = await ServiceTypeRef.create({
                service: category._id,
                serviceType: req.body.serviceTypesId,
            });

            category.serviceTypes = serviceTypeRef._id;
            await category.save();
        }

        for (let i = 0; i < req.body.selectedCount; i++) {
            let obj1 = {
                serviceId: category._id,
                categoryId: findCategory ? findCategory._id : null,
                services: services,
            }
            let savePackage = await servicePackage.create(obj1);
            if (savePackage) {
                await Package.findByIdAndUpdate({ _id: category._id }, { $push: { servicePackageId: savePackage._id } }, { new: true })
            }
            servicePackages.push(savePackage);
        }

        category.servicePackages = servicePackages;
        await category.save();


        return res.status(200).json({ message: "Package added successfully.", status: 200, data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.createPackage = async (req, res) => {
    try {
        let { mainCategoryId, categoryId, subCategoryId, title, description, originalPrice, discountActive, discountPrice, timeInMin, E4uSafety, thingsToKnow, E4uSuggestion, packageType, selectedCount, services, addOnServices, items, serviceTypesId, status } = req.body;

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
            // E4uSafety,
            // thingsToKnow,
            // E4uSuggestion,
            type: "Package",
            packageType,
            selected: packageType !== "Normal",
            selectedCount: packageType === "Customize" ? selectedCount || 0 : 0,
            services: [],
            addOnServices: [],
            items: [],
            status,
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

        if (items && Array.isArray(items)) {
            for (const itemId of items) {
                const findItem = await item.findById(itemId);
                if (!findItem) {
                    return res.status(404).json({ message: `Item Not Found`, status: 404, data: {} });
                }
                packageData.items.push({ item: findItem._id });
            }
        }

        const category = await Package.create(packageData);

        if (serviceTypesId) {
            const serviceTypeRef = await ServiceTypeRef.create({
                service: category._id,
                serviceType: serviceTypesId,
            });

            category.serviceTypes = serviceTypeRef._id;
            await category.save();
        }

        if (packageType === "Customize" && selectedCount > 0) {
            const servicePackages = [];
            for (let i = 0; i < selectedCount; i++) {
                const obj1 = {
                    serviceId: category._id,
                    categoryId: findCategory ? findCategory._id : null,
                    services: packageData.services,
                };
                const savePackage = await servicePackage.create(obj1);
                if (savePackage) {
                    await Package.findByIdAndUpdate({ _id: category._id }, { $push: { servicePackageId: savePackage._id } }, { new: true });
                }
                servicePackages.push(savePackage);
            }

            category.servicePackages = servicePackages;
            await category.save();
        }

        return res.status(200).json({ message: "Package added successfully.", status: 200, data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.addPackageLocation = async (req, res) => {
    try {
        const packageId = req.params.packageId;

        const existingPackage = await Package.findById(packageId).populate('services.service').populate('addOnServices.service');
        if (!existingPackage) {
            return res.status(404).json({ message: "Package not found", status: 404, data: {} });
        }

        const newLocations = req.body.location.map(loc => ({
            city: loc.city,
            sector: loc.sector,
            originalPrice: loc.originalPrice,
            discountActive: loc.discountActive,
            discountPrice: loc.discountPrice,
        }));

        const existingLocations = existingPackage.location.map(loc => ({
            city: loc.city,
            sector: loc.sector,
        }));

        const duplicateLocation = newLocations.find(newLoc => existingLocations.some(existingLoc =>
            existingLoc.city.toString() === newLoc.city.toString() &&
            existingLoc.sector.toString() === newLoc.sector.toString()
        ));

        if (duplicateLocation) {
            return res.status(409).json({
                message: `Location for city ${duplicateLocation.city} and sector ${duplicateLocation.sector} already exists for this packages.`,
                status: 409,
                data: {},
            });
        }

        for (const loc of req.body.location) {
            const existingCity = await City.findById(loc.city);
            const existingSector = await Area.findById(loc.sector);

            if (!existingCity || !existingSector) {
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid city or sector ID',
                });
            }
        }

        if (req.body.location && Array.isArray(req.body.location)) {
            const newLocations = req.body.location.map(async loc => {
                const { city, sector, originalPrice, discountActive, discountPrice } = loc;

                const matchingServices = existingPackage.services.filter(service =>
                    service.service.location.some(location =>
                        location.city.toString() === city.toString() &&
                        location.sector.toString() === sector.toString()
                    )
                );

                const aggregatedLocation = {
                    city: city,
                    sector: sector,
                    originalPrice: originalPrice || 0,
                    discountActive: discountActive || false,
                    discountPrice: discountPrice || 0,
                    discount: 0,
                };

                if (!originalPrice || !discountActive || !discountPrice) {
                    for (const service of matchingServices) {
                        const locationMatch = service.service.location.find(location =>
                            location.city.toString() === city.toString() &&
                            location.sector.toString() === sector.toString()
                        );

                        if (locationMatch) {
                            aggregatedLocation.originalPrice += locationMatch.originalPrice || 0;
                            aggregatedLocation.discountActive = aggregatedLocation.discountActive || locationMatch.discountActive || false;
                            aggregatedLocation.discountPrice += locationMatch.discountPrice || 0;
                        }
                    }
                }

                if (aggregatedLocation.discountActive && aggregatedLocation.originalPrice > 0 && aggregatedLocation.discountPrice > 0) {
                    aggregatedLocation.discount = ((aggregatedLocation.originalPrice - aggregatedLocation.discountPrice) / aggregatedLocation.originalPrice) * 100;
                    aggregatedLocation.discount = Math.max(aggregatedLocation.discount, 0);
                    aggregatedLocation.discount = Math.round(aggregatedLocation.discount);
                }

                return aggregatedLocation;
            });

            const aggregatedLocations = await Promise.all(newLocations);
            existingPackage.location = existingPackage.location.concat(aggregatedLocations);
        }

        const updatedPackage = await existingPackage.save();

        return res.status(200).json({ message: "Package location updated successfully.", status: 200, data: updatedPackage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
    }
};

exports.updatePackageLocation = async (req, res) => {
    try {
        const packageId = req.params.packageId;
        const locationId = req.params.locationId;

        const existingPackage = await Package.findById(packageId).populate('services.service',).populate('addOnServices.service');
        if (!existingPackage) {
            return res.status(404).json({ message: "Package not found", status: 404, data: {} });
        }

        const locationIndex = existingPackage.location.findIndex(loc => loc._id.toString() === locationId);
        if (locationIndex === -1) {
            return res.status(404).json({ message: "Location not found", status: 404, data: {} });
        }

        const updatedLocation = existingPackage.location[locationIndex];

        const existingCity = await City.findById(req.body.city);
        const existingSector = await Area.findById(req.body.sector);

        if (!existingCity || !existingSector) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid city or sector ID',
            });
        }

        const isDuplicateLocation = existingPackage.location.some(loc =>
            loc._id.toString() !== locationId &&
            loc.city.toString() === req.body.city &&
            loc.sector.toString() === req.body.sector
        );

        if (isDuplicateLocation) {
            return res.status(400).json({
                status: 400,
                message: 'Location with the same city and sector already exists for this package.',
            });
        }

        if (req.body.city) {
            updatedLocation.city = req.body.city;
        }
        if (req.body.sector) {
            updatedLocation.sector = req.body.sector;
        }

        if (!req.body.originalPrice || !req.body.discountActive || !req.body.discountPrice) {
            const serviceId = req.body.service;

            const associatedService = existingPackage.services.find(s => s.service._id.toString() === serviceId.toString());

            if (associatedService && associatedService.service && associatedService.service.location) {
                const locationData = associatedService.service.location.find(location =>
                    location.city.toString() === updatedLocation.city.toString() &&
                    location.sector.toString() === updatedLocation.sector.toString()
                );

                if (locationData) {
                    updatedLocation.originalPrice = req.body.originalPrice || locationData.originalPrice || 0;
                    updatedLocation.discountActive = req.body.discountActive || locationData.discountActive || false;
                    updatedLocation.discountPrice = req.body.discountPrice || locationData.discountPrice || 0;

                    if (updatedLocation.discountActive && updatedLocation.originalPrice && updatedLocation.discountPrice) {
                        updatedLocation.discount = ((updatedLocation.originalPrice - updatedLocation.discountPrice) / updatedLocation.originalPrice) * 100;
                        updatedLocation.discount = Math.max(updatedLocation.discount, 0);
                        updatedLocation.discount = Math.round(updatedLocation.discount);
                    } else {
                        updatedLocation.discount = 0;
                    }
                }
            }
        } else {
            updatedLocation.originalPrice = req.body.originalPrice;
            updatedLocation.discountActive = req.body.discountActive;
            updatedLocation.discountPrice = req.body.discountPrice;

            if (updatedLocation.discountActive && updatedLocation.originalPrice && updatedLocation.discountPrice) {
                updatedLocation.discount = ((updatedLocation.originalPrice - updatedLocation.discountPrice) / updatedLocation.originalPrice) * 100;
                updatedLocation.discount = Math.max(updatedLocation.discount, 0);
                updatedLocation.discount = Math.round(updatedLocation.discount);
            } else {
                updatedLocation.discount = 0;
            }
        }

        const updatedPackage = await existingPackage.save();

        return res.status(200).json({ message: "Package location updated successfully.", status: 200, data: updatedPackage });
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
        }).populate({
            path: 'location.sector',
            model: 'Area',
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
exports.getAllPackage = async (req, res) => {
    try {
        const findService = await Package.find().populate('mainCategoryId', 'name').populate('categoryId', 'name').populate('subCategoryId', 'name')
            .populate({
                path: 'location.city',
                model: 'City',
            }).populate({
                path: 'location.sector',
                model: 'Area',
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
            }).populate({
                path: 'location.sector',
                model: 'Area',
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

exports.updatePackage = async (req, res) => {
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
            res.status(200).json({ status: 200, message: 'Offer added successfully', data: saveStore });
        } else {
            res.status(500).json({ status: 500, message: 'Failed to add offer' });
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
exports.assignItems = async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.user._id, });
        if (data) {
            const data1 = await item.findOne({ _id: req.body.itemId, });
            if (data1) {
                const findPartner = await User.findOne({ _id: req.body.userId, });
                if (findPartner) {
                    let findPartnerItem = await partnerItems.findOne({ userId: findPartner._id, itemId: data1._id });
                    if (findPartnerItem) {
                        let obj = { totalStock: req.body.totalStock + findPartnerItem.totalStock, useStock: findPartnerItem.useStock, liveStock: req.body.liveStock + findPartnerItem.totalStock, }
                        let update = await partnerItems.findByIdAndUpdate({ _id: findPartnerItem._id }, { $set: obj }, { new: true })
                        return res.status(200).json({ status: 200, message: "Item assign to partner successfully. ", data: update })
                    } else {
                        let obj = {
                            userId: findPartner._id,
                            itemId: data1._id,
                            totalStock: req.body.totalStock,
                            useStock: 0,
                            liveStock: req.body.totalStock,
                        }
                        const Data = await partnerItems.create(obj);
                        return res.status(200).json({ status: 200, message: "Item assign to partner successfully. ", data: Data })
                    }
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
exports.assignItemslist = async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.user._id, });
        if (data) {
            let findPartnerItem = await partnerItems.find({}).populate('userId itemId');
            if (findPartnerItem.length > 0) {
                return res.status(200).json({ status: 200, message: "Assign Item  get successfully. ", data: findPartnerItem })
            } else {
                return res.status(200).json({ status: 200, message: "Assign Item  get successfully. ", data: [] })
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
exports.createSubscription = async (req, res) => {
    try {
        let findSubscription = await subscription.findOne({ name: req.body.name });
        if (findSubscription) {
            res.json({ status: 409, message: 'subscription already created.', data: {} });
        } else {
            const newsubscription = await subscription.create(req.body);
            res.json({ status: 200, message: 'subscription create successfully', data: newsubscription });
        }
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};
exports.getSubscription = async (req, res) => {
    try {
        const findSubscription = await subscription.find();
        return res.status(200).json({ status: 200, message: "Subscription detail successfully.", data: findSubscription });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
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
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        let findService = await service.findById(id);
        if (!findService) {
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
                findSubCategory = await subCategory.findOne({ categoryId: findCategory._id || findService.categoryId, _id: req.body.subCategoryId });
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
                discountPrice = findService.discountPrice;
                discount = findService.discount;
            }
            const data = {
                categoryId: findCategory._id || findService.categoryId,
                subCategoryId: findSubCategory._id || findService.subCategoryId,
                name: req.body.name || findService.name,
                totalTime: totalTime || findService.totalTime,
                timeInMin: req.body.timeInMin || findService.timeInMin,
                originalPrice: req.body.originalPrice || findService.originalPrice,
                discountPrice: discountPrice || findService.discountPrice,
                discount: discount || findService.discount,
                discountActive: req.body.discountActive || findService.discountActive,
                E4uSafety: req.body.E4uSafety || findService.E4uSafety,
                thingsToKnow: req.body.thingsToKnow || findService.thingsToKnow,
                E4uSuggestion: req.body.E4uSuggestion || findService.E4uSuggestion,
                type: req.body.type || findService.type,
                discription: req.body.discription || findService.discription,
                status: req.body.status
            };
            const category = await service.findByIdAndUpdate({ _id: findService._id }, { $set: data }, { new: true });
            return res.status(200).json({ message: "Service add successfully.", status: 200, data: category });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
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
        res.status(500).json({ error: 'Failed to retrieve leave requests' });
    }
};
exports.approveLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const updatedLeave = await Leave.findByIdAndUpdate(leaveId, { status: 'approved' }, { new: true });
        res.json({ status: 200, message: 'Approved leave successfully', data: updatedLeave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to approve leave' });
    }
};
exports.cancelLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const updatedLeave = await Leave.findByIdAndUpdate(leaveId, { status: 'cancelled' }, { new: true });
        res.json({ status: 200, message: 'Cancel Leave successfully', data: updatedLeave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to cancel leave' });
    }
};
exports.getAllSPAgreements = async (req, res) => {
    try {
        const allSPAgreements = await SPAgreement.find();
        res.json({ status: 200, message: 'All SpAgreement data retrieved successfully', data: allSPAgreements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve SP agreements' });
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
        res.status(500).json({ error: 'Failed to retrieve SP agreement' });
    }
};
exports.getAllTrainingVideos = async (req, res) => {
    try {
        const allTrainingVideos = await TrainingVideo.find();
        res.json({ status: 200, message: 'All traning Video retrieved successfully', data: allTrainingVideos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve training videos' });
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
        res.status(500).json({ error: 'Failed to retrieve training video' });
    }
};
exports.getAllTransportationCharges = async (req, res) => {
    try {
        const allCharges = await TransportationCharge.find();
        res.json({ status: 200, message: 'All transportation charges retrieved successfully', data: allCharges });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve transportation charges' });
    }
};
exports.getTransportationChargeById = async (req, res) => {
    const { id } = req.params;
    try {
        const charge = await TransportationCharge.findById(id);
        if (!charge) {
            return res.status(404).json({ error: 'Transportation charge not found' });
        }
        res.json({ status: 200, message: 'Transportation charge retrieved successfully', data: charge });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve transportation charge' });
    }
};

exports.getAllReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find();
        res.status(200).json({ success: true, data: referrals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to fetch referrals' });
    }
};

exports.getReferralById = async (req, res) => {
    try {
        const referralId = req.params.id;
        const referral = await Referral.findById(referralId);

        if (!referral) {
            return res.status(404).json({ success: false, error: 'Referral not found' });
        }

        res.status(200).json({ success: true, data: referral });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to fetch referral' });
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


exports.createServiceType = async (req, res) => {
    try {
        const { mainCategoryId, name, status } = req.body;
        let fileUrl;
        if (req.file) {
            fileUrl = req.file ? req.file.path : "";
        }

        const checkMainCategory = await mainCategory.findById(mainCategoryId);
        if (!checkMainCategory) {
            return res.status(404).json({
                status: 404,
                message: "Main Category not found",
                data: {},
            });
        }

        const serviceType = new ServiceType({ mainCategoryId, name, status, image: fileUrl });
        const result = await serviceType.save();

        if (!result) {
            return res.status(500).json({
                status: 500,
                message: "Failed to create a new ServiceType",
                data: {},
            });
        }

        return res.status(201).json({
            status: 201,
            message: "ServiceType created successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            data: {},
        });
    }
};

exports.getAllServiceTypes = async (req, res) => {
    try {
        const serviceTypes = await ServiceType.find();

        return res.status(200).json({
            status: 200,
            message: "ServiceTypes retrieved successfully",
            data: serviceTypes,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            data: {},
        });
    }
};

exports.getServiceTypeById = async (req, res) => {
    const { serviceTypeId } = req.params;

    try {
        const serviceType = await ServiceType.findById(serviceTypeId);

        if (!serviceType) {
            return res.status(404).json({
                status: 404,
                message: "ServiceType not found",
                data: {},
            });
        }

        return res.status(200).json({
            status: 200,
            message: "ServiceType retrieved successfully",
            data: serviceType,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            data: {},
        });
    }
};

exports.updateServiceType = async (req, res) => {
    const { serviceTypeId } = req.params;

    const findServiceType = await ServiceType.findById(serviceTypeId);
    if (!findServiceType) {
        return res.status(404).json({
            status: 404,
            message: "ServiceType not found",
            data: {},
        });
    }

    let fileUrl;
    if (req.file) {
        fileUrl = req.file ? req.file.path : "";
    }

    const { name, status, mainCategoryId } = req.body;

    const findMainCategory = await mainCategory.findById(mainCategoryId);
    if (!findMainCategory) {
        return res.status(404).json({
            status: 404,
            message: "Main Category Not Found",
            data: {},
        });
    }

    let obj = {
        mainCategoryId: findMainCategory._id,
        name: name || findServiceType.name,
        image: fileUrl || findServiceType.image,
        status: status || findServiceType.status,
    };

    try {
        const result = await ServiceType.findByIdAndUpdate(
            { _id: serviceTypeId },
            { $set: obj },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                status: 404,
                message: "ServiceType not found",
                data: {},
            });
        }

        return res.status(200).json({
            status: 200,
            message: "ServiceType updated successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            data: {},
        });
    }
};

exports.deleteServiceType = async (req, res) => {
    const { serviceTypeId } = req.params;

    try {
        const result = await ServiceType.findByIdAndRemove(serviceTypeId);

        if (!result) {
            return res.status(404).json({
                status: 404,
                message: "ServiceType not found",
                data: {},
            });
        }

        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            data: {},
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

        res.status(201).json({
            status: 201,
            message: 'City created successfully',
            data: savedCity,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllCities = async (req, res) => {
    try {
        const cities = await City.find();

        res.status(200).json({
            status: 200,
            message: 'Cities retrieved successfully',
            data: cities,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCityById = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);

        if (!city) {
            return res.status(404).json({ message: 'City not found' });
        }

        res.status(200).json({
            status: 200,
            message: 'City retrieved successfully',
            data: city,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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

        res.status(200).json({
            status: 200,
            message: 'City updated successfully',
            data: updatedCity,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCityById = async (req, res) => {
    try {
        const deletedCity = await City.findByIdAndDelete(req.params.id);

        if (!deletedCity) {
            return res.status(404).json({ message: 'City not found' });
        }

        res.status(200).json({
            status: 200,
            message: 'City deleted successfully',
            data: deletedCity,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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

        res.status(201).json({
            status: 201,
            message: 'Area created successfully',
            data: savedArea,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllAreas = async (req, res) => {
    try {
        const areas = await Area.find().populate('city');

        res.status(200).json({
            status: 200,
            message: 'Areas retrieved successfully',
            data: areas,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAreaById = async (req, res) => {
    try {
        const area = await Area.findById(req.params.id).populate('city');

        if (!area) {
            return res.status(404).json({ message: 'Area not found' });
        }

        res.status(200).json({
            status: 200,
            message: 'Area retrieved successfully',
            data: area,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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

        res.status(200).json({
            status: 200,
            message: 'Areas retrieved successfully',
            data: areas,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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

        res.status(200).json({
            status: 200,
            message: 'Area updated successfully',
            data: updatedArea,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteAreaById = async (req, res) => {
    try {
        const deletedArea = await Area.findByIdAndDelete(req.params.id);

        if (!deletedArea) {
            return res.status(404).json({ message: 'Area not found' });
        }

        res.status(200).json({
            status: 200,
            message: 'Area deleted successfully',
            data: deletedArea,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createTestimonial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }
        const { mainCategoryId, title, description } = req.body;

        const category = await mainCategory.findById(mainCategoryId);
        if (!category) {
            return res.status(404).json({ message: "Main Category Not Found", status: 404, data: {} });
        }

        const testimonial = new Testimonial({
            mainCategoryId,
            title,
            description,
            image: req.file.path,
        });

        const savedTestimonial = await testimonial.save();
        res.status(201).json({ status: 201, data: savedTestimonial });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create testimonial" });
    }
};

exports.getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        res.status(200).json({ status: 200, data: testimonials });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve testimonials" });
    }
};

exports.getTestimonialById = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }
        res.status(200).json({ status: 200, data: testimonial });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve testimonial" });
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

        res.status(200).json({ status: 200, message: "Testimonial updated successfully", data: updatedTestimonial });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update testimonial" });
    }
};

exports.deleteTestimonial = async (req, res) => {
    try {
        const testimonialId = req.params.id;

        const deletedTestimonial = await Testimonial.findByIdAndDelete(testimonialId);

        if (!deletedTestimonial) {
            return res.status(404).json({ message: "Testimonial not found", status: 404, data: {} });
        }

        res.status(200).json({ status: 200, message: "Testimonial deleted successfully", data: {} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete testimonial" });
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










