const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
var newOTP = require("otp-generators");
const User = require("../models/user.model");
const Address = require("../models/AddressModel");
const Cart = require("../models/cartModel");
const Charges = require('../models/Charges');
const freeService = require('../models/freeService');
const service = require('../models/service');
const Coupan = require('../models/Coupan');
const feedback = require('../models/feedback');
const orderModel = require('../models/orderModel');
const offer = require('../models/offer');
const ticket = require('../models/ticket');
const Rating = require('../models/ratingModel');
const favouriteBooking = require('../models/favouriteBooking');
const servicePackage = require('../models/servicePackage');
const Package = require('../models/packageModel');
const Testimonial = require("../models/testimonial");
const Order = require('../models/orderModel')
const IssueReport = require('../models/reportIssueModel');
const Category = require("../models/category/Category");
const MainCategory = require("../models/category/mainCategory");
const SubCategory = require("../models/category/subCategory");
const transactionModel = require("../models/transactionModel");
const MinimumCart = require('../models/miniumCartAmountModel');
const City = require('../models/cityModel');
const Area = require('../models/areaModel');
const banner = require('../models/banner/banner');
const { charges } = require("../middlewares/imageUpload");
const Slot = require('../models/SlotModel');
const moment = require('moment');
const Pet = require('../models/petModel');







exports.registration = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.user._id });
                if (user) {
                        if (req.body.refferalCode == null || req.body.refferalCode == undefined) {
                                req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                                // req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                                req.body.otpExpiration = new Date(Date.now() + 30 * 1000);
                                req.body.accountVerification = false;
                                req.body.refferalCode = await reffralCode();
                                req.body.completeProfile = true;
                                const userCreate = await User.findOneAndUpdate({ _id: user._id }, req.body, { new: true, });
                                let obj = { id: userCreate._id, completeProfile: userCreate.completeProfile, phone: userCreate.phone }
                                return res.status(200).send({ status: 200, message: "Registered successfully ", data: obj, });
                        } else {
                                const findUser = await User.findOne({ refferalCode: req.body.refferalCode });
                                if (findUser) {
                                        req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                                        // req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                                        req.body.otpExpiration = new Date(Date.now() + 30 * 1000);
                                        req.body.accountVerification = false;
                                        req.body.userType = "USER";
                                        req.body.refferalCode = await reffralCode();
                                        req.body.refferUserId = findUser._id;
                                        req.body.completeProfile = true;
                                        const userCreate = await User.findOneAndUpdate({ _id: user._id }, req.body, { new: true, });
                                        if (userCreate) {
                                                let updateWallet = await User.findOneAndUpdate({ _id: findUser._id }, { $push: { joinUser: userCreate._id } }, { new: true });
                                                let obj = { id: userCreate._id, completeProfile: userCreate.completeProfile, phone: userCreate.phone }
                                                return res.status(200).send({ status: 200, message: "Registered successfully ", data: obj, });
                                        }
                                } else {
                                        return res.status(404).send({ status: 404, message: "Invalid refferal code", data: {} });
                                }
                        }
                } else {
                        return res.status(404).send({ status: 404, msg: "Not found" });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.socialLogin = async (req, res) => {
        try {
                const { firstName, lastName, email, phone } = req.body;
                console.log(req.body);
                const user = await User.findOne({ $and: [{ $or: [{ email }, { phone }] }, { userType: "USER" }] });
                if (user) {
                        jwt.sign({ id: user._id }, authConfig.secret, (err, token) => {
                                if (err) {
                                        return res.status(401).send("Invalid Credentials");
                                } else {
                                        return res.status(200).json({ status: 200, msg: "Login successfully", userId: user._id, token: token, });
                                }
                        });
                } else {
                        let refferalCode = await reffralCode();
                        const newUser = await User.create({ firstName, lastName, phone, email, refferalCode, userType: "USER" });
                        if (newUser) {
                                jwt.sign({ id: newUser._id }, authConfig.secret, (err, token) => {
                                        if (err) {
                                                return res.status(401).send("Invalid Credentials");
                                        } else {
                                                console.log(token);
                                                return res.status(200).json({ status: 200, msg: "Login successfully", userId: newUser._id, token: token, });
                                        }
                                });
                        }
                }
        } catch (err) {
                console.error(err);
                return createResponse(res, 500, "Internal server error");
        }
};
exports.loginWithPhone = async (req, res) => {
        try {
                const { phone } = req.body;

                if (phone.replace(/\D/g, '').length !== 10) {
                        return res.status(400).send({ status: 400, message: "Invalid phone number length" });
                }

                const user = await User.findOne({ phone: phone, userType: "USER" });
                if (!user) {
                        let otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        // let otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        let otpExpiration = new Date(Date.now() + 30 * 1000);
                        let accountVerification = false;
                        const newUser = await User.create({ phone: phone, otp, otpExpiration, accountVerification, userType: "USER" });
                        let obj = { id: newUser._id, otp: newUser.otp, phone: newUser.phone }
                        return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
                } else {
                        const userObj = {};
                        userObj.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        // userObj.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        userObj.otpExpiration = Date.now() + 30 * 1000;
                        userObj.accountVerification = false;
                        const updated = await User.findOneAndUpdate({ phone: phone, userType: "USER" }, userObj, { new: true, });
                        let obj = { id: updated._id, otp: updated.otp, phone: updated.phone }
                        return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.verifyOtp = async (req, res) => {
        try {
                const { otp } = req.body;
                const user = await User.findById(req.params.id);
                if (!user) {
                        return res.status(404).send({ message: "user not found" });
                }
                if (user.otp !== otp || user.otpExpiration < Date.now()) {
                        return res.status(400).json({ message: "Invalid or expired OTP" });

                }
                const updated = await User.findByIdAndUpdate({ _id: user._id }, { accountVerification: true }, { new: true });
                const accessToken = await jwt.sign({ id: user._id }, authConfig.secret, {
                        expiresIn: authConfig.accessTokenTime,
                });
                let obj = {
                        userId: updated._id,
                        otp: updated.otp,
                        phone: updated.phone,
                        token: accessToken,
                        completeProfile: updated.completeProfile
                }
                return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ error: "internal server error" + err.message });
        }
};
exports.getProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, }).select('fullName email phone gender alternatePhone dob address1 address2 image refferalCode completeProfile city sector isCity isSector').populate('city sector');
                if (data) {
                        return res.status(200).json({ status: 200, message: "get Profile", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateProfile = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        let image;
                        if (req.file) {
                                image = req.file.path
                        }
                        let obj = {
                                fullName: req.body.fullName || data.fullName,
                                email: req.body.email || data.email,
                                phone: req.body.phone || data.phone,
                                gender: req.body.gender || data.gender,
                                alternatePhone: req.body.alternatePhone || data.alternatePhone,
                                dob: req.body.dob || data.dob,
                                address1: req.body.address1 || data.address1,
                                address2: req.body.address2 || data.address2,
                                image: image || data.image
                        }
                        console.log(obj);
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: obj }, { new: true });
                        if (update) {
                                return res.status(200).json({ status: 200, message: "Update profile successfully.", data: update });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.resendOTP = async (req, res) => {
        const { id } = req.params;
        try {
                const user = await User.findOne({ _id: id, userType: "USER" });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }
                const otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                const accountVerification = false;
                const updated = await User.findOneAndUpdate({ _id: user._id }, { otp, otpExpiration, accountVerification }, { new: true });
                let obj = {
                        id: updated._id,
                        otp: updated.otp,
                        phone: updated.phone
                }
                return res.status(200).send({ status: 200, message: "OTP resent", data: obj });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.updateLocation1 = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.user._id, });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        if (req.body.currentLat || req.body.currentLong) {
                                coordinates = [parseFloat(req.body.currentLat), parseFloat(req.body.currentLong)]
                                req.body.currentLocation = { type: "Point", coordinates };
                        }
                        let update = await User.findByIdAndUpdate({ _id: user._id }, { $set: { currentLocation: req.body.currentLocation, city: req.body.city, sector: req.body.sector } }, { new: true });
                        if (update) {
                                let obj = {
                                        currentLocation: update.currentLocation,
                                        city: update.city,
                                        sector: update.sector
                                }
                                return res.status(200).send({ status: 200, message: "Location update successfully.", data: obj });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

exports.updateLocation = async (req, res) => {
        try {
                const user = await User.findOne({ _id: req.user._id });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                let updateFields = {};

                if (req.body.currentLat || req.body.currentLong) {
                        const coordinates = [parseFloat(req.body.currentLat), parseFloat(req.body.currentLong)];
                        updateFields.currentLocation = { type: "Point", coordinates };
                }

                if (req.body.city) {
                        updateFields.city = req.body.city;
                        updateFields.isCity = true;
                }

                if (req.body.sector) {
                        updateFields.sector = req.body.sector;
                        updateFields.isSector = true;
                }

                const updatedUser = await User.findByIdAndUpdate(
                        { _id: user._id },
                        { $set: updateFields },
                        { new: true }
                );

                if (updatedUser) {
                        let obj = {
                                currentLocation: updatedUser.currentLocation,
                                city: updatedUser.city,
                                sector: updatedUser.sector,
                        };
                        return res.status(200).send({ status: 200, message: "Location update successful.", data: obj });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

exports.createAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        req.body.user = data._id;
                        const address = await Address.create(req.body);
                        return res.status(200).json({ message: "Address create successfully.", data: address });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getallAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const allAddress = await Address.find({ user: data._id });
                        return res.status(200).json({ message: "Address data found.", data: allAddress });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await Address.findById({ _id: req.params.id });
                        if (data1) {
                                const newAddressData = req.body;
                                let update = await Address.findByIdAndUpdate(data1._id, newAddressData, { new: true, });
                                return res.status(200).json({ status: 200, message: "Address update successfully.", data: update });
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
exports.deleteAddress = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await Address.findById({ _id: req.params.id });
                        if (data1) {
                                let update = await Address.findByIdAndDelete(data1._id);
                                return res.status(200).json({ status: 200, message: "Address Deleted Successfully", });
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
exports.getAddressbyId = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await Address.findById({ _id: req.params.id });
                        if (data1) {
                                return res.status(200).json({ status: 200, message: "Address found successfully.", data: data1 });
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
exports.createPet = async (req, res) => {
        try {
                const { petName, breed, age, gender } = req.body;
                const userId = req.user._id;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                let image;
                if (req.file) {
                        image = req.file.path
                }

                const newPet = await Pet.create({
                        user: userId,
                        petName,
                        breed,
                        image: image,
                        age,
                        gender
                });

                return res.status(201).json({ status: 201, data: newPet });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Server Error' });
        }
};

exports.getPets = async (req, res) => {
        try {
                const userId = req.user._id;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const pets = await Pet.find({ user: userId });

                return res.status(200).json({ status: 200, data: pets });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Server Error' });
        }
};

exports.getPetById = async (req, res) => {
        try {
                const userId = req.user._id;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const pet = await Pet.findById(req.params.id);
                if (!pet) {
                        return res.status(404).json({ status: 404, message: 'Pet not found' });
                }
                return res.status(200).json({ status: 200, data: pet });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Server Error' });
        }
};

exports.updatePet = async (req, res) => {
        try {
                const userId = req.user._id;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                let imageData;
                if (req.file) {
                        imageData = req.file.path;
                }

                const pet = await Pet.findByIdAndUpdate(req.params.id, { ...req.body, image: imageData }, {
                        new: true,
                        runValidators: true
                });

                if (!pet) {
                        return res.status(404).json({ status: 404, message: 'Pet not found' });
                }

                return res.status(200).json({ status: 200, data: pet });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Server Error' });
        }
};

exports.deletePet = async (req, res) => {
        try {
                const userId = req.user._id;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const pet = await Pet.findByIdAndDelete(req.params.id);
                if (!pet) {
                        return res.status(404).json({ status: 404, message: 'Pet not found' });
                }
                res.status(200).json({ status: 200, message: 'Pet deleted successfully' });
        } catch (error) {
                console.error(error);
                res.status(500).json({ status: 500, message: 'Server Error' });
        }
};





















exports.getFreeServices = async (req, res) => {
        const findFreeService = await freeService.find({ userId: req.user._id }).populate([{ path: 'userId', select: 'fullName firstName lastName' }, { path: 'serviceId' }]);
        return res.status(201).json({ message: "Free Service Found", status: 200, data: findFreeService, });
};
// exports.getCart = async (req, res) => {
//         try {
//                 let userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).json({ status: 404, message: "No data found", data: {} });
//                 } else {
//                         let findCart = await Cart.findOne({ userId: userData._id }).populate("coupanId services.serviceId Charges.chargeId").populate({ path: 'freeService.freeServiceId', populate: { path: 'serviceId', model: 'services', select: "title originalPrice totalTime discount discountActive timeInMin" }, })
//                         if (!findCart) {
//                                 return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
//                         } else {
//                                 let totalOriginalPrice = 0;
//                                 for (const cartItem of findCart.services) {
//                                         if (cartItem.serviceId.originalPrice) {
//                                                 totalOriginalPrice += cartItem.serviceId.originalPrice * cartItem.quantity;
//                                         }
//                                 }
//                                 console.log('Total Original Price:', totalOriginalPrice);

//                                 // const isMinimumCartAmount = findCart.totalAmount >= findCart.minimumCartAmount;
//                                 // if (!isMinimumCartAmount) {
//                                 //         return res.status(400).json({ status: 400, data: { "Please add more data to placed order minimumAmount": 500, "isMinimumCartAmount": true } });
//                                 // }

//                                 return res.status(200).json({ message: "cart data found.", status: 200, data: { ...findCart.toObject(), totalOriginalPrice, /*"isMinimumCartAmount": false*/ } });
//                         }
//                 }
//         } catch (error) {
//                 console.log(error);
//                 return res.status(501).send({ status: 501, message: "server error.", data: {}, });
//         }
// };

exports.getCart1 = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id })
                                .populate("coupanId services.serviceId Charges.chargeId")
                                .populate({
                                        path: 'freeService.freeServiceId',
                                        populate: { path: 'serviceId', model: 'Service', select: "title originalPrice totalTime discount discountActive timeInMin" }
                                })
                                // .populate({
                                //         path: 'packages.services.serviceId',
                                //         model: 'Package',
                                //         select: 'title originalPrice totalTime discount discountActive timeInMin'
                                // })
                                .populate({
                                        path: 'packages.packageId',
                                        model: 'Package'
                                });
                        console.log("cart", findCart);
                        const minimumCart = await MinimumCart.findOne();

                        if (!findCart) {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        } else {
                                let totalOriginalPrice = 0;
                                let totalDiscountActive = 0;
                                let totalDiscount = 0;
                                let totalDiscountPrice = 0;
                                let totalQuantityInCart = 0;
                                let totalIsInCart = 0;
                                let totalHours = 0;
                                let totalMinutes = 0;

                                for (const cartItem of findCart.services) {
                                        if (cartItem.serviceId) {
                                                if (cartItem.serviceId.originalPrice) {
                                                        totalOriginalPrice += cartItem.serviceId.originalPrice * cartItem.quantity;
                                                }

                                                if (cartItem.serviceId.discountActive) {
                                                        totalDiscountActive++;
                                                }

                                                totalDiscount += cartItem.serviceId.discount ? cartItem.serviceId.discount * cartItem.quantity : 0;

                                                if (cartItem.serviceId.discountActive && cartItem.serviceId.discountPrice) {
                                                        totalDiscountPrice += cartItem.serviceId.discountPrice * cartItem.quantity;
                                                }

                                                totalQuantityInCart += cartItem.quantity;
                                                totalIsInCart++;

                                                const timeParts = cartItem.serviceId.totalTime.split(" ");
                                                const hours = parseInt(timeParts[0]) || 0;
                                                const minutes = parseInt(timeParts[2]) || 0;

                                                totalHours += hours;
                                                totalMinutes += minutes;
                                        }
                                }

                                for (const cartItem of findCart.packages) {
                                        if (cartItem.packageId) {
                                                for (const service of cartItem.services) {
                                                        if (service.serviceId && service.serviceId.totalTime) {
                                                                const timeParts = service.serviceId.totalTime.split(" ");
                                                                const hours = parseInt(timeParts[0]) || 0;
                                                                const minutes = parseInt(timeParts[2]) || 0;

                                                                totalHours += hours;
                                                                totalMinutes += minutes;
                                                        }
                                                }
                                        }
                                }

                                const timeSlotsFromCart = {
                                        timeFrom: findCart.startTime,
                                        timeTo: findCart.endTime,
                                };

                                const matchingTimeSlots = await Slot.find({
                                        $and: [
                                                { isSurgeAmount: true },
                                                timeSlotsFromCart,
                                        ],
                                });

                                let totalIsSlotPrice = 0;
                                for (const slot of matchingTimeSlots) {
                                        totalIsSlotPrice += slot.surgeAmount;
                                }
                                findCart.paidAmount += totalIsSlotPrice;

                                const totalHoursString = totalHours > 0 ? `${totalHours} hr` : "";
                                const totalMinutesString = totalMinutes > 0 ? ` ${totalMinutes} min` : "";

                                const totalTimeTaken = totalHoursString + totalMinutesString;

                                if (findCart.totalAmount <= findCart.minimumCartAmount) {
                                        return res.status(400).json({ status: 400, data: { "Please add more data to place an order minimumAmount": findCart.minimumCartAmount } });
                                }

                                return res.status(200).json({
                                        message: "Cart data found.",
                                        status: 200,
                                        data: {
                                                ...findCart.toObject(),
                                                totalOriginalPrice,
                                                totalDiscountActive,
                                                totalDiscount,
                                                totalDiscountPrice,
                                                totalQuantityInCart,
                                                totalIsInCart,
                                                minimumCartAmount: minimumCart ? minimumCart.minimumCartAmount : 0,
                                                totalTimeTaken,
                                                totalIsSlotPrice
                                        },
                                });
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "Server error.", data: {} });
        }
};

async function getServicePrice1(serviceId, userCity, userSector) {
        try {
                let service1;
                service1 = await service.findById(serviceId).populate('location');


                const location = service1.location.find(location =>
                        location.city.toString() === userCity.toString() &&
                        location.sector.toString() === userSector.toString()
                );

                console.log("Service:", service1);
                console.log("Location:", location);

                if (!location) {
                        throw new Error("Location not found for the specified city and sector.");
                }

                console.log("Price Details:", {
                        originalPrice: location.originalPrice || 0,
                        discountPrice: location.discountPrice || 0,
                        discount: location.discount || 0,
                        discountActive: location.discountActive || false,
                        totalTime: service1.totalTime || "",
                });

                return {
                        originalPrice: location.originalPrice || 0,
                        discountPrice: location.discountPrice || 0,
                        discount: location.discount || 0,
                        discountActive: location.discountActive || false,
                        totalTime: service1.totalTime || "",

                };
        } catch (error) {
                console.error("Error in getServicePrice:", error);
                return {
                        originalPrice: 0,
                        discountPrice: 0,
                        discount: 0,
                        discountActive: false,
                        totalTime: "",
                };
        }
}

exports.getCart = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });

                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                if (!userData.city || !userData.sector) {
                        return res.status(400).json({ status: 400, message: "Please select a location before getting services to the cart." });
                }

                const findCart = await Cart.findOne({ userId: userData._id })
                        .populate("coupanId services.serviceId Charges.chargeId")
                        .populate({
                                path: 'freeService.freeServiceId',
                                populate: { path: 'serviceId', model: 'Service', select: "title originalPrice totalTime discount discountActive timeInMin" }
                        })
                        .populate({
                                path: 'services.serviceId',
                                model: 'Service',
                                populate: {
                                        path: 'mainCategoryId categoryId subCategoryId',
                                        model: 'mainCategory'
                                }
                        })
                        .populate({
                                path: 'services.serviceId',
                                model: 'Service',
                                populate: {
                                        path: 'categoryId',
                                        model: 'Category'
                                }
                        })
                        .populate({
                                path: 'services.serviceId',
                                model: 'Service',
                                populate: {
                                        path: 'subCategoryId',
                                        model: 'subCategory'
                                }
                        })
                        .populate({
                                path: 'packages.packageId',
                                model: 'Package',
                                populate: {
                                        path: 'mainCategoryId categoryId subCategoryId',
                                        model: 'mainCategory'
                                }
                        })
                        .populate({
                                path: 'packages.packageId',
                                model: 'Package',
                                populate: {
                                        path: 'categoryId',
                                        model: 'Category'
                                }
                        })
                        .populate({
                                path: 'packages.packageId',
                                model: 'Package',
                                populate: {
                                        path: 'subCategoryId',
                                        model: 'subCategory'
                                }
                        })
                        .populate({
                                path: 'packages.packageId.servicces.serviceId',
                                model: 'Service',
                                // populate: {
                                //         path: 'subCategoryId',
                                //         model: 'subCategory'
                                // }
                        })
                if (!findCart) {
                        return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                }

                const { totalOriginalPrice, totalDiscountActive, totalDiscount, totalDiscountPrice, totalQuantityInCart, totalIsInCart, totalTimeTaken, totalIsSlotPrice } = await calculateCartPrices(findCart, userData);

                const minimumCart = await MinimumCart.findOne();

                if (findCart.totalAmount <= (minimumCart ? minimumCart.minimumCartAmount : 0)) {
                        return res.status(400).json({
                                status: 400,
                                message: "Please add more items to meet the minimum cart amount.",
                                data: { minimumCartAmount: minimumCart ? minimumCart.minimumCartAmount : 0 }
                        });
                }

                // if (findCart.packages && findCart.packages.length > 0) {
                //         for (const cartItem of findCart.packages) {
                //                 if (cartItem.packageType === 'Customize') {
                //                         if (cartItem.selectedCount !== cartItem.services.length) {
                //                                 return res.status(400).json({
                //                                         status: 400,
                //                                         message: `Please select ${cartItem.packageId.selectedCount} services for the customized package.`,
                //                                 });
                //                         }
                //                 }
                //         }
                // }

                return res.status(200).json({
                        status: 200,
                        message: "Cart data found.",
                        data: {
                                ...findCart.toObject(),
                                totalOriginalPrice,
                                totalDiscountActive,
                                totalDiscount,
                                totalDiscountPrice,
                                totalQuantityInCart,
                                totalIsInCart,
                                minimumCartAmount: minimumCart ? minimumCart.minimumCartAmount : 0,
                                totalTimeTaken,
                                totalIsSlotPrice
                        },
                });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: "Server error.", data: {} });
        }
};

async function calculateCartPrices(findCart, userData) {
        let totalOriginalPrice = 0;
        let totalDiscountActive = 0;
        let totalDiscount = 0;
        let totalDiscountPrice = 0;
        let totalQuantityInCart = 0;
        let totalIsInCart = 0;
        let totalHours = 0;
        let totalMinutes = 0;
        let totalIsSlotPrice = 0;

        for (const cartItem of findCart.services) {
                if (cartItem.serviceId) {
                        const priceDetails = await getServicePrice1(cartItem.serviceId, userData.city, userData.sector);

                        cartItem.serviceId.originalPrice = priceDetails.originalPrice;
                        cartItem.serviceId.discountPrice = priceDetails.discountPrice;
                        cartItem.serviceId.discount = priceDetails.discount;
                        cartItem.serviceId.discountActive = priceDetails.discountActive;

                        totalOriginalPrice += priceDetails.originalPrice * cartItem.quantity;
                        totalDiscountActive += priceDetails.discountActive ? 1 : 0;
                        totalDiscount += priceDetails.discount * cartItem.quantity;
                        totalDiscountPrice += priceDetails.discountActive ? priceDetails.discountPrice * cartItem.quantity : 0;
                        totalQuantityInCart += cartItem.quantity;
                        totalIsInCart++;

                        const timeParts = cartItem.serviceId.totalTime.split(" ");

                        const hours = parseInt(timeParts[0]) || 0;
                        const minutes = parseInt(timeParts[2]) || 0;

                        totalHours += hours;
                        totalMinutes += minutes;
                }
        }

        for (const cartItem of findCart.packages) {
                for (const service of cartItem.services) {
                        console.log("service test", service);
                        if (service.serviceId) {
                                const priceDetails = await getServicePrice1(service.serviceId, userData.city, userData.sector);

                                service.serviceId.originalPrice = priceDetails.originalPrice;
                                service.serviceId.discountPrice = priceDetails.discountPrice;
                                service.serviceId.discount = priceDetails.discount;
                                service.serviceId.discountActive = priceDetails.discountActive;
                                service.serviceId.totalTime = priceDetails.totalTime;

                                totalOriginalPrice += priceDetails.originalPrice * service.quantity;
                                totalDiscountActive += priceDetails.discountActive ? 1 : 0;
                                totalDiscount += priceDetails.discount * service.quantity;
                                totalDiscountPrice += priceDetails.discountActive ? priceDetails.discountPrice * service.quantity : 0;
                                totalQuantityInCart += cartItem.quantity;
                                totalIsInCart++;

                                const timeParts = (priceDetails.totalTime || "").split(" ");
                                const hours = parseInt(timeParts[0]) || 0;
                                const minutes = parseInt(timeParts[2]) || 0;

                                totalHours += hours;
                                totalMinutes += minutes;
                        }
                }
        }

        const timeSlotsFromCart = {
                timeFrom: findCart.startTime,
                timeTo: findCart.endTime,
        };

        const matchingTimeSlots = await Slot.find({
                $and: [
                        { isSurgeAmount: true },
                        timeSlotsFromCart,
                ],
        });

        for (const slot of matchingTimeSlots) {
                totalIsSlotPrice += slot.surgeAmount;
        }

        findCart.paidAmount += totalIsSlotPrice;

        const totalHoursString = totalHours > 0 ? `${totalHours} hr` : "";

        const totalMinutesString = totalMinutes > 0 ? ` ${totalMinutes} min` : "";

        const totalTimeTaken = totalHoursString + totalMinutesString;

        await findCart.save();

        return {
                totalOriginalPrice,
                totalDiscountActive,
                totalDiscount,
                totalDiscountPrice,
                totalQuantityInCart,
                totalIsInCart,
                totalTimeTaken,
                totalIsSlotPrice
        };
}

exports.listOffer = async (req, res) => {
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
exports.getUserOffer = async (req, res) => {
        try {
                let vendorData = await User.findOne({ _id: req.user._id });
                if (!vendorData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findService = await offer.find({ $and: [{ $or: [{ userId: vendorData._id }, { type: "user" }] }] });
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
exports.createTicket = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        let tiketId = await ticketCode();
                        let obj = {
                                userId: data._id,
                                tiketId: tiketId,
                                title: req.body.title,
                                description: req.body.description,
                        }
                        const newUser = await ticket.create(obj);
                        if (newUser) {
                                return res.status(200).json({ status: 200, message: "Ticket create successfully.", data: newUser });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getTicketbyId = async (req, res, next) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await ticket.findById({ _id: req.params.id });
                        if (data1) {
                                return res.status(200).json({ status: 200, message: "Ticket found successfully.", data: data1 });
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
exports.listTicket = async (req, res) => {
        try {
                let findUser = await User.findOne({ _id: req.user._id });
                if (!findUser) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findTicket = await ticket.find({ userId: findUser._id });
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
// exports.addToCart = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         const findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 const findService = await service.findById({ _id: req.body._id });
//                                 const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));

//                                 if (existingService) {
//                                         existingService.quantity += req.body.quantity;
//                                         existingService.total = existingService.price * existingService.quantity;

//                                         findCart.totalAmount += existingService.price * req.body.quantity;
//                                         findCart.paidAmount += existingService.price * req.body.quantity;

//                                         await findCart.save();
//                                         console.log("first", findCart);
//                                         return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });

//                                 } else {
//                                         const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;

//                                         const newService = {
//                                                 serviceId: findService._id,
//                                                 price: price,
//                                                 quantity: req.body.quantity,
//                                                 total: price * req.body.quantity,
//                                                 type: "Service"
//                                         };

//                                         findCart.services.push(newService);

//                                         findCart.totalAmount += newService.total;
//                                         findCart.paidAmount += newService.total;
//                                         findCart.totalItem++;

//                                         await findCart.save();
//                                         console.log("else second", findCart);
//                                         return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
//                                 }

//                         } else {
//                                 let findService = await service.findById({ _id: req.body._id });
//                                 console.log("findServicesPrince", findService);
//                                 if (findService) {
//                                         let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
//                                         const findCharge = await Charges.find({});
//                                         if (findCharge.length > 0) {
//                                                 for (let i = 0; i < findCharge.length; i++) {
//                                                         let obj1 = {
//                                                                 chargeId: findCharge[i]._id,
//                                                                 charge: findCharge[i].charge,
//                                                                 discountCharge: findCharge[i].discountCharge,
//                                                                 discount: findCharge[i].discount,
//                                                                 cancelation: findCharge[i].cancelation,
//                                                         }
//                                                         if (findCharge[i].cancelation == false) {
//                                                                 if (findCharge[i].discount == true) {
//                                                                         additionalFee = additionalFee + findCharge[i].discountCharge
//                                                                 } else {
//                                                                         additionalFee = additionalFee + findCharge[i].charge
//                                                                 }
//                                                         }
//                                                         Charged.push(obj1)
//                                                 }
//                                         }
//                                         if (findService.type == "Service") {
//                                                 console.log(findService);
//                                                 let price = 0;
//                                                 if (findService.discountActive == true) {
//                                                         price = findService.discountPrice;
//                                                 } else {
//                                                         price = findService.originalPrice;
//                                                 }
//                                                 totalAmount = Number(price * req.body.quantity).toFixed(2);
//                                                 paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
//                                                 let obj = {
//                                                         userId: userData._id,
//                                                         Charges: Charged,
//                                                         services: [{
//                                                                 serviceId: findService._id,
//                                                                 packageServices: req.body.packageServices,
//                                                                 price: price,
//                                                                 quantity: req.body.quantity,
//                                                                 total: price * req.body.quantity,
//                                                                 type: "Service"
//                                                         }],
//                                                         totalAmount: totalAmount,
//                                                         additionalFee: additionalFee,
//                                                         paidAmount: paidAmount,
//                                                         totalItem: 1,
//                                                 }
//                                                 const Data = await Cart.create(obj);
//                                                 console.log("third", Data);
//                                                 return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                         }
//                                         if (findService.type == "Package") {
//                                                 if (findService.packageType == "Edit") {
//                                                         console.log(findService);
//                                                         let categoryServices = []
//                                                         if (!req.body.servicePackageId) {
//                                                                 return res.status(400).json({ status: 400, message: "Package Service not edit." })
//                                                         }
//                                                         let findServicePackage = await servicePackage.findById({ _id: req.body.servicePackageId })
//                                                         if (findServicePackage) {

//                                                                 let packageServices = []; for (let i = 0; i < req.body.packageServices.length; i++) {
//                                                                         let findService1 = await service.findById({ _id: req.body.packageServices[i] });
//                                                                         packageServices.push(findService1._id);
//                                                                         let price = 0;
//                                                                         if (findService.discountActive == true) {
//                                                                                 price = findService.discountPrice;
//                                                                         } else {
//                                                                                 price = findService.originalPrice;
//                                                                         }
//                                                                         let obj = {
//                                                                                 service: findService1._id,
//                                                                                 price: price,
//                                                                                 quantity: 1,
//                                                                                 total: price,
//                                                                         }
//                                                                         categoryServices.push(obj)
//                                                                 }
//                                                         }
//                                                         let total = 0;
//                                                         for (let j = 0; j < categoryServices.length; j++) {
//                                                                 total = total + categoryServices[j].total
//                                                         }
//                                                         totalAmount = Number(total).toFixed(2);
//                                                         paidAmount = (Number((total).toFixed(2)) + Number(additionalFee))
//                                                         let obj = {
//                                                                 userId: userData._id,
//                                                                 Charges: Charged,
//                                                                 totalAmount: totalAmount,
//                                                                 services: [{
//                                                                         serviceId: findService._id,
//                                                                         categoryId: findServicePackage.categoryId,
//                                                                         services: categoryServices,
//                                                                         packageServices: packageServices,
//                                                                         quantity: 1,
//                                                                         total: total,
//                                                                         type: "Package",
//                                                                         packageType: "Edit",
//                                                                 }],
//                                                                 additionalFee: additionalFee,
//                                                                 paidAmount: paidAmount,
//                                                                 totalItem: 1,
//                                                         }
//                                                         console.log("fourth", obj);
//                                                         const Data = await Cart.create(obj);
//                                                         return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                                 } else if (findService.packageType == "Normal") {
//                                                         let price = 0;
//                                                         if (findService.discountActive == true) {
//                                                                 price = findService.discountPrice;
//                                                         } else {
//                                                                 price = findService.originalPrice;
//                                                         }
//                                                         totalAmount = Number(price * req.body.quantity).toFixed(2);
//                                                         paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
//                                                         console.log(totalAmount, additionalFee, paidAmount);
//                                                         let obj = {
//                                                                 userId: userData._id,
//                                                                 Charges: Charged,
//                                                                 services: [{
//                                                                         serviceId: findService._id,
//                                                                         price: price,
//                                                                         quantity: req.body.quantity,
//                                                                         total: price * req.body.quantity,
//                                                                         type: "Package",
//                                                                         packageType: "Normal",
//                                                                 }],
//                                                                 totalAmount: totalAmount,
//                                                                 additionalFee: additionalFee,
//                                                                 paidAmount: paidAmount,
//                                                                 totalItem: 1,
//                                                         }
//                                                         console.log("fifth", obj);

//                                                         const Data = await Cart.create(obj);
//                                                         return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                                 } else if (findService.packageType == "Customise") {
//                                                         console.log(findService);
//                                                         let price = 0, services = [];
//                                                         if (findService.discountActive == true) {
//                                                                 price = findService.discountPrice;
//                                                         } else {
//                                                                 price = findService.originalPrice;
//                                                         }
//                                                         totalAmount = Number(price * req.body.quantity).toFixed(2);
//                                                         paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
//                                                         if (findService.selectedCount == (req.body.packageServices).length) {
//                                                                 let obj = {
//                                                                         serviceId: findService._id,
//                                                                         packageServices: req.body.packageServices,
//                                                                         price: price,
//                                                                         quantity: req.body.quantity,
//                                                                         total: price * req.body.quantity,
//                                                                         type: "Package",
//                                                                         packageType: "Customise",
//                                                                 }
//                                                                 services.push(obj)
//                                                                 let obj1 = {
//                                                                         userId: userData._id,
//                                                                         Charges: Charged,
//                                                                         services: services,
//                                                                         totalAmount: totalAmount,
//                                                                         additionalFee: additionalFee,
//                                                                         paidAmount: paidAmount,
//                                                                         totalItem: 1,
//                                                                 }
//                                                                 console.log("sixth", obj);
//                                                                 console.log("seventh", obj1);

//                                                                 const Data = await Cart.create(obj1);
//                                                                 return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                                         } else {
//                                                                 return res.status(201).send({ status: 201, message: `You can select only ${findService.selectedCount} not more than ${findService.selectedCount}` });
//                                                         }
//                                                 }
//                                         }
//                                 } else {
//                                         return res.status(404).send({ status: 404, message: "Service not found" });
//                                 }
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };

exports.replyOnTicket = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        const data1 = await ticket.findById({ _id: req.params.id });
                        if (data1) {
                                let obj = {
                                        comment: req.body.comment,
                                        byUser: true,
                                        byAdmin: false,
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
// exports.addToCartSingleService = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         const findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 const findService = await service.findById({ _id: req.body._id });
//                                 const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));
//                                 if (existingService) {
//                                         existingService.quantity += req.body.quantity;
//                                         existingService.total = existingService.price * existingService.quantity;
//                                         findCart.totalAmount += existingService.price * req.body.quantity;
//                                         findCart.paidAmount += existingService.price * req.body.quantity;
//                                         await findCart.save();
//                                         return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
//                                 } else {
//                                         const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;
//                                         const newService = {
//                                                 serviceId: findService._id,
//                                                 price: price,
//                                                 quantity: req.body.quantity,
//                                                 total: price * req.body.quantity,
//                                                 // type: "Service"
//                                                 type: findService.type,
//                                                 packageType: findService.packageType,
//                                         };
//                                         findCart.services.push(newService);
//                                         findCart.totalAmount += newService.total;
//                                         findCart.paidAmount += newService.total;
//                                         findCart.totalItem++;
//                                         await findCart.save();
//                                         return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
//                                 }
//                         } else {
//                                 let findService = await service.findById({ _id: req.body._id });
//                                 if (findService) {
//                                         let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
//                                         const findCharge = await Charges.find({});
//                                         if (findCharge.length > 0) {
//                                                 for (let i = 0; i < findCharge.length; i++) {
//                                                         let obj1 = {
//                                                                 chargeId: findCharge[i]._id,
//                                                                 charge: findCharge[i].charge,
//                                                                 discountCharge: findCharge[i].discountCharge,
//                                                                 discount: findCharge[i].discount,
//                                                                 cancelation: findCharge[i].cancelation,
//                                                         }
//                                                         if (findCharge[i].cancelation == false) {
//                                                                 if (findCharge[i].discount == true) {
//                                                                         additionalFee = additionalFee + findCharge[i].discountCharge
//                                                                 } else {
//                                                                         additionalFee = additionalFee + findCharge[i].charge
//                                                                 }
//                                                         }
//                                                         Charged.push(obj1)
//                                                 }
//                                         }
//                                         if (findService.type == "Service") {
//                                                 console.log(findService);
//                                                 let price = 0;
//                                                 if (findService.discountActive == true) {
//                                                         price = findService.discountPrice;
//                                                 } else {
//                                                         price = findService.originalPrice;
//                                                 }
//                                                 totalAmount = Number(price * req.body.quantity).toFixed(2);
//                                                 paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
//                                                 let obj = {
//                                                         userId: userData._id,
//                                                         Charges: Charged,
//                                                         services: [{
//                                                                 serviceId: findService._id,
//                                                                 packageServices: req.body.packageServices,
//                                                                 price: price,
//                                                                 quantity: req.body.quantity,
//                                                                 total: price * req.body.quantity,
//                                                                 type: "Service"
//                                                         }],
//                                                         totalAmount: totalAmount,
//                                                         additionalFee: additionalFee,
//                                                         paidAmount: paidAmount,
//                                                         totalItem: 1,
//                                                 }
//                                                 const Data = await Cart.create(obj);
//                                                 return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                         }
//                                 } else {
//                                         return res.status(404).send({ status: 404, message: "Service not found" });
//                                 }
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// }
// exports.addToCartPackageNormal = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         const findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 const findService = await service.findById({ _id: req.body._id });
//                                 const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));
//                                 if (existingService) {
//                                         existingService.quantity += req.body.quantity;
//                                         existingService.total = existingService.price * existingService.quantity;
//                                         findCart.totalAmount += existingService.price * req.body.quantity;
//                                         findCart.paidAmount += existingService.price * req.body.quantity;
//                                         await findCart.save();
//                                         return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
//                                 } else {
//                                         const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;
//                                         const newService = {
//                                                 serviceId: findService._id,
//                                                 price: price,
//                                                 quantity: req.body.quantity,
//                                                 total: price * req.body.quantity,
//                                                 // type: "Service"
//                                                 type: findService.type,
//                                                 packageType: findService.packageType,
//                                         };
//                                         findCart.services.push(newService);
//                                         findCart.totalAmount += newService.total;
//                                         findCart.paidAmount += newService.total;
//                                         findCart.totalItem++;
//                                         await findCart.save();
//                                         return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
//                                 }

//                         } else {
//                                 let findService = await service.findById({ _id: req.body._id });
//                                 if (findService) {
//                                         let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
//                                         const findCharge = await Charges.find({});
//                                         if (findCharge.length > 0) {
//                                                 for (let i = 0; i < findCharge.length; i++) {
//                                                         let obj1 = {
//                                                                 chargeId: findCharge[i]._id,
//                                                                 charge: findCharge[i].charge,
//                                                                 discountCharge: findCharge[i].discountCharge,
//                                                                 discount: findCharge[i].discount,
//                                                                 cancelation: findCharge[i].cancelation,
//                                                         }
//                                                         if (findCharge[i].cancelation == false) {
//                                                                 if (findCharge[i].discount == true) {
//                                                                         additionalFee = additionalFee + findCharge[i].discountCharge
//                                                                 } else {
//                                                                         additionalFee = additionalFee + findCharge[i].charge
//                                                                 }
//                                                         }
//                                                         Charged.push(obj1)
//                                                 }
//                                         }
//                                         if (findService.type == "Package") {
//                                                 if (findService.packageType == "Normal") {
//                                                         let price = 0;
//                                                         if (findService.discountActive == true) {
//                                                                 price = findService.discountPrice;
//                                                         } else {
//                                                                 price = findService.originalPrice;
//                                                         }
//                                                         totalAmount = Number(price * req.body.quantity).toFixed(2);
//                                                         paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
//                                                         console.log(totalAmount, additionalFee, paidAmount);
//                                                         let obj = {
//                                                                 userId: userData._id,
//                                                                 Charges: Charged,
//                                                                 services: [{
//                                                                         serviceId: findService._id,
//                                                                         price: price,
//                                                                         quantity: req.body.quantity,
//                                                                         total: price * req.body.quantity,
//                                                                         type: "Package",
//                                                                         packageType: "Normal",
//                                                                 }],
//                                                                 totalAmount: totalAmount,
//                                                                 additionalFee: additionalFee,
//                                                                 paidAmount: paidAmount,
//                                                                 totalItem: 1,
//                                                         }
//                                                         const Data = await Cart.create(obj);
//                                                         return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                                 }
//                                         }
//                                 } else {
//                                         return res.status(404).send({ status: 404, message: "Service not found" });
//                                 }
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };
// exports.addToCartPackageCustomise = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         const findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 const findService = await service.findById({ _id: req.body._id });
//                                 const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));
//                                 if (existingService) {
//                                         existingService.quantity += req.body.quantity;
//                                         existingService.total = existingService.price * existingService.quantity;

//                                         findCart.totalAmount += existingService.price * req.body.quantity;
//                                         findCart.paidAmount += existingService.price * req.body.quantity;

//                                         await findCart.save();

//                                         return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });

//                                 } else {
//                                         const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;

//                                         const newService = {
//                                                 serviceId: findService._id,
//                                                 price: price,
//                                                 quantity: req.body.quantity,
//                                                 total: price * req.body.quantity,
//                                                 // type: "Service"
//                                                 type: findService.type,
//                                                 packageType: findService.packageType,
//                                         };

//                                         findCart.services.push(newService);

//                                         findCart.totalAmount += newService.total;
//                                         findCart.paidAmount += newService.total;
//                                         findCart.totalItem++;

//                                         await findCart.save();

//                                         return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
//                                 }

//                         } else {
//                                 let findService = await service.findById({ _id: req.body._id });
//                                 if (findService) {
//                                         let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
//                                         const findCharge = await Charges.find({});
//                                         if (findCharge.length > 0) {
//                                                 for (let i = 0; i < findCharge.length; i++) {
//                                                         let obj1 = {
//                                                                 chargeId: findCharge[i]._id,
//                                                                 charge: findCharge[i].charge,
//                                                                 discountCharge: findCharge[i].discountCharge,
//                                                                 discount: findCharge[i].discount,
//                                                                 cancelation: findCharge[i].cancelation,
//                                                         }
//                                                         if (findCharge[i].cancelation == false) {
//                                                                 if (findCharge[i].discount == true) {
//                                                                         additionalFee = additionalFee + findCharge[i].discountCharge
//                                                                 } else {
//                                                                         additionalFee = additionalFee + findCharge[i].charge
//                                                                 }
//                                                         }
//                                                         Charged.push(obj1)
//                                                 }
//                                         }
//                                         if (findService.type == "Package") {
//                                                 if (findService.packageType == "Customise") {
//                                                         let price = 0, services = [];
//                                                         if (findService.discountActive == true) {
//                                                                 price = findService.discountPrice;
//                                                         } else {
//                                                                 price = findService.originalPrice;
//                                                         }
//                                                         totalAmount = Number(price * req.body.quantity).toFixed(2);
//                                                         paidAmount = (Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee))
//                                                         if (findService.selectedCount == (req.body.packageServices).length) {
//                                                                 let obj = {
//                                                                         serviceId: findService._id,
//                                                                         packageServices: req.body.packageServices,
//                                                                         price: price,
//                                                                         quantity: req.body.quantity,
//                                                                         total: price * req.body.quantity,
//                                                                         type: "Package",
//                                                                         packageType: "Customise",
//                                                                 }
//                                                                 services.push(obj)
//                                                                 let obj1 = {
//                                                                         userId: userData._id,
//                                                                         Charges: Charged,
//                                                                         services: services,
//                                                                         totalAmount: totalAmount,
//                                                                         additionalFee: additionalFee,
//                                                                         paidAmount: paidAmount,
//                                                                         totalItem: 1,
//                                                                 }
//                                                                 const Data = await Cart.create(obj1);
//                                                                 return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                                         } else {
//                                                                 return res.status(201).send({ status: 201, message: `You can select only ${findService.selectedCount} not more than ${findService.selectedCount}` });
//                                                         }
//                                                 }
//                                         }

//                                 } else {
//                                         return res.status(404).send({ status: 404, message: "Service not found" });
//                                 }
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };
// exports.addToCartPackageEdit = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         const findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 const findService = await service.findById({ _id: req.body._id });
//                                 const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));
//                                 if (existingService) {
//                                         existingService.quantity += req.body.quantity;
//                                         existingService.total = existingService.price * existingService.quantity;

//                                         findCart.totalAmount += existingService.price * req.body.quantity;
//                                         findCart.paidAmount += existingService.price * req.body.quantity;

//                                         await findCart.save();

//                                         return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });

//                                 } else {
//                                         const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;

//                                         const newService = {
//                                                 serviceId: findService._id,
//                                                 price: price,
//                                                 quantity: req.body.quantity,
//                                                 total: price * req.body.quantity,
//                                                 // type: "Service"
//                                                 type: findService.type,
//                                                 packageType: findService.packageType,
//                                         };

//                                         findCart.services.push(newService);

//                                         findCart.totalAmount += newService.total;
//                                         findCart.paidAmount += newService.total;
//                                         findCart.totalItem++;

//                                         await findCart.save();

//                                         return res.status(200).json({ status: 200, message: "Service added to the cart.", data: findCart });
//                                 }

//                         } else {
//                                 let findService = await service.findById({ _id: req.body._id });
//                                 if (findService) {
//                                         let Charged = [], paidAmount = 0, totalAmount = 0, additionalFee = 0;
//                                         const findCharge = await Charges.find({});
//                                         if (findCharge.length > 0) {
//                                                 for (let i = 0; i < findCharge.length; i++) {
//                                                         let obj1 = {
//                                                                 chargeId: findCharge[i]._id,
//                                                                 charge: findCharge[i].charge,
//                                                                 discountCharge: findCharge[i].discountCharge,
//                                                                 discount: findCharge[i].discount,
//                                                                 cancelation: findCharge[i].cancelation,
//                                                         }
//                                                         if (findCharge[i].cancelation == false) {
//                                                                 if (findCharge[i].discount == true) {
//                                                                         additionalFee = additionalFee + findCharge[i].discountCharge
//                                                                 } else {
//                                                                         additionalFee = additionalFee + findCharge[i].charge
//                                                                 }
//                                                         }
//                                                         Charged.push(obj1)
//                                                 }
//                                         }
//                                         if (findService.type == "Package") {
//                                                 if (findService.packageType == "Edit") {
//                                                         console.log(findService);
//                                                         let categoryServices = [];
//                                                         if (!req.body.servicePackageId) {
//                                                                 return res.status(400).json({ status: 400, message: "Package Service not edit." })
//                                                         }
//                                                         let findServicePackage = await servicePackage.findById({ _id: req.body.servicePackageId })
//                                                         if (findServicePackage) {
//                                                                 for (let i = 0; i < req.body.packageServices.length; i++) {
//                                                                         let findService1 = await service.findById({ _id: req.body.packageServices[i] });
//                                                                         let price = 0;
//                                                                         if (findService.discountActive == true) {
//                                                                                 price = findService.discountPrice;
//                                                                         } else {
//                                                                                 price = findService.originalPrice;
//                                                                         }
//                                                                         let obj = {
//                                                                                 service: findService1,
//                                                                                 price: price,
//                                                                                 quantity: 1,
//                                                                                 total: price,
//                                                                         }
//                                                                         categoryServices.push(obj)
//                                                                 }
//                                                         }
//                                                         let total = 0;
//                                                         for (let j = 0; j < categoryServices.length; j++) {
//                                                                 total = total + categoryServices[j].total
//                                                         }
//                                                         totalAmount = Number(total).toFixed(2);
//                                                         paidAmount = (Number((total).toFixed(2)) + Number(additionalFee))
//                                                         let obj = {
//                                                                 userId: userData._id,
//                                                                 Charges: Charged,
//                                                                 totalAmount: totalAmount,
//                                                                 services: [{
//                                                                         serviceId: findService._id,
//                                                                         categoryId: findServicePackage.categoryId,
//                                                                         services: categoryServices,
//                                                                         quantity: 1,
//                                                                         total: total,
//                                                                         type: "Package",
//                                                                         packageType: "Edit",
//                                                                 }],
//                                                                 additionalFee: additionalFee,
//                                                                 paidAmount: paidAmount,
//                                                                 totalItem: 1,
//                                                         }
//                                                         console.log(obj);
//                                                         const Data = await Cart.create(obj);
//                                                         return res.status(200).json({ status: 200, message: "Service successfully add to cart. ", data: Data })
//                                                 }
//                                         }
//                                 } else {
//                                         return res.status(404).send({ status: 404, message: "Service not found" });
//                                 }
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };


exports.addToCartSingleService = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData || !userData.city || !userData.sector) {
                        return res.status(400).json({ status: 400, message: "Please select a location before adding services to the cart." });
                }

                const findCart = await Cart.findOne({ userId: userData._id });
                const findService = await service.findById({ _id: req.body._id });

                if (!findService) {
                        return res.status(404).json({ status: 404, message: "Service not found" });
                }

                let userCity = userData.city;
                let userSector = userData.sector;

                let locationData;

                if (userCity && userSector && findService.location) {
                        locationData = findService.location.find(location =>
                                location.city.toString() === userCity.toString() &&
                                location.sector.toString() === userSector.toString()
                        );
                }

                let originalPrice = 0;
                let discountActive = false;
                let discountPrice = 0;
                let discount = 0;

                if (locationData) {
                        originalPrice = locationData.originalPrice || 0;
                        discountActive = locationData.discountActive || false;
                        discountPrice = locationData.discountPrice || 0;

                        if (discountActive && originalPrice > 0 && discountPrice > 0) {
                                discount = ((originalPrice - discountPrice) / originalPrice) * 100;
                                discount = Math.max(discount, 0);
                                discount = Math.round(discount);
                        }
                }

                let Charged = [];
                let paidAmount = 0;
                let totalAmount = 0;
                let additionalFee = 0;

                const findCharge = await Charges.find({});

                if (findCharge.length > 0) {
                        for (let i = 0; i < findCharge.length; i++) {
                                let obj1 = {
                                        chargeId: findCharge[i]._id,
                                        charge: findCharge[i].charge,
                                        discountCharge: findCharge[i].discountCharge,
                                        discount: findCharge[i].discount,
                                        cancelation: findCharge[i].cancelation,
                                };
                                if (findCharge[i].cancelation == false) {
                                        if (findCharge[i].discount == true) {
                                                additionalFee = additionalFee + findCharge[i].discountCharge;
                                        } else {
                                                additionalFee = additionalFee + findCharge[i].charge;
                                        }
                                }
                                Charged.push(obj1);
                        }
                }

                if (findService.type == "Service") {
                        let price = discountActive ? discountPrice : originalPrice || 0;
                        let quantity = req.body.quantity;

                        if (isNaN(price) || isNaN(quantity) || quantity <= 0) {
                                return res.status(400).json({ status: 400, message: "Invalid price or quantity values." });
                        }

                        totalAmount = Number((price * quantity).toFixed(2));
                        paidAmount = Number((totalAmount + additionalFee).toFixed(2));

                        if (isNaN(totalAmount) || isNaN(paidAmount)) {
                                return res.status(500).json({ status: 500, message: "Invalid total or paidAmount values." });
                        }

                        if (findCart) {
                                const existingService = findCart.services.find(service => service.serviceId.equals(findService._id));

                                if (existingService) {
                                        existingService.quantity += quantity;
                                        existingService.total = price * existingService.quantity;
                                        findCart.totalAmount += price * quantity;
                                        findCart.paidAmount += price * quantity;
                                        await findCart.save();
                                        return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
                                }
                        }

                        let obj = {
                                userId: userData._id,
                                Charges: Charged,
                                services: [{
                                        serviceId: findService._id,
                                        serviceType: findService.serviceType,
                                        packageServices: req.body.packageServices,
                                        price: price,
                                        quantity: quantity,
                                        total: totalAmount,
                                        type: "Service",
                                }],
                                totalAmount: totalAmount,
                                additionalFee: additionalFee,
                                paidAmount: paidAmount,
                                totalItem: 1,
                        };

                        if (findCart) {
                                findCart.services.push(obj.services[0]);
                                findCart.totalAmount += obj.totalAmount;
                                findCart.paidAmount += obj.totalAmount;
                                findCart.totalItem++;
                                await findCart.save();
                                return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
                        } else {
                                const Data = await Cart.create(obj);
                                return res.status(200).json({ status: 200, message: "Service successfully added to the cart.", data: Data });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

exports.addToCartPackageNormal1 = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const findCart = await Cart.findOne({ userId: userData._id });
                const findPackage = req.body.packageId ? await Package.findOne({ _id: req.body.packageId, packageType: "Normal" }).populate('services.service').populate('addOnServices.service') : null;

                if (!findPackage) {
                        return res.status(404).json({ status: 404, message: "Package not found" });
                }

                if (findCart) {
                        const existingPackage = findCart.packages.find(pkg => pkg.packageId.equals(findPackage._id));

                        if (req.body.quantity <= 0) {
                                return res.status(400).json({ status: 400, message: "Quantity must be greater than 0." });
                        }

                        if (existingPackage) {
                                existingPackage.quantity += req.body.quantity;
                                existingPackage.total = existingPackage.price * existingPackage.quantity;
                                findCart.totalAmount += existingPackage.price * req.body.quantity;
                                findCart.paidAmount += existingPackage.price * req.body.quantity;
                                await findCart.save();
                                return res.status(200).json({ status: 200, message: "Package quantity updated in the cart.", data: findCart });
                        } else {
                                const price = calculateNormalPackagePrice(findPackage, userData.city, userData.sector);
                                const newPackage = {
                                        packageId: findPackage._id,
                                        packageType: "Normal",
                                        services: findPackage.services.map(service => ({
                                                serviceId: service.service._id,
                                                serviceType: service.service.serviceTypes,
                                                quantity: service.service.quantity,
                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                discount: getServicePrice(service.service, userData.city, userData.sector).discount,
                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,

                                        })),
                                        addOnServices: findPackage.addOnServices.map(service => ({
                                                serviceId: service.service._id,
                                                serviceType: service.service.serviceTypes,
                                                quantity: service.service.quantity,
                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                discount: getServicePrice(service.service, userData.city, userData.sector).discount,
                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                        })),
                                        price: price,
                                        quantity: req.body.quantity,
                                        total: price * req.body.quantity,
                                };
                                findCart.packages.push(newPackage);
                                findCart.totalAmount += newPackage.total;
                                findCart.paidAmount += newPackage.total;
                                findCart.totalItem++;
                                await findCart.save();
                                return res.status(200).json({ status: 200, message: "Package added to the cart.", data: findCart });
                        }
                } else {
                        let Charged = [];
                        let paidAmount = 0;
                        let totalAmount = 0;
                        let additionalFee = 0;

                        const findCharge = await Charges.find({});

                        if (findCharge.length > 0) {
                                for (let i = 0; i < findCharge.length; i++) {
                                        let obj1 = {
                                                chargeId: findCharge[i]._id,
                                                charge: findCharge[i].charge,
                                                discountCharge: findCharge[i].discountCharge,
                                                discount: findCharge[i].discount,
                                                cancelation: findCharge[i].cancelation,
                                        };
                                        if (findCharge[i].cancelation == false) {
                                                if (findCharge[i].discount == true) {
                                                        additionalFee = additionalFee + findCharge[i].discountCharge;
                                                } else {
                                                        additionalFee = additionalFee + findCharge[i].charge;
                                                }
                                        }
                                        Charged.push(obj1);
                                }
                        }

                        if (findPackage.type == "Package") {
                                const price = calculateNormalPackagePrice(findPackage, userData.city, userData.sector);
                                totalAmount = Number(price * req.body.quantity).toFixed(2);
                                paidAmount = Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee);
                                const obj = {
                                        userId: userData._id,
                                        Charges: Charged,
                                        packages: [
                                                {
                                                        packageId: findPackage._id,
                                                        packageType: "Normal",
                                                        services: findPackage.services.map(service => ({
                                                                serviceId: service.service._id,
                                                                serviceType: service.service.serviceTypes,
                                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                                        })),
                                                        addOnServices: findPackage.addOnServices.map(service => ({
                                                                serviceId: service.service._id,
                                                                serviceType: service.service.serviceTypes,
                                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                                        })),
                                                        price: price,
                                                        quantity: req.body.quantity,
                                                        total: price * req.body.quantity,
                                                },
                                        ],
                                        totalAmount: totalAmount,
                                        additionalFee: additionalFee,
                                        paidAmount: paidAmount,
                                        totalItem: 1,
                                };
                                const Data = await Cart.create(obj);
                                return res.status(200).json({ status: 200, message: "Package successfully added to cart.", data: Data });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

exports.addToCartPackageNormal = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                if (!userData.city || !userData.sector) {
                        return res.status(400).json({ status: 400, message: "Please select a location before adding services to the cart." });
                }

                const findCart = await Cart.findOne({ userId: userData._id });
                const findPackage = req.body.packageId ? await Package.findOne({ _id: req.body.packageId, packageType: "Normal" }).populate('services.service').populate('addOnServices.service') : null;

                if (!findPackage) {
                        return res.status(404).json({ status: 404, message: "Package not found" });
                }

                if (findCart) {
                        const existingPackage = findCart.packages.find(pkg => pkg.packageId.equals(findPackage._id));

                        if (req.body.quantity <= 0) {
                                return res.status(400).json({ status: 400, message: "Quantity must be greater than 0." });
                        }

                        if (existingPackage) {
                                existingPackage.quantity += req.body.quantity;
                                existingPackage.total = existingPackage.price * existingPackage.quantity;
                                findCart.totalAmount += existingPackage.price * req.body.quantity;
                                findCart.paidAmount += existingPackage.price * req.body.quantity;
                                await findCart.save();
                                return res.status(200).json({ status: 200, message: "Package quantity updated in the cart.", data: findCart });
                        } else {
                                let price;

                                if (findPackage.location && findPackage.location.length > 0) {
                                        const packageLocation = findPackage.location.find(loc =>
                                                loc.city.toString() === userData.city.toString() &&
                                                loc.sector.toString() === userData.sector.toString()
                                        );

                                        if (packageLocation && packageLocation.discountActive) {
                                                price = packageLocation.discountPrice;
                                        } else if (packageLocation) {
                                                price = packageLocation.originalPrice;
                                        } else {
                                                price = calculateNormalPackagePrice(findPackage, userData.city, userData.sector);
                                        }
                                } else {
                                        price = calculateNormalPackagePrice(findPackage, userData.city, userData.sector);
                                }

                                const newPackage = {
                                        packageId: findPackage._id,
                                        packageType: "Normal",
                                        services: findPackage.services.map(service => ({
                                                serviceId: service.service._id,
                                                serviceType: service.service.serviceTypes,
                                                quantity: service.service.quantity,
                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                discount: getServicePrice(service.service, userData.city, userData.sector).discount,
                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                        })),
                                        addOnServices: findPackage.addOnServices.map(service => ({
                                                serviceId: service.service._id,
                                                serviceType: service.service.serviceTypes,
                                                quantity: service.service.quantity,
                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                discount: getServicePrice(service.service, userData.city, userData.sector).discount,
                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                        })),
                                        price: price,
                                        quantity: req.body.quantity,
                                        total: price * req.body.quantity,
                                };

                                findCart.packages.push(newPackage);
                                findCart.totalAmount += newPackage.total;
                                findCart.paidAmount += newPackage.total;
                                findCart.totalItem++;
                                await findCart.save();
                                return res.status(200).json({ status: 200, message: "Package added to the cart.", data: findCart });
                        }
                } else {
                        let Charged = [];
                        let paidAmount = 0;
                        let totalAmount = 0;
                        let additionalFee = 0;

                        const findCharge = await Charges.find({});

                        if (findCharge.length > 0) {
                                for (let i = 0; i < findCharge.length; i++) {
                                        let obj1 = {
                                                chargeId: findCharge[i]._id,
                                                charge: findCharge[i].charge,
                                                discountCharge: findCharge[i].discountCharge,
                                                discount: findCharge[i].discount,
                                                cancelation: findCharge[i].cancelation,
                                        };
                                        if (findCharge[i].cancelation == false) {
                                                if (findCharge[i].discount == true) {
                                                        additionalFee = additionalFee + findCharge[i].discountCharge;
                                                } else {
                                                        additionalFee = additionalFee + findCharge[i].charge;
                                                }
                                        }
                                        Charged.push(obj1);
                                }
                        }

                        if (findPackage.type == "Package") {
                                let price;

                                if (findPackage.location && findPackage.location.length > 0) {
                                        const packageLocation = findPackage.location.find(loc =>
                                                loc.city.toString() === userData.city.toString() &&
                                                loc.sector.toString() === userData.sector.toString()
                                        );

                                        if (packageLocation && packageLocation.discountActive) {
                                                price = packageLocation.discountPrice;
                                        } else if (packageLocation) {
                                                price = packageLocation.originalPrice;
                                        }
                                }

                                if (price === undefined) {
                                        price = calculateNormalPackagePrice(findPackage, userData.city, userData.sector);
                                }

                                totalAmount = Number(price * req.body.quantity).toFixed(2);
                                paidAmount = Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee);

                                const obj = {
                                        userId: userData._id,
                                        Charges: Charged,
                                        packages: [
                                                {
                                                        packageId: findPackage._id,
                                                        packageType: "Normal",
                                                        services: findPackage.services.map(service => ({
                                                                serviceId: service.service._id,
                                                                serviceType: service.service.serviceTypes,
                                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                                        })),
                                                        addOnServices: findPackage.addOnServices.map(service => ({
                                                                serviceId: service.service._id,
                                                                serviceType: service.service.serviceTypes,
                                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                                        })),
                                                        price: price,
                                                        quantity: req.body.quantity,
                                                        total: price * req.body.quantity,
                                                },
                                        ],
                                        totalAmount: totalAmount,
                                        additionalFee: additionalFee,
                                        paidAmount: paidAmount,
                                        totalItem: 1,
                                };

                                const Data = await Cart.create(obj);
                                return res.status(200).json({ status: 200, message: "Package successfully added to cart.", data: Data });
                        }

                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

function calculateNormalPackagePrice(packageData, userCity, userSector) {
        let totalOriginalPrice = 0;

        if (userCity && userSector && packageData.services) {
                packageData.services.forEach(service => {
                        const location = service.service.location.find(location =>
                                location.city.toString() === userCity.toString() &&
                                location.sector.toString() === userSector.toString()
                        );

                        if (location) {
                                totalOriginalPrice += location.discountActive ? location.discountPrice || 0 : location.originalPrice || 0;
                        } else {
                                totalOriginalPrice += service.service.discountActive ? service.service.discountPrice || 0 : service.service.originalPrice || 0;
                        }
                });
        }

        return totalOriginalPrice;
}

exports.addToCartPackageCustomise = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                if (!userData.city || !userData.sector) {
                        return res.status(400).json({ status: 400, message: "Please select a location before adding services to the cart." });
                }

                const findCart = await Cart.findOne({ userId: userData._id });
                const findPackage = req.body.packageId ? await Package.findOne({ _id: req.body.packageId, packageType: "Customize" }).populate('services.service').populate('addOnServices.service') : null;

                if (!findPackage) {
                        return res.status(404).json({ status: 404, message: "Package not found" });
                }

                if (findCart) {
                        const existingPackage = findCart.packages.find(pkg => pkg.packageId.equals(findPackage._id));

                        if (req.body.quantity <= 0) {
                                return res.status(400).json({ status: 400, message: "Quantity must be greater than 0." });
                        }

                        if (existingPackage) {
                                existingPackage.quantity += req.body.quantity;
                                existingPackage.total = existingPackage.price * existingPackage.quantity;
                                findCart.totalAmount += existingPackage.price * req.body.quantity;
                                findCart.paidAmount += existingPackage.price * req.body.quantity;
                                await findCart.save();
                                return res.status(200).json({ status: 200, message: "Package quantity updated in the cart.", data: findCart });
                        } else {
                                let price;

                                if (findPackage.location && findPackage.location.length > 0) {
                                        const packageLocation = findPackage.location.find(loc =>
                                                loc.city.toString() === userData.city.toString() &&
                                                loc.sector.toString() === userData.sector.toString()
                                        );

                                        if (packageLocation && packageLocation.discountActive) {
                                                price = packageLocation.discountPrice;
                                        } else if (packageLocation) {
                                                price = packageLocation.originalPrice;
                                        } else {
                                                price = calculateNormalPackagePrice(findPackage, userData.city, userData.sector);
                                        }
                                } else {
                                        price = calculateCustomizePackagePrice(findPackage, userData.city, userData.sector);
                                }
                                const newPackage = {
                                        packageId: findPackage._id,
                                        packageType: "Customize",
                                        services: findPackage.services.map(service => ({
                                                serviceId: service.service._id,
                                                serviceType: service.service.serviceTypes,
                                                quantity: service.service.quantity,
                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                discount: getServicePrice(service.service, userData.city, userData.sector).discount,
                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                        })),
                                        addOnServices: findPackage.addOnServices.map(service => ({
                                                serviceId: service.service._id,
                                                serviceType: service.service.serviceTypes,
                                                quantity: service.service.quantity,
                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                discount: getServicePrice(service.service, userData.city, userData.sector).discount,
                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                        })),
                                        price: price,
                                        quantity: req.body.quantity,
                                        total: price * req.body.quantity,
                                };

                                findCart.packages.push(newPackage);
                                findCart.totalAmount += newPackage.total;
                                findCart.paidAmount += newPackage.total;
                                findCart.totalItem++;
                                await findCart.save();
                                return res.status(200).json({ status: 200, message: "Package added to the cart.", data: findCart });
                        }
                } else {
                        let Charged = [];
                        let paidAmount = 0;
                        let totalAmount = 0;
                        let additionalFee = 0;

                        const findCharge = await Charges.find({});

                        if (findCharge.length > 0) {
                                for (let i = 0; i < findCharge.length; i++) {
                                        let obj1 = {
                                                chargeId: findCharge[i]._id,
                                                charge: findCharge[i].charge,
                                                discountCharge: findCharge[i].discountCharge,
                                                discount: findCharge[i].discount,
                                                cancelation: findCharge[i].cancelation,
                                        };
                                        if (findCharge[i].cancelation == false) {
                                                if (findCharge[i].discount == true) {
                                                        additionalFee = additionalFee + findCharge[i].discountCharge;
                                                } else {
                                                        additionalFee = additionalFee + findCharge[i].charge;
                                                }
                                        }
                                        Charged.push(obj1);
                                }
                        }

                        if (findPackage.type == "Package") {
                                let price;

                                if (findPackage.location && findPackage.location.length > 0) {
                                        const packageLocation = findPackage.location.find(loc =>
                                                loc.city.toString() === userData.city.toString() &&
                                                loc.sector.toString() === userData.sector.toString()
                                        );

                                        if (packageLocation && packageLocation.discountActive) {
                                                price = packageLocation.discountPrice;
                                        } else if (packageLocation) {
                                                price = packageLocation.originalPrice;
                                        }
                                }
                                if (price === undefined) {
                                        price = calculateCustomizePackagePrice(findPackage, userData.city, userData.sector);
                                }
                                totalAmount = Number(price * req.body.quantity).toFixed(2);
                                paidAmount = Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee);

                                const obj = {
                                        userId: userData._id,
                                        Charges: Charged,
                                        packages: [
                                                {
                                                        packageId: findPackage._id,
                                                        packageType: "Customize",
                                                        services: findPackage.services.map(service => ({
                                                                serviceId: service.service._id,
                                                                serviceType: service.service.serviceTypes,
                                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                                        })),
                                                        addOnServices: findPackage.addOnServices.map(service => ({
                                                                serviceId: service.service._id,
                                                                serviceType: service.service.serviceTypes,
                                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                                        })),
                                                        price: price,
                                                        quantity: req.body.quantity,
                                                        total: price * req.body.quantity,
                                                },
                                        ],
                                        totalAmount: totalAmount,
                                        additionalFee: additionalFee,
                                        paidAmount: paidAmount,
                                        totalItem: 1,
                                };
                                const Data = await Cart.create(obj);
                                return res.status(200).json({ status: 200, message: "Package successfully added to cart.", data: Data });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

function calculateCustomizePackagePrice(packageData, userCity, userSector) {
        let totalOriginalPrice = 0;

        if (userCity && userSector && packageData.services) {
                packageData.services.forEach(service => {
                        const location = service.service.location.find(location =>
                                location.city.toString() === userCity.toString() &&
                                location.sector.toString() === userSector.toString()
                        );

                        if (location) {
                                totalOriginalPrice += location.discountActive ? location.discountPrice || 0 : location.originalPrice || 0;
                        } else {
                                totalOriginalPrice += service.service.discountActive ? service.service.discountPrice || 0 : service.service.originalPrice || 0;
                        }
                });
        }
        console.log("packageData", packageData)
        console.log("totalOriginalPrice", totalOriginalPrice)
        return totalOriginalPrice;
}

function getServicePrice(service, userCity, userSector) {
        const location = service.location.find(location =>
                location.city.toString() === userCity.toString() &&
                location.sector.toString() === userSector.toString()
        );
        return {
                originalPrice: location ? location.originalPrice || 0 : service.originalPrice || 0,
                discountPrice: location ? location.discountPrice || 0 : service.discountPrice || 0,
                discount: location ? location.discount || 0 : service.discount || 0,
                discountActive: location ? location.discountActive || false : service.discountActive || false,

        }
}

exports.addToCartPackageEdit = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                if (!userData.city || !userData.sector) {
                        return res.status(400).json({ status: 400, message: "Please select a location before adding services to the cart." });
                }

                const findCart = await Cart.findOne({ userId: userData._id });
                const findPackage = req.body.packageId ? await Package.findOne({ _id: req.body.packageId, packageType: "Edit" }).populate('services.service').populate('addOnServices.service') : null;

                if (!findPackage) {
                        return res.status(404).json({ status: 404, message: "Package not found" });
                }

                if (findCart) {
                        const existingPackage = findCart.packages.find(pkg => pkg.packageId.equals(findPackage._id));

                        if (req.body.quantity <= 0) {
                                return res.status(400).json({ status: 400, message: "Quantity must be greater than 0." });
                        }

                        if (existingPackage) {
                                existingPackage.quantity += req.body.quantity;
                                existingPackage.total = existingPackage.price * existingPackage.quantity;
                                findCart.totalAmount += existingPackage.price * req.body.quantity;
                                findCart.paidAmount += existingPackage.price * req.body.quantity;
                                await findCart.save();
                                console.log("existingPackage", existingPackage);

                                return res.status(200).json({ status: 200, message: "Package quantity updated in the cart.", data: findCart });
                        } else {
                                let price;

                                if (findPackage.location && findPackage.location.length > 0) {
                                        const packageLocation = findPackage.location.find(loc =>
                                                loc.city.toString() === userData.city.toString() &&
                                                loc.sector.toString() === userData.sector.toString()
                                        );

                                        if (packageLocation && packageLocation.discountActive) {
                                                price = packageLocation.discountPrice;
                                        } else if (packageLocation) {
                                                price = packageLocation.originalPrice;
                                        } else {
                                                price = calculateNormalPackagePrice(findPackage, userData.city, userData.sector);
                                        }
                                } else {
                                        price = calculateEditPackagePrice(findPackage, userData.city, userData.sector);
                                }
                                const newPackage = {
                                        packageId: findPackage._id,
                                        packageType: "Edit",
                                        services: findPackage.services.map(service => ({
                                                serviceId: service.service._id,
                                                serviceType: service.service.serviceTypes,
                                                quantity: service.service.quantity,
                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                discount: getServicePrice(service.service, userData.city, userData.sector).discount,
                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                        })),
                                        addOnServices: findPackage.addOnServices.map(service => ({
                                                serviceId: service.service._id,
                                                serviceType: service.service.serviceTypes,
                                                quantity: service.service.quantity,
                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                discount: getServicePrice(service.service, userData.city, userData.sector).discount,
                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                        })),
                                        price: price,
                                        quantity: req.body.quantity,
                                        total: price * req.body.quantity,
                                };
                                console.log("newPackage", newPackage);
                                findCart.packages.push(newPackage);
                                findCart.totalAmount += newPackage.total;
                                findCart.paidAmount += newPackage.total;
                                findCart.totalItem++;
                                await findCart.save();
                                return res.status(200).json({ status: 200, message: "Package added to the cart.", data: findCart });
                        }
                } else {
                        let Charged = [];
                        let paidAmount = 0;
                        let totalAmount = 0;
                        let additionalFee = 0;

                        const findCharge = await Charges.find({});

                        if (findCharge.length > 0) {
                                for (let i = 0; i < findCharge.length; i++) {
                                        let obj1 = {
                                                chargeId: findCharge[i]._id,
                                                charge: findCharge[i].charge,
                                                discountCharge: findCharge[i].discountCharge,
                                                discount: findCharge[i].discount,
                                                cancelation: findCharge[i].cancelation,
                                        };
                                        if (findCharge[i].cancelation == false) {
                                                if (findCharge[i].discount == true) {
                                                        additionalFee = additionalFee + findCharge[i].discountCharge;
                                                } else {
                                                        additionalFee = additionalFee + findCharge[i].charge;
                                                }
                                        }
                                        Charged.push(obj1);
                                }
                        }

                        if (findPackage.type == "Package") {
                                let price;

                                if (findPackage.location && findPackage.location.length > 0) {
                                        const packageLocation = findPackage.location.find(loc =>
                                                loc.city.toString() === userData.city.toString() &&
                                                loc.sector.toString() === userData.sector.toString()
                                        );

                                        if (packageLocation && packageLocation.discountActive) {
                                                price = packageLocation.discountPrice;
                                        } else if (packageLocation) {
                                                price = packageLocation.originalPrice;
                                        }
                                }
                                if (price === undefined) {
                                        price = calculateEditPackagePrice(findPackage, userData.city, userData.sector);
                                }
                                totalAmount = Number(price * req.body.quantity).toFixed(2);
                                paidAmount = Number((price * req.body.quantity).toFixed(2)) + Number(additionalFee);
                                const obj = {
                                        userId: userData._id,
                                        Charges: Charged,
                                        packages: [
                                                {
                                                        packageId: findPackage._id,
                                                        packageType: "Edit",
                                                        services: findPackage.services.map(service => ({
                                                                serviceId: service.service._id,
                                                                serviceType: service.service.serviceTypes,
                                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                                        })),
                                                        addOnServices: findPackage.addOnServices.map(service => ({
                                                                serviceId: service.service._id,
                                                                serviceType: service.service.serviceTypes,
                                                                originalPrice: getServicePrice(service.service, userData.city, userData.sector).originalPrice,
                                                                discountPrice: getServicePrice(service.service, userData.city, userData.sector).discountPrice,
                                                                discountActive: getServicePrice(service.service, userData.city, userData.sector).discountActive,
                                                        })),
                                                        price: price,
                                                        quantity: req.body.quantity,
                                                        total: price * req.body.quantity,
                                                },
                                        ],
                                        totalAmount: totalAmount,
                                        additionalFee: additionalFee,
                                        paidAmount: paidAmount,
                                        totalItem: 1,
                                };
                                console.log("obj", obj);

                                const Data = await Cart.create(obj);
                                return res.status(200).json({ status: 200, message: "Package successfully added to cart.", data: Data });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

function calculateEditPackagePrice(packageData, userCity, userSector) {
        let locationData;

        if (userCity && userSector && packageData.services) {
                locationData = packageData.services.map(service => {
                        return {
                                serviceId: service.service._id,
                                location: service.service.location.find(location =>
                                        location.city.toString() === userCity.toString() &&
                                        location.sector.toString() === userSector.toString()
                                ),
                        };
                });
        }

        if (locationData && locationData.length > 0) {
                const totalOriginalPrice = locationData.reduce((total, loc) => {
                        if (loc.location) {
                                total += loc.location.discountActive ? loc.location.discountPrice || 0 : loc.location.originalPrice || 0;
                        } else {
                                total += service.service.discountActive ? service.service.discountPrice || 0 : service.service.originalPrice || 0;
                        }
                        return total;
                }, 0);

                return totalOriginalPrice;
        }

        return 0;
}


exports.removeFromCart = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        const findCart = await Cart.findOne({ userId: userData._id });
                        if (!findCart) {
                                return res.status(404).send({ status: 404, message: "Cart not found" });
                        }

                        const serviceIdToRemove = req.body.serviceId;
                        const isPackageService = req.body.isPackageService || false;

                        let serviceIndex = -1;
                        let freeServiceIndex = -1;

                        if (isPackageService) {
                                const packageIndex = findCart.packages.findIndex((pkg) =>
                                        pkg.services.some((service) =>
                                                service.serviceId.toString() === serviceIdToRemove
                                        )
                                );

                                if (packageIndex !== -1) {
                                        const packageToUpdate = findCart.packages[packageIndex];
                                        const serviceToRemoveIndex = packageToUpdate.services.findIndex(
                                                (service) => service.serviceId.toString() === serviceIdToRemove
                                        );

                                        if (serviceToRemoveIndex !== -1) {
                                                const removedService = packageToUpdate.services.splice(
                                                        serviceToRemoveIndex,
                                                        1
                                                )[0];
                                                findCart.totalAmount -= removedService.total || 0;
                                                findCart.paidAmount -= removedService.total || 0;
                                                findCart.totalItem--;
                                        }

                                        if (packageToUpdate.services.length === 0) {
                                                findCart.packages.splice(packageIndex, 1);
                                        }
                                }
                        } else {
                                serviceIndex =
                                        findCart.services &&
                                        findCart.services.findIndex((service) =>
                                                service.serviceId.equals(serviceIdToRemove)
                                        );

                                freeServiceIndex =
                                        findCart.freeService &&
                                        findCart.freeService.findIndex((freeService) =>
                                                freeService.freeServiceId.toString() === serviceIdToRemove
                                        );

                                if (serviceIndex !== -1) {
                                        const removedService = findCart.services.splice(serviceIndex, 1)[0];
                                        findCart.totalAmount -= removedService.total || 0;
                                        findCart.paidAmount -= removedService.total || 0;
                                        findCart.totalItem--;
                                } else if (freeServiceIndex !== -1) {
                                        findCart.freeService.splice(freeServiceIndex, 1);
                                        findCart.freeServiceCount = (findCart.freeServiceCount || 0) - 1;
                                }
                        }

                        if (findCart.services.length === 0 && findCart.packages.length === 0) {
                                await Cart.findByIdAndDelete({ _id: findCart._id });
                                return res.status(200).json({
                                        status: 200,
                                        message: "Cart permanently deleted as it is empty.",
                                });
                        } else {
                                await findCart.save();
                                return res.status(200).json({
                                        status: 200,
                                        message: "Service removed from the cart.",
                                        data: findCart,
                                });
                        }
                }
        } catch (error) {
                console.error(error);
                return res
                        .status(500)
                        .send({ status: 500, message: "Server error" + error.message });
        }
};

exports.removePackageFromCart = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        const findCart = await Cart.findOne({ userId: userData._id });
                        if (!findCart) {
                                return res.status(404).send({ status: 404, message: "Cart not found" });
                        }

                        const serviceIdToRemove = req.body.serviceId;
                        const packageIdToRemove = req.body.packageId;
                        const isPackageService = req.body.isPackageService || false;

                        if (packageIdToRemove) {
                                const packageIndex = findCart.packages.findIndex(
                                        (pkg) => pkg.packageId.toString() === packageIdToRemove
                                );

                                if (packageIndex !== -1) {
                                        const removedPackage = findCart.packages.splice(packageIndex, 1)[0];
                                        findCart.totalAmount -= removedPackage.total || 0;
                                        findCart.paidAmount -= removedPackage.total || 0;
                                        findCart.totalItem--;
                                }
                        } else if (isPackageService) {
                                const packageIndex = findCart.packages.findIndex((pkg) =>
                                        pkg.services.some((service) => service.serviceId.toString() === serviceIdToRemove)
                                );

                                if (packageIndex !== -1) {
                                        const packageToUpdate = findCart.packages[packageIndex];
                                        const serviceToRemoveIndex = packageToUpdate.services.findIndex(
                                                (service) => service.serviceId.toString() === serviceIdToRemove
                                        );

                                        if (serviceToRemoveIndex !== -1) {
                                                const removedService = packageToUpdate.services.splice(serviceToRemoveIndex, 1)[0];
                                                findCart.totalAmount -= removedService.total || 0;
                                                findCart.paidAmount -= removedService.total || 0;
                                                findCart.totalItem--;
                                        }

                                        if (packageToUpdate.services.length === 0) {
                                                findCart.packages.splice(packageIndex, 1);
                                        }
                                }
                        } else {
                                let serviceIndex =
                                        findCart.services &&
                                        findCart.services.findIndex((service) => service.serviceId.equals(serviceIdToRemove));

                                let freeServiceIndex =
                                        findCart.freeService &&
                                        findCart.freeService.findIndex(
                                                (freeService) => freeService.freeServiceId.toString() === serviceIdToRemove
                                        );

                                if (serviceIndex !== -1) {
                                        const removedService = findCart.services.splice(serviceIndex, 1)[0];
                                        findCart.totalAmount -= removedService.total || 0;
                                        findCart.paidAmount -= removedService.total || 0;
                                        findCart.totalItem--;
                                } else if (freeServiceIndex !== -1) {
                                        findCart.freeService.splice(freeServiceIndex, 1);
                                        findCart.freeServiceCount = (findCart.freeServiceCount || 0) - 1;
                                }
                        }

                        if (findCart.services.length === 0 && findCart.packages.length === 0) {
                                await Cart.findByIdAndDelete({ _id: findCart._id });
                                return res.status(200).json({
                                        status: 200,
                                        message: "Cart permanently deleted as it is empty.",
                                });
                        } else {
                                await findCart.save();
                                return res.status(200).json({
                                        status: 200,
                                        message: "Item removed from the cart.",
                                        data: findCart,
                                });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};


// exports.addToCart = async (req, res) => {
//         try {
//                 const userData = await User.findOne({ _id: req.user._id });

//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 }

//                 let findCart = await Cart.findOne({ userId: userData._id });

//                 if (!findCart) {
//                         findCart = new Cart({
//                                 userId: userData._id,
//                                 totalItem: 0,
//                                 freeService: [],
//                                 Charges: [],
//                                 packageServices: [],
//                                 services: [],
//                         });
//                 }

//                 const findService = await service.findById({ _id: req.body._id });

//                 if (!findService) {
//                         return res.status(404).send({ status: 404, message: "Service not found" });
//                 }

//                 const price = findService.discountActive ? findService.discountPrice : findService.originalPrice;
//                 const quantity = req.body.quantity;
//                 const total = price * quantity;

//                 let additionalFee = 0;

//                 let Charged = [];

//                 const findCharge = await Charges.find({});
//                 if (findCharge.length > 0) {
//                         for (let i = 0; i < findCharge.length; i++) {
//                                 let obj1 = {
//                                         chargeId: findCharge[i]._id,
//                                         charge: findCharge[i].charge,
//                                         discountCharge: findCharge[i].discountCharge,
//                                         discount: findCharge[i].discount,
//                                         cancelation: findCharge[i].cancelation,
//                                 };
//                                 if (findCharge[i].cancelation == false) {
//                                         if (findCharge[i].discount == true) {
//                                                 additionalFee = additionalFee + findCharge[i].discountCharge;
//                                         } else {
//                                                 additionalFee = additionalFee + findCharge[i].charge;
//                                         }
//                                 }
//                                 Charged.push(obj1);
//                         }
//                 }

//                 const existingServiceIndex = findCart.services.findIndex(service => service.serviceId.equals(findService._id));

//                 if (existingServiceIndex !== -1) {
//                         findCart.services[existingServiceIndex].quantity += quantity;
//                         findCart.services[existingServiceIndex].total += total;
//                 } else {
//                         findCart.services.push({
//                                 serviceId: findService._id,
//                                 price: price,
//                                 quantity: quantity,
//                                 total: total,
//                                 type: "Service"
//                         });
//                 }

//                 findCart.totalAmount += total;
//                 findCart.paidAmount += total;

//                 findCart.totalItem += quantity; 

//                 await findCart.save();

//                 if (findService.type === "Package") {
//                         if (findService.packageType === "Edit") {
//                                 let categoryServices = [];
//                                 let findServicePackage = await servicePackage.findById({ _id: req.body.servicePackageId });
//                                 if (!req.body || !req.body.packageServices) {
//                                         return res.status(400).send({ status: 400, message: "Invalid request body" });
//                                 }

//                                 if (findServicePackage) {
//                                         for (let i = 0; i < req.body.packageServices.length; i++) {
//                                                 let findService1 = await service.findById({ _id: req.body.packageServices[i] });
//                                                 let servicePrice = findService1.discountActive ? findService1.discountPrice : findService1.originalPrice;

//                                                 let obj = {
//                                                         service: findService1._id,
//                                                         price: servicePrice,
//                                                         quantity: 1,
//                                                         total: servicePrice,
//                                                 };

//                                                 categoryServices.push(obj);
//                                         }
//                                 }

//                                 let total = 0;
//                                 for (let j = 0; j < categoryServices.length; j++) {
//                                         total += categoryServices[j].total;
//                                 }

//                                 totalAmount = total.toFixed(2);
//                                 paidAmount = (parseFloat(totalAmount) + parseFloat(additionalFee)).toFixed(2);

//                                 const obj = {
//                                         userId: userData._id,
//                                         Charges: Charged, // Make sure to define Charged properly
//                                         totalAmount: totalAmount,
//                                         services: [{
//                                                 serviceId: findService._id,
//                                                 categoryId: findServicePackage.categoryId,
//                                                 services: categoryServices,
//                                                 quantity: 1,
//                                                 total: total,
//                                                 type: "Package",
//                                                 packageType: "Edit",
//                                         }],
//                                         additionalFee: additionalFee,
//                                         paidAmount: paidAmount,
//                                         totalItem: 1,
//                                 };

//                                 const Data = await Cart.create(obj);
//                                 return res.status(200).json({ status: 200, message: "Service successfully added to cart.", data: Data });
//                         } else if (findService.packageType === "Normal") {
//                                 let totalAmount = (price * quantity).toFixed(2);
//                                 let paidAmount = (parseFloat(totalAmount) + parseFloat(additionalFee)).toFixed(2);

//                                 const obj = {
//                                         userId: userData._id,
//                                         Charges: Charged, // Make sure to define Charged properly
//                                         services: [{
//                                                 serviceId: findService._id,
//                                                 price: price,
//                                                 quantity: quantity,
//                                                 total: totalAmount,
//                                                 type: "Package",
//                                                 packageType: "Normal",
//                                         }],
//                                         totalAmount: totalAmount,
//                                         additionalFee: additionalFee,
//                                         paidAmount: paidAmount,
//                                         totalItem: 1,
//                                 };

//                                 const Data = await Cart.create(obj);

//                                 return res.status(200).json({ status: 200, message: "Service successfully added to cart.", data: Data });
//                         } else if (findService.packageType === "Customise") {
//                                 let services = [];
//                                 if (findService.selectedCount === req.body.packageServices.length) {
//                                         let totalAmount = (price * quantity).toFixed(2);
//                                         let paidAmount = (parseFloat(totalAmount) + parseFloat(additionalFee)).toFixed(2);

//                                         let obj = {
//                                                 serviceId: findService._id,
//                                                 packageServices: req.body.packageServices,
//                                                 price: price,
//                                                 quantity: quantity,
//                                                 total: totalAmount,
//                                                 type: "Package",
//                                                 packageType: "Customise",
//                                         };

//                                         services.push(obj);

//                                         let obj1 = {
//                                                 userId: userData._id,
//                                                 Charges: Charged, // Make sure to define Charged properly
//                                                 services: services,
//                                                 totalAmount: totalAmount,
//                                                 additionalFee: additionalFee,
//                                                 paidAmount: paidAmount,
//                                                 totalItem: 1,
//                                         };

//                                         const Data = await Cart.create(obj1);

//                                         return res.status(200).json({ status: 200, message: "Service successfully added to cart.", data: Data });
//                                 } else {
//                                         return res.status(201).send({ status: 201, message: `You can select only ${findService.selectedCount} not more than ${findService.selectedCount}` });
//                                 }
//                         }
//                 } else {
//                         return res.status(200).json({
//                                 status: 200, message: "Service added/updated in the cart.", data: findCart,
//                         });
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };

//


//

exports.addServiceToCart = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const findService = await service.findById({ _id: req.body._id });
                if (!findService) {
                        return res.status(404).send({ status: 404, message: "Service not found" });
                }

                let findCart = await Cart.findOne({ userId: userData._id });
                if (!findCart) {
                        findCart = await createCart(userData);
                }

                // Ensure that price and quantity are valid numbers
                const price = parseFloat(findService.discountActive ? findService.discountPrice : findService.originalPrice);
                const quantity = parseInt(req.body.quantity);

                if (isNaN(price) || isNaN(quantity) || quantity <= 0) {
                        return res.status(400).json({ status: 400, message: "Invalid price or quantity" });
                }

                const result = await addToCart(findCart, findService, quantity, price);

                return res.status(result.status).json(result.data);
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

// exports.updateServiceQuantity = async (req, res) => {
//         try {
//                 const { serviceId } = req.params;
//                 const { quantity } = req.body;

//                 if (quantity <= 0) {
//                         return res.status(400).json({ status: 400, message: "Quantity must be a positive number greater than zero." });
//                 }

//                 const userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 }

//                 const findCart = await Cart.findOne({ userId: userData._id });
//                 if (!findCart) {
//                         return res.status(404).send({ status: 404, message: "Cart not found" });
//                 }

//                 const existingService = findCart.services.find(service => service.serviceId.equals(serviceId));
//                 if (!existingService) {
//                         return res.status(404).send({ status: 404, message: "Service not found in the cart" });
//                 }

//                 const oldQuantity = existingService.quantity;
//                 existingService.quantity = quantity;
//                 existingService.total = existingService.price * quantity;

//                 findCart.totalAmount = findCart.services.reduce((total, service) => total + service.total, 0);
//                 findCart.paidAmount += (existingService.price * (quantity - oldQuantity));

//                 await findCart.save();

//                 return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };

exports.updateServiceQuantity1 = async (req, res) => {
        try {
                const { Services, packageServices, AddOnServices, quantity } = req.body;

                if (quantity <= 0 || isNaN(quantity)) {
                        return res.status(400).json({ status: 400, message: "Quantity must be a positive number greater than zero." });
                }

                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const findCart = await Cart.findOne({ userId: userData._id });
                if (!findCart) {
                        return res.status(404).send({ status: 404, message: "Cart not found" });
                }

                if (Services) {
                        const existingService = findCart.services.find(service => service.serviceId.equals(Services));
                        if (!existingService) {
                                return res.status(404).send({ status: 404, message: "Service not found in the cart" });
                        }

                        const oldQuantity = existingService.quantity;
                        existingService.quantity = quantity;
                        existingService.total = existingService.price * quantity;

                        findCart.totalAmount = findCart.services.reduce((total, service) => total + service.total, 0);
                        // findCart.totalAmount += calculateServices2Total(findCart.services);

                        findCart.paidAmount += (existingService.price * (quantity - oldQuantity));
                }

                if (packageServices) {
                        let existingPackage;

                        for (const pkg of findCart.packages) {
                                existingPackage = pkg.services.find(service => service.serviceId.equals(packageServices));

                                if (existingPackage) {
                                        const oldQuantity = existingPackage.quantity;
                                        existingPackage.quantity = quantity;
                                        existingPackage.total = existingPackage.price * quantity;

                                        findCart.totalAmount = findCart.packages.reduce((total, pkg) => total + pkg.total, 0);
                                        findCart.paidAmount += isNaN(existingPackage.total) ? 0 : (existingPackage.price * (quantity - oldQuantity));
                                }
                        }

                        if (!existingPackage) {
                                return res.status(404).send({ status: 404, message: "Service not found in the cart" });
                        }
                }

                if (AddOnServices) {
                        let existingService;

                        for (const pkg of findCart.packages) {
                                existingService = pkg.addOnServices.find(service => service.serviceId.equals(AddOnServices));

                                if (existingService) {
                                        const oldQuantity = existingService.quantity;
                                        existingService.quantity = quantity;
                                        existingService.total = existingService.price * quantity;

                                        findCart.totalAmount = findCart.services.reduce((total, service) => total + service.total, 0);
                                        findCart.paidAmount += isNaN(existingService.total) ? 0 : (existingService.price * (quantity - oldQuantity));
                                }
                        }

                        if (!existingService) {
                                return res.status(404).send({ status: 404, message: "Service not found in the cart" });
                        }
                }

                await findCart.save();

                return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.updateServiceQuantity3 = async (req, res) => {
        try {
                const { Services, packageServices, AddOnServices, quantity } = req.body;

                if (quantity <= 0 || isNaN(quantity)) {
                        return res.status(400).json({ status: 400, message: "Quantity must be a positive number greater than zero." });
                }

                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const findCart = await Cart.findOne({ userId: userData._id });
                if (!findCart) {
                        return res.status(404).send({ status: 404, message: "Cart not found" });
                }

                let existingService;
                let existingPackage;

                if (Services) {
                        existingService = findCart.services.find(service => service.serviceId.equals(Services));
                } else if (packageServices) {
                        for (const pkg of findCart.packages) {
                                existingPackage = pkg.services.find(service => service.serviceId.equals(packageServices));
                                if (existingPackage) break;
                        }
                } else if (AddOnServices) {
                        for (const pkg of findCart.packages) {
                                existingService = pkg.addOnServices.find(service => service.serviceId.equals(AddOnServices));
                                if (existingService) break;
                        }
                }

                if (existingService) {
                        const oldQuantity = existingService.quantity;
                        existingService.quantity = quantity;
                        existingService.total = existingService.price * quantity;
                        findCart.paidAmount += (existingService.price * (quantity - oldQuantity));
                } else if (existingPackage) {
                        const oldQuantity = existingPackage.quantity;
                        existingPackage.quantity = quantity;
                        existingPackage.total = existingPackage.price * quantity;
                        findCart.paidAmount += isNaN(existingPackage.total) ? 0 : (existingPackage.price * (quantity - oldQuantity));
                } else {
                        return res.status(404).send({ status: 404, message: "Service not found in the cart" });
                }

                findCart.totalAmount = findCart.services.reduce((total, service) => total + service.total, 0);
                findCart.totalAmount += findCart.packages.reduce((total, pkg) => total + pkg.total, 0);

                await findCart.save();

                return res.status(200).json({ status: 200, message: "Service quantity updated in the cart.", data: findCart });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.updateServiceQuantity = async (req, res) => {
        try {
                const { Services, packageServices, AddOnServices, quantity } = req.body;

                if (quantity <= 0 || isNaN(quantity)) {
                        return res.status(400).json({ status: 400, message: "Quantity must be a positive number greater than zero." });
                }

                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const findCart = await Cart.findOne({ userId: userData._id });
                if (!findCart) {
                        return res.status(404).send({ status: 404, message: "Cart not found" });
                }

                let updatedService;

                if (Services) {
                        updatedService = findCart.services.find(service => service.serviceId.equals(Services));
                        if (updatedService) {
                                updatedService.quantity = quantity;
                                updatedService.total = updatedService.price * quantity;
                        } else {
                                return res.status(404).send({ status: 404, message: "Service not found in the cart" });
                        }
                }

                if (packageServices) {
                        let existingPackageService;

                        for (const pkg of findCart.packages) {
                                existingPackageService = pkg.services.find(service => service.serviceId.equals(packageServices));

                                if (existingPackageService) {
                                        existingPackageService.quantity = quantity;
                                        existingPackageService.total = existingPackageService.price * quantity;
                                        updatedService = existingPackageService;
                                }
                        }

                        if (!existingPackageService) {
                                return res.status(404).send({ status: 404, message: "Service not found in the cart" });
                        }
                }

                if (AddOnServices) {
                        let existingAddOnService;

                        for (const pkg of findCart.packages) {
                                existingAddOnService = pkg.addOnServices.find(service => service.serviceId.equals(AddOnServices));

                                if (existingAddOnService) {
                                        existingAddOnService.quantity = quantity;
                                        // Consider discount price if discount is active, else use the original price
                                        existingAddOnService.total = existingAddOnService.discountActive
                                                ? existingAddOnService.discountPrice * quantity
                                                : existingAddOnService.originalPrice * quantity;
                                        updatedService = existingAddOnService;
                                }
                        }

                        if (!existingAddOnService) {
                                return res.status(404).send({ status: 404, message: "Service not found in the cart" });
                        }
                }

                findCart.totalAmount = calculateTotalAmount(findCart);

                await findCart.save();

                return res.status(200).json({
                        status: 200,
                        message: "Service quantity updated in the cart.",
                        data: {
                                cart: findCart,
                                updatedService,
                        },
                });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

exports.updatePackageQuantity = async (req, res) => {
        try {
                const { packageId, quantity } = req.body;

                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const findCart = await Cart.findOne({ userId: userData._id });
                if (!findCart) {
                        return res.status(404).send({ status: 404, message: "Cart not found" });
                }

                const packageIndex = findCart.packages.findIndex((pkg) => pkg.packageId.equals(packageId));

                if (packageIndex !== -1) {
                        const existingPackage = findCart.packages[packageIndex];
                        const oldQuantity = existingPackage.quantity;

                        existingPackage.quantity = quantity;
                        existingPackage.total = existingPackage.price * quantity;

                        findCart.totalAmount = findCart.packages.reduce((total, pkg) => total + pkg.total, 0);
                        findCart.totalAmount += calculateServices2Total(findCart.services);

                        findCart.paidAmount += existingPackage.price /** (quantity - oldQuantity);*/
                        console.log("paidAmount*****", findCart.paidAmount);
                        await findCart.save();

                        return res.status(200).json({ status: 200, message: "Package quantity updated in the cart.", data: findCart });
                } else {
                        return res.status(404).send({ status: 404, message: "Package not found in the cart" });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

exports.provideTip = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        let Charged = [], paidAmount = 0, additionalFee = 0, coupan = 0, wallet = 0, tip;
                                        const findCharge = await Charges.find({});
                                        if (findCharge.length > 0) {
                                                for (let i = 0; i < findCharge.length; i++) {
                                                        let obj1 = {
                                                                chargeId: findCharge[i]._id,
                                                                charge: findCharge[i].charge,
                                                                discountCharge: findCharge[i].discountCharge,
                                                                discount: findCharge[i].discount,
                                                                cancelation: findCharge[i].cancelation,
                                                        }
                                                        if (findCharge[i].cancelation == false) {
                                                                if (findCharge[i].discount == true) {
                                                                        additionalFee = additionalFee + findCharge[i].discountCharge
                                                                } else {
                                                                        additionalFee = additionalFee + findCharge[i].charge
                                                                }
                                                        }
                                                        Charged.push(obj1)
                                                }
                                        }
                                        if (findCart.coupanUsed == true) {
                                                let findCoupan = await Coupan.findById({ _id: findCart.coupanId });
                                                coupan = findCoupan.discount;
                                        } else {
                                                coupan = 0
                                        }
                                        if (findCart.walletUsed == true) {
                                                wallet = userData.wallet;
                                        } else {
                                                wallet = 0
                                        }
                                        if (req.body.tipProvided > 0) {
                                                tip = true
                                        } else {
                                                tip = false
                                        }
                                        paidAmount = findCart.totalAmount + additionalFee + req.body.tipProvided - wallet - coupan;
                                        let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { Charges: Charged, tip: tip, tipProvided: req.body.tipProvided, walletUsed: findCart.walletUsed, coupanUsed: findCart.coupanUsed, freeServiceUsed: findCart.freeServiceUsed, wallet: wallet, coupan: coupan, freeService: findCart.freeService, totalAmount: findCart.totalAmount, additionalFee: additionalFee, paidAmount: paidAmount, totalItem: findCart.totalItem } }, { new: true });
                                        return res.status(200).json({ status: 200, message: "Tip add to cart Successfully.", data: update1 })
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
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
                        let findService = await Coupan.find({ userId: vendorData._id });
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
exports.applyCoupan = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        let Charged = [], paidAmount = 0, additionalFee = 0, coupan = 0, coupanUsed, wallet = 0, tipProvided = 0;
                                        const findCharge = await Charges.find({});
                                        if (findCharge.length > 0) {
                                                for (let i = 0; i < findCharge.length; i++) {
                                                        let obj1 = {
                                                                chargeId: findCharge[i]._id,
                                                                charge: findCharge[i].charge,
                                                                discountCharge: findCharge[i].discountCharge,
                                                                discount: findCharge[i].discount,
                                                                cancelation: findCharge[i].cancelation,
                                                        }
                                                        if (findCharge[i].cancelation == false) {
                                                                if (findCharge[i].discount == true) {
                                                                        additionalFee = additionalFee + findCharge[i].discountCharge
                                                                } else {
                                                                        additionalFee = additionalFee + findCharge[i].charge
                                                                }
                                                        }
                                                        Charged.push(obj1)
                                                }
                                        }
                                        let findCoupan = await Coupan.findOne({ couponCode: req.body.couponCode });
                                        if (!findCoupan) {
                                                return res.status(404).json({ status: 404, message: "Coupan not found", data: {} });
                                        } else {
                                                if (findCoupan.status == true) {
                                                        return res.status(409).json({ status: 409, message: "Coupan Already used", data: {} });
                                                } else {
                                                        if (findCoupan.expirationDate > Date.now()) {
                                                                coupan = findCoupan.discount;
                                                                coupanUsed = true;
                                                                if (findCart.walletUsed == true) {
                                                                        wallet = userData.wallet;
                                                                } else {
                                                                        wallet = 0
                                                                }
                                                                if (findCart.tip == true) {
                                                                        tipProvided = findCart.tipProvided
                                                                } else {
                                                                        tipProvided = 0;
                                                                }
                                                                paidAmount = findCart.totalAmount + additionalFee + tipProvided - wallet - coupan;
                                                                let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, {
                                                                        $set: { coupanId: findCoupan._id, Charges: Charged, tip: findCart.tip, tipProvided: tipProvided, walletUsed: findCart.walletUsed, coupanUsed: coupanUsed, freeServiceUsed: findCart.freeServiceUsed, wallet: wallet, coupan: coupan, freeService: findCart.freeService, totalAmount: findCart.totalAmount, additionalFee: additionalFee, paidAmount: paidAmount, totalItem: findCart.totalItem }
                                                                }, { new: true });
                                                                return res.status(200).json({ status: 200, message: "Tip add to cart Successfully.", data: update1 })
                                                        } else {
                                                                return res.status(409).json({ status: 409, message: "Coupan expired", data: {} });
                                                        }
                                                }
                                        }
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.applyWallet = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        let Charged = [], paidAmount = 0, additionalFee = 0, coupan = 0, wallet = 0, walletUsed;
                                        const findCharge = await Charges.find({});
                                        if (findCharge.length > 0) {
                                                for (let i = 0; i < findCharge.length; i++) {
                                                        let obj1 = {
                                                                chargeId: findCharge[i]._id,
                                                                charge: findCharge[i].charge,
                                                                discountCharge: findCharge[i].discountCharge,
                                                                discount: findCharge[i].discount,
                                                                cancelation: findCharge[i].cancelation,
                                                        }
                                                        if (findCharge[i].cancelation == false) {
                                                                if (findCharge[i].discount == true) {
                                                                        additionalFee = additionalFee + findCharge[i].discountCharge
                                                                } else {
                                                                        additionalFee = additionalFee + findCharge[i].charge
                                                                }
                                                        }
                                                        Charged.push(obj1)
                                                }
                                        }
                                        if (findCart.coupanUsed == true) {
                                                let findCoupan = await Coupan.findById({ _id: findCart.coupanId });
                                                coupan = findCoupan.discount;
                                        } else {
                                                coupan = 0
                                        }
                                        if (userData.wallet > 0) {
                                                wallet = userData.wallet;
                                                walletUsed = true;
                                        } else {
                                                wallet = 0
                                        }
                                        if (findCart.tip == true) {
                                                tipProvided = findCart.tipProvided
                                        } else {
                                                tipProvided = 0;
                                        }
                                        paidAmount = findCart.totalAmount + additionalFee + tipProvided - wallet - coupan;
                                        let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { Charges: Charged, tip: findCart.tip, tipProvided: tipProvided, walletUsed: walletUsed, coupanUsed: findCart.coupanUsed, freeServiceUsed: findCart.freeServiceUsed, wallet: wallet, coupan: coupan, freeService: findCart.freeService, totalAmount: findCart.totalAmount, additionalFee: additionalFee, paidAmount: paidAmount, totalItem: findCart.totalItem } }, { new: true });
                                        return res.status(200).json({ status: 200, message: "wallet apply on cart Successfully.", data: update1 })
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
// exports.addFreeServiceToCart = async (req, res) => {
//         try {
//                 let userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         let findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 if (findCart.services.length == 0) {
//                                         return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
//                                 } else {
//                                         const findFreeService = await freeService.findOne({ _id: req.body.freeServiceId, userId: req.user._id })
//                                         if (findFreeService) {
//                                                 let obj = {
//                                                         freeServiceId: findFreeService._id
//                                                 }
//                                                 let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { freeServiceUsed: true, freeServiceCount: findCart.freeServiceCount + 1 }, $push: { freeService: obj } }, { new: true });
//                                                 return res.status(200).json({ status: 200, message: "Free service add to cart Successfully.", data: update1 })
//                                         } else {
//                                                 return res.status(404).send({ status: 404, message: "Free service not found" });
//                                         }
//                                 }
//                         } else {
//                                 return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };


// exports.addFreeServiceToCart = async (req, res) => {
//         try {
//                 const userId = req.user._id;
//                 const freeServiceId = req.body.freeServiceId;

//                 const userData = await User.findOne({ _id: userId });
//                 if (!userData) {
//                         return res.status(404).json({ status: 404, message: "User not found" });
//                 }

//                 const findCart = await Cart.findOne({ userId });
//                 if (!findCart) {
//                         return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
//                 }

//                 const findFreeService = await freeService.findOne({ _id: freeServiceId, userId });
//                 if (!findFreeService) {
//                         return res.status(404).json({ status: 404, message: "Free service not found" });
//                 }

//                 const isServiceInCart = findCart.freeService.some((service) => service.freeServiceId.equals(freeServiceId));

//                 if (isServiceInCart) {
//                         return res.status(200).json({ status: 200, message: "Free service is already in the cart.", data: findCart });
//                 }

//                 findCart.totalAmount = 0;
//                 findCart.additionalFee = 0;
//                 findCart.paidAmount = 0;
//                 findCart.totalItem = 0;
//                 findCart.services = [];
//                 findCart.freeServiceUsed = true;
//                 findCart.freeServiceCount += 1;
//                 findCart.freeService.push({ freeServiceId: findFreeService._id });

//                 const update1 = await findCart.save();

//                 return res
//                         .status(200)
//                         .json({ status: 200, message: "Free service added to cart successfully.", data: update1 });
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).json({ status: 500, message: "Server error: " + error.message });
//         }
// };

exports.addFreeServiceToCart = async (req, res) => {
        try {
                const userId = req.user._id;
                const freeServiceId = req.body.freeServiceId;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).json({ status: 404, message: "User not found" });
                }

                const findCart = await Cart.findOne({ userId });
                if (!findCart) {
                        return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                }

                const findFreeService = await freeService.findOne({ _id: freeServiceId, userId });
                if (!findFreeService) {
                        return res.status(404).json({ status: 404, message: "Free service not found" });
                }

                const isServiceInCart = findCart.freeService.some(service => service.freeServiceId.equals(freeServiceId));

                if (isServiceInCart) {
                        return res.status(200).json({ status: 200, message: "Free service is already in the cart.", data: findCart });
                }

                const obj = {
                        freeServiceId: findFreeService._id
                };
                const update1 = await Cart.findByIdAndUpdate(
                        { _id: findCart._id },
                        {
                                $set: { freeServiceUsed: true, freeServiceCount: findCart.freeServiceCount + 1 },
                                $push: { freeService: obj }
                        },
                        { new: true }
                );

                return res.status(200).json({ status: 200, message: "Free service added to cart successfully.", data: update1 });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: "Server error: " + error.message });
        }
};

exports.addSuggestionToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });
                        if (findCart) {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { suggestion: req.body.suggestion }, }, { new: true });
                                        return res.status(200).json({ status: 200, message: "suggestion add to cart Successfully.", data: update1 })
                                }
                        } else {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.addAdressToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id })
                        if (!findCart) {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        } else {
                                if (findCart.services.length == 0) {
                                        return res.status(404).json({ status: 404, message: "First add service in your cart.", data: {} });
                                } else {
                                        const data1 = await Address.findById({ _id: req.params.id });
                                        if (data1) {
                                                let update1 = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { houseFlat: data1.houseFlat, appartment: data1.appartment, landMark: data1.landMark, houseType: data1.houseType }, }, { new: true });
                                                return res.status(200).json({ status: 200, message: "suggestion add to cart Successfully.", data: update1 })
                                        } else {
                                                return res.status(404).json({ status: 404, message: "No data found", data: {} });
                                        }
                                }
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
// exports.addDateAndTimeToCart = async (req, res) => {
//         try {
//                 let userData = await User.findOne({ _id: req.user._id });
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found" });
//                 } else {
//                         let findCart = await Cart.findOne({ userId: userData._id });
//                         if (findCart) {
//                                 if (findCart.services.length == 0) {
//                                         return res.status(404).send({ status: 404, message: "Your cart have no service found." });
//                                 } else {
//                                         const d = new Date(req.body.date);
//                                         let text = d.toISOString();
//                                         let update = await Cart.findByIdAndUpdate({ _id: findCart._id }, { $set: { Date: text, startTime: req.body.startTime, endTime: req.body.endTime } }, { new: true });
//                                         if (update) {
//                                                 return res.status(200).send({ status: 200, message: "Date And Time add to Cart successfully.", data: update });
//                                         }
//                                 }
//                         } else {
//                                 return res.status(404).send({ status: 404, message: "Your cart is not found." });
//                         }
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error" + error.message });
//         }
// };

exports.addDateAndTimeToCart = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });

                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                let findCart = await Cart.findOne({ userId: userData._id });
                console.log(findCart);
                if (findCart) {
                        if (findCart.services.length === 0 && findCart.packages.length === 0) {
                                return res.status(404).send({ status: 404, message: "Your cart has no services or packages found." });
                        }

                        const d = new Date(req.body.date);
                        let text = d.toISOString();

                        const isStartTimeValid = await Slot.findOne({ timeFrom: req.body.startTime, status: false });
                        const isEndTimeValid = await Slot.findOne({ timeTo: req.body.endTime, status: false });

                        if (!isStartTimeValid || !isEndTimeValid) {
                                return res.status(400).send({ status: 400, message: "Invalid startTime or endTime. Please select an available time slot." });
                        }

                        let update = await Cart.findByIdAndUpdate(
                                { _id: findCart._id },
                                { $set: { Date: text, startTime: req.body.startTime, endTime: req.body.endTime } },
                                { new: true }
                        );

                        if (update) {
                                return res.status(200).send({ status: 200, message: "Date and Time added to the cart successfully.", data: update });
                        }
                } else {
                        return res.status(404).send({ status: 404, message: "Your cart is not found." });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error: " + error.message });
        }
};

// exports.updateDateAndTimeByOrderId = async (req, res) => {
//         try {
//                 const orderId = req.body.orderId;
//                 const newDate = req.body.date;
//                 const startTime = req.body.startTime;
//                 const endTime = req.body.endTime;

//                 if (!orderId || !newDate || !startTime || !endTime) {
//                         return res.status(400).send({ status: 400, message: "Invalid request data." });
//                 }

//                 let userData = await User.findOne({ _id: req.user._id });
//                 console.log(userData);
//                 if (!userData) {
//                         return res.status(404).send({ status: 404, message: "User not found." });
//                 }

//                 const findOrder = await Order.findOne({ userId: userData._id, _id: orderId });

//                 if (!findOrder) {
//                         return res.status(404).send({ status: 404, message: "Order not found for the provided orderId." });
//                 }

//                 const d = new Date(newDate);
//                 const text = d.toISOString();

//                 const update = await Order.findByIdAndUpdate(
//                         { _id: findOrder._id },
//                         { $set: { Date: text, startTime: startTime, endTime: endTime } },
//                         { new: true }
//                 );

//                 if (update) {
//                         return res.status(200).send({ status: 200, message: "Date and time updated successfully.", data: update });
//                 } else {
//                         return res.status(500).send({ status: 500, message: "Failed to update date and time." });
//                 }
//         } catch (error) {
//                 console.error(error);
//                 return res.status(500).send({ status: 500, message: "Server error: " + error.message });
//         }
// };

exports.updateDateAndTimeByOrderId = async (req, res) => {
        try {
                const orderId = req.body.orderId;
                const newDate = req.body.date;
                const startTime = req.body.startTime;
                const endTime = req.body.endTime;

                if (!orderId || !newDate || !startTime || !endTime) {
                        return res.status(400).send({ status: 400, message: "Invalid request data." });
                }

                let userData = await User.findOne({ _id: req.user._id });
                console.log(userData);
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found." });
                }

                const findOrder = await Order.findOne({ userId: userData._id, _id: orderId });

                if (!findOrder) {
                        return res.status(404).send({ status: 404, message: "Order not found for the provided orderId." });
                }

                const isStartTimeValid = await DateAndTimeSlot.findOne({ startTime, isAvailable: true });
                const isEndTimeValid = await DateAndTimeSlot.findOne({ endTime, isAvailable: true });

                if (!isStartTimeValid || !isEndTimeValid) {
                        return res.status(400).send({ status: 400, message: "Please select an available time slot." });
                }

                const d = new Date(newDate);
                const text = d.toISOString();

                const update = await Order.findByIdAndUpdate(
                        { _id: findOrder._id },
                        { $set: { Date: text, startTime: startTime, endTime: endTime } },
                        { new: true }
                );

                if (update) {
                        return res.status(200).send({ status: 200, message: "Date and time updated successfully.", data: update });
                } else {
                        return res.status(500).send({ status: 500, message: "Failed to update date and time." });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error: " + error.message });
        }
};

exports.checkout = async (req, res) => {
        try {
                let userData = await User.findOne({ _id: req.user._id });

                if (!userData) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        let findCart = await Cart.findOne({ userId: userData._id });

                        if (!findCart) {
                                return res.status(404).json({ status: 404, message: "Cart is empty.", data: {} });
                        } else {
                                let totalIsSlotPrice = 0;

                                const timeSlotsFromCart = {
                                        timeFrom: findCart.startTime,
                                        timeTo: findCart.endTime,
                                };

                                const matchingTimeSlots = await Slot.find({
                                        $and: [
                                                { isSurgeAmount: true },
                                                timeSlotsFromCart,
                                        ],
                                });

                                for (const slot of matchingTimeSlots) {
                                        totalIsSlotPrice += slot.surgeAmount;
                                }

                                findCart.paidAmount += totalIsSlotPrice;

                                let orderId = await reffralCode();
                                let obj = {
                                        orderId: orderId,
                                        userId: findCart.userId,
                                        coupanId: findCart.coupanId,
                                        freeService: findCart.freeService,
                                        Charges: findCart.Charges,
                                        tipProvided: findCart.tipProvided,
                                        tip: findCart.tip,
                                        freeServiceUsed: findCart.freeServiceUsed,
                                        coupanUsed: findCart.coupanUsed,
                                        walletUsed: findCart.walletUsed,
                                        wallet: findCart.wallet,
                                        coupan: findCart.coupan,
                                        freeServiceCount: findCart.freeServiceCount,
                                        suggestion: findCart.suggestion,
                                        address: findCart.address,
                                        city: findCart.city,
                                        state: findCart.state,
                                        pinCode: findCart.pinCode,
                                        landMark: findCart.landMark,
                                        street: findCart.street,
                                        Date: findCart.Date,
                                        startTime: findCart.startTime,
                                        endTime: findCart.endTime,
                                        services: findCart.services,
                                        packages: findCart.packages,
                                        totalAmount: findCart.totalAmount,
                                        additionalFee: findCart.additionalFee,
                                        paidAmount: findCart.paidAmount,
                                        totalItem: findCart.totalItem,
                                        orderStatus: "Unconfirmed",
                                        serviceStatus: "Pending",
                                        status: "Pending",
                                        paymentStatus: "Pending",
                                };

                                let SaveOrder = await Order.create(obj);

                                if (SaveOrder) {
                                        return res.status(200).json({ status: 200, message: "Order created successfully.", data: SaveOrder });
                                }
                        }
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "Server error.", data: {} });
        }
};

exports.placeOrder = async (req, res) => {
        try {
                let findUserOrder = await orderModel.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        if (req.body.paymentStatus == "Paid") {
                                let update = await orderModel.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "Confirmed", status: "confirmed", paymentStatus: "Paid" } }, { new: true });

                                await Cart.deleteOne({ userId: findUserOrder.userId });

                                return res.status(200).json({ message: "Payment success.", status: 200, data: update });
                        }
                        if (req.body.paymentStatus == "Failed") {
                                return res.status(201).json({ message: "Payment failed.", status: 201, orderId: orderId });
                        }
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.deleteOrder = async (req, res) => {
        try {
                const orderId = req.params.orderId;

                const deletedOrder = await orderModel.findOneAndDelete({ orderId });

                if (deletedOrder) {
                        return res.status(200).json({ message: 'Order deleted successfully', status: 200, data: deletedOrder });
                } else {
                        return res.status(404).json({ message: 'Order not found', data: {} });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: 'Server error', data: {} });
        }
};

exports.cancelOrder = async (req, res) => {
        try {
                let findUserOrder = await orderModel.findOne({ orderId: req.params.orderId });
                if (findUserOrder) {
                        let update = await orderModel.findByIdAndUpdate({ _id: findUserOrder._id }, { $set: { orderStatus: "Cancel" } }, { new: true });
                        return res.status(200).json({ message: "order cancel success.", status: 200, data: update })
                } else {
                        return res.status(404).json({ message: "No data found", data: {} });
                }
        } catch (error) {
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getOngoingOrders = async (req, res) => {
        try {
                const data = await orderModel
                        .find({ userId: req.user._id, serviceStatus: "Pending" })
                        .populate({
                                path: "freeService.freeServiceId"
                        })
                        .populate({
                                path: "services.serviceId"
                        })
                        .populate({
                                path: "Charges.chargeId",
                        })
                // .populate({
                //         path: "services.serviceId",
                //         populate: [
                //                 {
                //                         path: "mainCategoryId categoryId subCategoryId",
                //                 },
                //         ],
                // })

                if (data.length > 0) {
                        return res.status(200).json({ message: "All orders", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {} });
        }
};

exports.getCompleteOrders = async (req, res) => {
        try {
                const data = await orderModel.find({ userId: req.user._id, serviceStatus: "Complete" });
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
exports.getOrder = async (req, res) => {
        try {
                const data = await orderModel.findById({ _id: req.params.id });
                if (data) {
                        return res.status(200).json({ message: "view order", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.AddFeedback = async (req, res) => {
        try {
                const { type, Feedback, rating } = req.body;
                if (!type && Feedback && rating) {
                        return res.status(201).send({ message: "All filds are required" })
                } else {
                        let obj = {
                                userId: req.user._id,
                                type: type,
                                Feedback: Feedback,
                                rating: rating
                        }
                        const data = await feedback.create(obj);
                        return res.status(200).json({ details: data })
                }
        } catch (err) {
                console.log(err);
                return res.status(400).json({ message: err.message })
        }
};
exports.addFavouriteBooking = async (req, res) => {
        try {
                const data = await orderModel.findById({ _id: req.params.orderId });
                if (data) {
                        let obj = {
                                userId: req.user._id,
                                services: data.services,
                                totalAmount: data.paidAmount,
                                totalItem: data.totalItem
                        }
                        const newUser = await favouriteBooking.create(obj);
                        if (newUser) {
                                return res.status(200).json({ status: 200, message: "Add to favourite booking.", data: newUser });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.listFavouriteBooking = async (req, res) => {
        try {
                let findUser = await User.findOne({ _id: req.user._id });
                if (!findUser) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findTicket = await favouriteBooking.find({ userId: findUser._id })
                                .populate({
                                        path: 'services.serviceId',
                                        model: 'services'

                                })
                                .populate({
                                        path: 'services.categoryId',
                                        model: 'Category',
                                        select: 'name image'
                                })
                                .populate({
                                        path: 'services',
                                        populate: {
                                                path: 'services.service',
                                                model: 'services',
                                                select: 'title images'
                                        }
                                });
                        if (findTicket.length == 0) {
                                return res.status(404).send({ status: 404, message: "Data not found" });
                        } else {
                                res.json({ status: 200, message: 'Favourite Booking found successfully.', data: findTicket });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
const ticketCode = async () => {
        var digits = "0123456789012345678901234567890123456789";
        let OTP = '';
        for (let i = 0; i < 8; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
exports.addMoney = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: data.wallet + parseInt(req.body.balance) } }, { new: true });
                        if (update) {
                                const date = new Date();
                                let month = date.getMonth() + 1
                                let obj = {
                                        user: req.user._id,
                                        date: date,
                                        month: month,
                                        amount: req.body.balance,
                                        type: "Credit",
                                };
                                const data1 = await transactionModel.create(obj);
                                if (data1) {
                                        return res.status(200).json({ status: 200, message: "Money has been added.", data: update, });
                                }

                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.removeMoney = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        let update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { wallet: data.wallet - parseInt(req.body.balance) } }, { new: true });
                        if (update) {
                                const date = new Date();
                                let month = date.getMonth() + 1;
                                let obj;
                                // if (req.body.orderId) {
                                //         obj = {
                                //                 orderId: req.body.orderId,
                                //                 user: req.user._id,
                                //                 date: date,
                                //                 month: month,
                                //                 amount: req.body.balance,
                                //                 type: "Debit",
                                //         };
                                // }
                                // if (req.body.subscriptionId) {
                                obj = {
                                        // subscriptionId: req.body.subscriptionId,
                                        user: req.user._id,
                                        date: date,
                                        month: month,
                                        amount: req.body.balance,
                                        type: "Debit",
                                };
                                // }
                                const data1 = await transactionModel.create(obj);
                                if (data1) {
                                        return res.status(200).json({ status: 200, message: "Money has been deducted.", data: update, });
                                }
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getWallet = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        return res.status(200).json({ message: "Wallet balance found.", data: data.wallet });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.allTransactionUser = async (req, res) => {
        try {
                if ((req.query.month != null && req.query.month !== undefined) && (req.query.type == null || req.query.type === undefined)) {
                        const data = await transactionModel
                                .find({ user: req.user._id, month: req.query.month })
                                .populate({ path: 'user', select: 'fullName' });

                        if (data.length > 0) {
                                return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
                        } else {
                                return res.status(404).json({ status: 404, message: "Data not found.", data: {} });
                        }
                } else if ((req.query.month == null || req.query.month === undefined) && (req.query.type != null && req.query.type !== undefined)) {
                        const data = await transactionModel
                                .find({ user: req.user._id, type: req.query.type })
                                .populate({ path: 'user', select: 'fullName' });

                        if (data.length > 0) {
                                return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
                        } else {
                                return res.status(404).json({ status: 404, message: "Data not found.", data: {} });
                        }
                } else {
                        const data = await transactionModel
                                .find({ user: req.user._id })
                                .populate({ path: 'user', select: 'fullName' });

                        if (data.length > 0) {
                                return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
                        } else {
                                return res.status(404).json({ status: 404, message: "Data not found.", data: {} });
                        }
                }
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.allcreditTransactionUser = async (req, res) => {
        try {
                const data = await transactionModel.find({ user: req.user._id, type: "Credit" });
                if (data.length > 0) {
                        return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "Data not found.", data: {} });
                }
        } catch (err) {
                return res.status(400).json({ message: err.message });
        }
};
exports.allDebitTransactionUser = async (req, res) => {
        try {
                const data = await transactionModel.find({ user: req.user._id, type: "Debit" });
                if (data.length > 0) {
                        return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
                } else {
                        return res.status(404).json({ status: 404, message: "Data not found.", data: {} });
                }
        } catch (err) {
                return res.status(400).json({ message: err.message });
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
exports.createRating = async (req, res) => {
        try {
                const userId = req.user._id;

                const {
                        orderId,
                        categoryId,
                        ratingValue,
                        comment,
                        date,
                        type,
                } = req.body;

                if (!orderId || !categoryId || !ratingValue || !date) {
                        return res.status(400).json({ error: 'Incomplete data for rating creation' });
                }

                const user = await User.findOne({ _id: userId });
                const order = await Order.findOne({ _id: orderId });
                console.log("order", order);
                const category = await Category.findOne({ _id: categoryId });

                if (!user || !order || !category) {
                        return res.status(404).json({ error: 'User, order, or category not found' });
                }

                let rating = await Rating.findOne({
                        userId: user._id,
                        partnerId: order.partnerId,
                        orderId: order._id,
                        categoryId: category._id,
                });

                if (!rating) {
                        rating = new Rating({
                                userId: user._id,
                                partnerId: order.partnerId,
                                orderId: order._id,
                                categoryId: category._id,
                                type: "order",
                                rating: [{
                                        userId: user._id,
                                        rating: ratingValue,
                                        comment,
                                        date,
                                }],
                        });
                } else {
                        rating.rating.push({
                                userId: user._id,
                                rating: ratingValue,
                                comment,
                                date,
                        });
                }

                switch (ratingValue) {
                        case 1:
                                rating.rating1++;
                                break;
                        case 2:
                                rating.rating2++;
                                break;
                        case 3:
                                rating.rating3++;
                                break;
                        case 4:
                                rating.rating4++;
                                break;
                        case 5:
                                rating.rating5++;
                                break;
                        default:
                                break;
                }

                rating.totalRating = rating.rating1 + rating.rating2 + rating.rating3 + rating.rating4 + rating.rating5;

                const totalRatings = rating.totalRating;
                const sumRatings = rating.rating1 + rating.rating2 * 2 + rating.rating3 * 3 + rating.rating4 * 4 + rating.rating5 * 5;
                rating.averageRating = totalRatings === 0 ? 0 : sumRatings / totalRatings;

                const savedRating = await rating.save();

                res.status(201).json({ message: 'Rating created successfully', data: savedRating });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create rating' });
        }
};
exports.getAllRatingsForOrder = async (req, res) => {
        try {
                const allRatings = await Rating.find({ type: "order" });
                res.status(200).json({ message: "All Ratings Found", status: 200, data: allRatings });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", status: 500, data: {} });
        }
};
exports.getRatingById = async (req, res) => {
        try {
                const ratingId = req.params.ratingId;
                const rating = await Rating.findById(ratingId);
                if (!rating) {
                        return res.status(404).json({ message: "Rating Not Found", status: 404, data: {} });
                }
                res.status(200).json({ message: "Rating Found", status: 200, data: rating });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Server error", status: 500, data: {} });
        }
};
exports.getRatingCountsForOrder = async (req, res) => {
        try {
                const ratingCounts = await Rating.aggregate([
                        {
                                $match: { type: "order" }
                        },
                        {
                                $group: {
                                        _id: null,
                                        rating1Count: { $sum: "$rating1" },
                                        rating2Count: { $sum: "$rating2" },
                                        rating3Count: { $sum: "$rating3" },
                                        rating4Count: { $sum: "$rating4" },
                                        rating5Count: { $sum: "$rating5" }
                                }
                        },
                        {
                                $project: {
                                        _id: 0
                                }
                        }
                ]);

                if (ratingCounts.length === 0) {
                        return res.status(404).json({ status: 404, message: "No ratings found for order" });
                }
                const orderRatings = ratingCounts[0];

                res.status(200).json({ status: 200, message: "Order rating counts", data: orderRatings });
        } catch (error) {
                console.error(error);
                res.status(500).json({ status: 500, message: "Server error", data: {} });
        }
};
exports.getUserRatingsWithOrders = async (req, res) => {
        try {
                const userId = req.user._id;
                console.log("userId", userId);

                const userWithRatings = await Rating.find({ userId: userId }).populate("userId orderId mainCategory categoryId");

                if (!userWithRatings || userWithRatings.length === 0) {
                        return res.status(404).json({ error: 'User not found or has no ratings' });
                }

                res.status(200).json({ userWithRatings });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch user ratings' });
        }
};
exports.giveMaincategoryRating = async (req, res) => {
        try {
                const userId = req.user._id;
                const {
                        categoryId,
                        partnerId,
                        ratingValue,
                        comment,
                        date,
                        type,
                } = req.body;

                if (!categoryId || !ratingValue || !date) {
                        return res.status(400).json({ error: 'Incomplete data for rating creation' });
                }

                const user = await User.findOne({ _id: userId });
                const category = await MainCategory.findOne({ _id: categoryId });

                if (!user || !category) {
                        return res.status(404).json({ error: 'User or category not found' });
                }

                let rating = await Rating.findOne({ categoryId: category._id });

                if (!rating) {
                        rating = new Rating({
                                categoryId: category._id,
                                partnerId: partnerId,
                                type: "mainCategory",
                                rating: [],
                        });
                }

                rating.rating.push({
                        userId: user._id,
                        rating: Number(ratingValue),
                        comment,
                        date,
                });

                switch (Number(ratingValue)) {
                        case 1:
                                rating.rating1++;
                                break;
                        case 2:
                                rating.rating2++;
                                break;
                        case 3:
                                rating.rating3++;
                                break;
                        case 4:
                                rating.rating4++;
                                break;
                        case 5:
                                rating.rating5++;
                                break;
                        default:
                                break;
                }

                rating.totalRating = rating.rating1 + rating.rating2 + rating.rating3 + rating.rating4 + rating.rating5;


                const totalRatings = rating.totalRating;
                const sumRatings = rating.rating1 + rating.rating2 * 2 + rating.rating3 * 3 + rating.rating4 * 4 + rating.rating5 * 5;
                rating.averageRating = totalRatings === 0 ? 0 : sumRatings / totalRatings;

                const savedRating = await rating.save();

                res.status(201).json({ message: 'Rating created successfully', data: savedRating });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create rating' });
        }
};
exports.getAllRatingsForMainCategory = async (req, res) => {
        try {
                const mainCategory = req.params.mainCategory
                console.log("mainCategory", mainCategory);
                const allRatings = await Rating.findOne({ categoryId: mainCategory, type: "mainCategory" }).populate({
                        path: 'rating.userId',
                        model: 'user',
                        select: 'fullName image date rating comment reply -_id',
                });
                return res.status(200).json({ message: "All Ratings Found", status: 200, data: allRatings });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500, data: {} });
        }
};

// exports.getRatingCountsForMainCategory = async (req, res) => {
//         try {
//                 const mainCategory = req.params.mainCategory;
//                 console.log("mainCategory", mainCategory);

//                 const ratings = await Rating.find({ categoryId: mainCategory, type: "mainCategory" });
//                 console.log("ratings", ratings);
//                 const ratingCounts = await Rating.aggregate([
//                         {
//                                 // $match: { type: "mainCategory" }
//                                 $match: { type: "mainCategory", categoryId: mainCategory }

//                         },
//                         {
//                                 $group: {
//                                         _id: null,
//                                         rating1Count: { $sum: "$rating1" },
//                                         rating2Count: { $sum: "$rating2" },
//                                         rating3Count: { $sum: "$rating3" },
//                                         rating4Count: { $sum: "$rating4" },
//                                         rating5Count: { $sum: "$rating5" }
//                                 }
//                         },
//                         {
//                                 $project: {
//                                         _id: 0
//                                 }
//                         }
//                 ]);

//                 if (ratingCounts.length === 0) {
//                         return res.status(404).json({ status: 404, message: "No ratings found for mainCategory" });
//                 }
//                 const mainCategoryRatings = ratingCounts[0];

//                 res.status(200).json({ status: 200, message: "Main category rating counts", data: mainCategoryRatings });
//         } catch (error) {
//                 console.error(error);
//                 res.status(500).json({ status: 500, message: "Server error", data: {} });
//         }
// };

exports.getRatingCountsForAllMainCategory = async (req, res) => {
        try {
                const ratings = await Rating.find({ type: "mainCategory" });
                console.log("ratings", ratings);

                const ratingCounts = await Rating.aggregate([
                        {
                                $match: { type: "mainCategory", /*categoryId: mainCategory*/ }
                        },
                        {
                                $group: {
                                        _id: null,
                                        rating1Count: { $sum: "$rating1" },
                                        rating2Count: { $sum: "$rating2" },
                                        rating3Count: { $sum: "$rating3" },
                                        rating4Count: { $sum: "$rating4" },
                                        rating5Count: { $sum: "$rating5" }
                                }
                        },
                        {
                                $project: {
                                        _id: 0,
                                        // rating1Count: 1,
                                        // rating2Count: 1,
                                        // rating3Count: 1,
                                        // rating4Count: 1,
                                        // rating5Count: 1
                                }
                        }
                ]);
                console.log("ratingCounts", ratingCounts);
                if (ratingCounts.length === 0) {
                        return res.status(404).json({ status: 404, message: "No ratings found for mainCategory" });
                }

                const mainCategoryRatings = ratingCounts[0];
                res.status(200).json({ status: 200, message: "Main category rating counts", data: mainCategoryRatings });
        } catch (error) {
                console.error(error);
                res.status(500).json({ status: 500, message: "Server error", data: {} });
        }
};
exports.getRatingCountsForMainCategory = async (req, res) => {
        try {
                const mainCategory = new mongoose.Types.ObjectId(req.params.categoryId);
                console.log("mainCategory", mainCategory);

                const ratingCounts = await Rating.aggregate([
                        {
                                $match: { type: "mainCategory", categoryId: new mongoose.Types.ObjectId(mainCategory) }
                        },
                        {
                                $group: {
                                        _id: null,
                                        rating1Count: { $sum: "$rating1" },
                                        rating2Count: { $sum: "$rating2" },
                                        rating3Count: { $sum: "$rating3" },
                                        rating4Count: { $sum: "$rating4" },
                                        rating5Count: { $sum: "$rating5" }
                                }
                        },
                        {
                                $project: {
                                        _id: 0
                                }
                        }
                ]);
                console.log("ratingCounts", ratingCounts);

                if (!ratingCounts || ratingCounts.length === 0) {
                        return res.status(404).json({ status: 404, message: "No ratings found for mainCategory" });
                }

                const mainCategoryRatings = ratingCounts[0];
                res.status(200).json({ status: 200, message: "Main category rating counts", data: mainCategoryRatings });
        } catch (error) {
                console.error(error);
                res.status(500).json({ status: 500, message: "Server error", data: {} });
        }
};
exports.commentOnImage = async (req, res) => {
        try {
                const userId = req.user?._id;
                const user = await User.findById(userId);

                if (!user) {
                        return res.status(404).json({ status: 404, message: "User Not found" });
                }

                const project = await Rating.findById(req.params._id);

                if (!project) {
                        return res.status(404).json({ status: 404, message: "Not found" });
                }

                const commentObj = {
                        userId: req.user._id,
                        comment: req.body.comment,
                };

                const updatedProject = await Rating.findOneAndUpdate(
                        { 'rating._id': req.body.ratingId },
                        { $push: { 'rating.$.reply': commentObj } },
                        { new: true }
                );

                if (updatedProject) {
                        return res.status(200).json({ status: 200, message: "Reply on rating", data: updatedProject });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: "Not found" });
        }
};
exports.updateOrderStatus = async (req, res) => {
        try {
                const { orderId } = req.params;
                const { status } = req.body;
                const validStatusValues = ["Pending", "confirmed", "assigned", "OnTheWay", "Arrived", "Complete", "Review"];
                if (!validStatusValues.includes(status)) {
                        return res.status(400).json({ message: "Invalid status value" });
                }

                const updatedOrder = await Order.findByIdAndUpdate(
                        orderId,
                        { status },
                        { new: true }
                );

                if (!updatedOrder) {
                        return res.status(404).json({ message: "Order not found" });
                }

                if (status === "Complete") {
                        updatedOrder.serviceStatus = "Complete";
                        await updatedOrder.save();
                }

                res.status(200).json({ message: "Order status updated successfully", data: updatedOrder });
        } catch (error) {
                res.status(500).json({ error: error.message });
        }
};
exports.getCategoriesServices = async (req, res) => {
        try {
                const categories = await Category.find();

                if (categories.length === 0) {
                        return res.status(404).json({ message: "No categories found", status: 404, data: [] });
                }

                const categoryData = [];

                for (const category of categories) {
                        const services = await service.find({ categoryId: category._id });

                        categoryData.push({
                                category: category,
                                services: services,
                        });
                }

                return res.status(200).json({ message: "Categories found", status: 200, data: categoryData });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500, data: {} });
        }
};
exports.getCategoriesPackages = async (req, res) => {
        try {
                const categories = await Category.find();

                if (categories.length === 0) {
                        return res.status(404).json({ message: "No categories found", status: 404, data: [] });
                }

                const categoryData = [];

                for (const category of categories) {
                        const services = await Package.find({ categoryId: category._id });

                        categoryData.push({
                                category: category,
                                package: services,
                        });
                }

                return res.status(200).json({ message: "Categories found", status: 200, data: categoryData });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500, data: {} });
        }
};
exports.getCategories = async (req, res) => {
        try {
                const categories = await Category.find().populate("mainCategoryId");

                if (categories.length === 0) {
                        return res.status(404).json({ message: "No categories found", status: 404, data: [] });
                }

                const categoryData = {};

                for (const category of categories) {
                        if (!categoryData[category.mainCategoryId._id]) {
                                categoryData[category.mainCategoryId._id] = {
                                        category: category.mainCategoryId,
                                        subCategories: [],
                                };
                        }

                        categoryData[category.mainCategoryId._id].subCategories.push({
                                _id: category._id,
                                name: category.name,
                                image: category.image,
                                status: category.status,
                                createdAt: category.createdAt,
                                updatedAt: category.updatedAt,
                        });
                }

                const groupedCategories = Object.values(categoryData);

                return res.status(200).json({ message: "Categories found", status: 200, data: groupedCategories });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error", status: 500, data: {} });
        }
};
exports.listServiceforSearch = async (req, res, next) => {
        try {
                const productsCount = await service.count();
                if (req.query.search != (null || undefined)) {
                        let data1 = [
                                {
                                        $lookup: { from: "maincategories", localField: "mainCategoryId", foreignField: "_id", as: "mainCategoryId" },
                                },
                                { $unwind: "$mainCategoryId" },
                                {
                                        $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryId", },
                                },
                                { $unwind: "$categoryId" },
                                {
                                        $lookup: { from: "subcategories", localField: "subCategoryId", foreignField: "_id", as: "subCategoryId", },
                                },
                                { $unwind: "$subCategoryId" },
                                {
                                        $match: {
                                                $or: [
                                                        { "mainCategoryId.name": { $regex: req.query.search, $options: "i" }, },
                                                        { "categoryId.name": { $regex: req.query.search, $options: "i" }, },
                                                        { "subCategoryId.name": { $regex: req.query.search, $options: "i" }, },
                                                        { "title": { $regex: req.query.search, $options: "i" }, },
                                                ]
                                        }
                                },
                        ]
                        let apiFeature = await service.aggregate(data1);
                        return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
                } else {
                        let apiFeature = await service.aggregate([
                                {
                                        $lookup: { from: "maincategories", localField: "mainCategoryId", foreignField: "_id", as: "mainCategoryId" },
                                },
                                { $unwind: "$mainCategoryId" },
                                {
                                        $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryId", },
                                },
                                { $unwind: "$categoryId" },
                                {
                                        $lookup: { from: "subcategories", localField: "subCategoryId", foreignField: "_id", as: "subCategoryId", },
                                },
                                { $unwind: "$subCategoryId" },
                        ]);
                        return res.status(200).json({ status: 200, message: "Product data found.", data: apiFeature, count: productsCount });
                }
        } catch (err) {
                console.log(err);
                return res.status(500).send({ message: "Internal server error while creating Product", });
        }
};
exports.getFrequentlyAddedServices = async (req, res) => {
        try {
                const limit = req.query.limit || 10;
                const frequentlyAddedServices = await service.find()
                        .sort({ createdAt: -1 })
                        .limit(limit);

                const userId = req.user.id;
                console.log("user", userId);

                if (userId) {
                        const userCart = await Cart.findOne({ userId: userId });
                        console.log("userCart", userCart);

                        if (userCart) {
                                frequentlyAddedServices.forEach((service, index) => {
                                        const isInCart = userCart.services.some(cartService =>
                                                cartService.serviceId.equals(service._id)
                                        );
                                        frequentlyAddedServices[index] = {
                                                ...service.toObject(),
                                                cartAdded: isInCart,
                                        };
                                });
                        }
                }

                return res.status(200).json({
                        status: 200,
                        message: 'Frequently added services retrieved.',
                        data: frequentlyAddedServices,
                });
        } catch (error) {
                return res.status(500).json({
                        status: 500,
                        message: 'Internal server error',
                        data: error.message,
                });
        }
};

//helper function
const generateTicketID = () => {
        const timestamp = Date.now();
        const uniqueID = Math.floor(Math.random() * 10000);
        return `${timestamp}-${uniqueID}`;
};

exports.reportIssue = async (req, res) => {
        const { issueType, description } = req.body;

        try {
                const order = await Order.findById(req.params.orderId);
                if (!order) {
                        return res.status(404).json({ status: 404, message: 'Order not found' });
                }
                const ticketID = generateTicketID();

                const issueReport = new IssueReport({
                        order: order._id,
                        userId: req.user._id,
                        issueType,
                        description,
                        ticketID
                });

                await issueReport.save();

                return res.status(201).json({ status: 201, message: 'Issue reported successfully', data: issueReport });
        } catch (error) {
                return res.status(500).json({ error: 'Error reporting issue' });
        }
};

exports.getIssueReports = async (req, res) => {
        try {
                const issueReports = await IssueReport.find();

                return res.status(200).json(issueReports);
        } catch (error) {
                return res.status(500).json({ error: 'Error fetching issue reports' });
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

exports.getAllAreas = async (req, res) => {
        try {
                const areas = await Area.find();

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
                const area = await Area.findById(req.params.id);

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


exports.getStaticBanner = async (req, res) => {
        try {
                const userFullName = req.user.fullName;

                const firstName = userFullName.split(' ')[0];

                const banners = await banner.find({ type: "Static" }).sort({ position: 1 });

                if (banners.length === 0) {
                        return res.status(404).json({ status: 404, message: "No data found for the specified position", data: {} });
                }

                const modifiedBanners = banners.map(banner => {
                        return {
                                ...banner._doc,
                                desc: banner.desc + " " + firstName + "!",
                        };
                });

                return res.status(200).json({
                        status: 200,
                        message: "Banners found successfully.",
                        data: { banners: modifiedBanners, },
                });
        } catch (err) {
                console.error(err);
                return res.status(500).json({ status: 500, message: "Server error.", data: {} });
        }
};

exports.updateEditPackageInCart1 = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const findCart = await Cart.findOne({ userId: userData._id });

                const findPackage = req.body.packageId ? await Package.findOne({ _id: req.body.packageId, packageType: "Edit" }).populate('services.service').populate('addOnServices.service') : null;

                if (!findPackage) {
                        return res.status(404).json({ status: 404, message: "Package not found" });
                }

                if (findCart) {
                        const existingPackage = findCart.packages.find(pkg => pkg.packageId.equals(findPackage._id));

                        if (!existingPackage) {
                                return res.status(400).json({ status: 400, message: "Package not found in the cart." });
                        }

                        if (req.body.selectedServices) {
                                existingPackage.services.forEach(service => {
                                        service.selected = req.body.selectedServices.includes(service.serviceId.toString());
                                });
                        }

                        if (req.body.selectedAddOnServices) {
                                existingPackage.addOnServices.forEach(addOnService => {
                                        addOnService.selected = req.body.selectedAddOnServices.includes(addOnService.serviceId.toString());
                                });
                        }

                        existingPackage.total = calculateTotal(existingPackage);
                        findCart.totalAmount = calculateTotalAmount(findCart);
                        findCart.paidAmount = findCart.totalAmount + findCart.additionalFee;

                        await findCart.save();
                        return res.status(200).json({ status: 200, message: "Cart updated successfully.", data: findCart });
                } else {
                        return res.status(404).json({ status: 404, message: "Cart not found." });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

exports.updateEditPackageInCart = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });

                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const findCart = await Cart.findOne({ userId: userData._id });

                const findPackage = req.body.packageId
                        ? await Package.findOne({ _id: req.body.packageId, packageType: "Edit" }).populate('services.service').populate('addOnServices.service')
                        : null;

                if (!findPackage) {
                        return res.status(404).json({ status: 404, message: "Package not found" });
                }

                if (findCart) {
                        const existingPackage = findCart.packages.find(pkg => pkg.packageId.equals(findPackage._id));

                        if (!existingPackage) {
                                return res.status(400).json({ status: 400, message: "Package not found in the cart." });
                        }

                        if (req.body.selectedServices) {
                                existingPackage.services.forEach(service => {
                                        service.selected = req.body.selectedServices.includes(service.serviceId.toString());
                                });
                        }

                        if (req.body.selectedAddOnServices) {
                                existingPackage.addOnServices.forEach(addOnService => {
                                        addOnService.selected = req.body.selectedAddOnServices.includes(addOnService.serviceId.toString());
                                });
                        }

                        if (req.body.selectedServices.length === 0 && req.body.selectedAddOnServices.length === 0) {
                                existingPackage.total = existingPackage.price || 0;
                        } else {
                                existingPackage.total = calculateTotal(existingPackage);
                        }

                        findCart.totalAmount = calculateTotalAmount(findCart);
                        findCart.paidAmount = findCart.totalAmount + findCart.additionalFee;

                        console.log("Debug: existingPackage.total", existingPackage.total);
                        console.log("Debug: findCart.totalAmount", findCart.totalAmount);
                        console.log("Debug: findCart.paidAmount", findCart.paidAmount);

                        await findCart.save();
                        return res.status(200).json({ status: 200, message: "Cart updated successfully.", data: findCart });
                } else {
                        return res.status(404).json({ status: 404, message: "Cart not found." });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

exports.updateCustomizePackageInCart = async (req, res) => {
        try {
                const userData = await User.findOne({ _id: req.user._id });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const findCart = await Cart.findOne({ userId: userData._id });

                const findPackage = req.body.packageId ? await Package.findOne({ _id: req.body.packageId, packageType: "Customize" }).populate('services.service').populate('addOnServices.service') : null;

                if (!findPackage) {
                        return res.status(404).json({ status: 404, message: "Package not found" });
                }
                console.log("findPackage", findPackage);

                if (findCart) {
                        const existingPackage = findCart.packages.find(pkg => pkg.packageId.equals(findPackage._id));

                        if (!existingPackage) {
                                return res.status(400).json({ status: 400, message: "Package not found in the cart." });
                        }
                        console.log("123", existingPackage);

                        if (req.body.selectedServices && req.body.selectedServices.length !== findPackage.selectedCount) {
                                return res.status(400).json({
                                        status: 400,
                                        message: `Please select ${findPackage.selectedCount} services for the customized package.`,
                                });
                        }

                        if (req.body.selectedServices) {
                                existingPackage.services.forEach(service => {
                                        service.selected = req.body.selectedServices.includes(service.serviceId.toString());
                                });
                        }

                        if (req.body.selectedAddOnServices) {
                                existingPackage.addOnServices.forEach(addOnService => {
                                        addOnService.selected = req.body.selectedAddOnServices.includes(addOnService.serviceId.toString());
                                });
                        }

                        if (req.body.selectedServices.length === 0 && req.body.selectedAddOnServices.length === 0) {
                                existingPackage.total = existingPackage.price || 0;
                        } else {
                                existingPackage.total = calculateTotal(existingPackage);
                                existingPackage.total = existingPackage.price;
                        }

                        findCart.totalAmount = calculateTotalAmount(findCart);
                        findCart.paidAmount = findCart.totalAmount + findCart.additionalFee;


                        await findCart.save();
                        return res.status(200).json({ status: 200, message: "Cart updated successfully.", data: findCart });
                } else {
                        return res.status(404).json({ status: 404, message: "Cart not found." });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};

// function calculateTotal(package) {
//         let total = 0;

//         if (Array.isArray(package.services)) {
//                 total += calculateServiceTotal(package.services);
//         }

//         if (Array.isArray(package.addOnServices)) {
//                 total += calculateServiceTotal(package.addOnServices);

//         }

//         return total;
// }

// function calculateTotalAmount(cart) {
//         let totalAmount = 0;

//         for (const pkg of cart.packages) {
//                 totalAmount += pkg.total;

//         }

//         return totalAmount;
// }

// function calculateServiceTotal(services) {
//         let total = 0;

//         if (Array.isArray(services)) {
//                 for (const service of services) {
//                         if (service.selected == true) {
//                                 if (service.discountActive == true) {

//                                         total += service.discountPrice * 1;

//                                 } else {

//                                         total += service.originalPrice * 1;

//                                 }
//                         }
//                 }
//         }

//         return total;
// }

function calculateTotalAmount(cart) {
        let totalAmount = 0;

        for (const pkg of cart.packages) {
                totalAmount += pkg.total;
        }
        totalAmount += calculateServices2Total(cart.services);
        console.log("Debug: totalAmount before additionalFee", totalAmount);

        return totalAmount;
}

function calculateTotal(package) {
        let total = 0;

        total += calculateServiceTotal(package.services);
        total += calculateServiceTotal(package.addOnServices);

        console.log("Debug: package.total", total);

        return total;
}

function calculateServiceTotal(services) {
        let total = 0;

        if (Array.isArray(services)) {
                for (const service of services) {
                        if (service.selected) {
                                if (service.discountActive) {
                                        total += service.discountPrice * service.quantity;
                                } else {
                                        total += service.originalPrice * service.quantity;
                                }
                        }
                }
        }
        console.log("Total Service Price:", total);
        return total;
}

function calculateServices2Total(services) {
        let total = 0;

        if (Array.isArray(services)) {
                for (const service of services) {
                        if (service) {
                                total += service.total;
                                console.log("Service Total:", service.total);
                        }
                }
        }
        console.log("Total Service Price:", total);
        return total;
}


