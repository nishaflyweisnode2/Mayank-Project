const bcrypt = require("bcryptjs");
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
const SPAgreement = require('../models/spAgreementModel');
const Training = require('../models/traningVideoModel');
const ComplaintSuggestion = require('../models/complainet&suggestionModel');
const Referral = require('../models/refferalModel');
const ConsentForm = require('../models/consentFormModel');
const Attendance = require('../models/attendanceModel');
const Slot = require('../models/SlotModel');



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
                                req.body.pincode = req.body.pincode;
                                req.body.month = req.body.month;
                                req.body.year = req.body.year;
                                req.body.occupation = req.body.occupation;
                                req.body.phone = req.body.phone;

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
                                        req.body.userType = "PARTNER";
                                        req.body.refferalCode = await reffralCode();
                                        req.body.refferUserId = findUser._id;
                                        req.body.completeProfile = true;
                                        req.body.pincode = req.body.pincode;
                                        req.body.month = req.body.month;
                                        req.body.year = req.body.year;
                                        req.body.occupation = req.body.occupation;
                                        req.body.phone = req.body.phone;

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
                const user = await User.findOne({ $and: [{ $or: [{ email }, { phone }] }, { userType: "PARTNER" }] });
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
                        const newUser = await User.create({ firstName, lastName, phone, email, refferalCode, userType: "PARTNER" });
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

                const user = await User.findOne({ phone: phone, userType: "PARTNER" });
                if (!user) {
                        let otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        // let otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        let otpExpiration = new Date(Date.now() + 30 * 1000);
                        let accountVerification = false;
                        const newUser = await User.create({ phone: phone, otp, otpExpiration, accountVerification, userType: "PARTNER" });
                        let obj = { id: newUser._id, otp: newUser.otp, phone: newUser.phone }
                        return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
                } else {
                        const userObj = {};
                        userObj.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        // userObj.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        userObj.otpExpiration = Date.now() + 30 * 1000;
                        userObj.accountVerification = false;
                        const updated = await User.findOneAndUpdate({ phone: phone, userType: "PARTNER" }, userObj, { new: true, });
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
                                alternatePhone: req.body.alternatePhone || data.alternatePhone1,
                                dob: req.body.dob || data.dob,
                                address1: req.body.address1 || data.address1,
                                address2: req.body.address2 || data.address2,
                                image: image || data.image,
                                role: req.body.role || data.role
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
async function createAttendanceRecord() {
        try {
                const usersData = await User.find({ userType: "PARTNER" });
                if (!usersData || usersData.length === 0) {
                        console.log("No users found");
                        return;
                }

                const todayDate = new Date().toISOString().split('T')[0];

                for (const userData of usersData) {
                        const existingRecord = await Attendance.findOne({ userId: userData._id, date: todayDate });
                        if (existingRecord) {
                                console.log(`Attendance record already exists for user ${userData._id}`);
                                continue;
                        }

                        const slots = await Slot.find();
                        const attendanceRecord = new Attendance({
                                userId: userData._id,
                                date: todayDate,
                                timeSlots: slots.map(slot => ({
                                        startTime: slot.timeFrom,
                                        endTime: slot.timeTo,
                                        available: false
                                }))
                        });

                        await attendanceRecord.save();

                        console.log(`Attendance record created for user ${userData._id}`);
                }
        } catch (error) {
                console.error(error);
                return { status: 500, message: 'Server error' };
        }
}
const intervalMinutes2 = 30;
const intervalMilliseconds2 = intervalMinutes2 * 60 * 1000;
const startInterval2 = () => {
        console.log(`Starting interval to fetch and save Attendance data every ${intervalMinutes2} minutes`);
        setInterval(async () => {
                console.log('Fetching and saving attendance data...');
                await createAttendanceRecord();
        }, intervalMilliseconds2);
};
startInterval2();

exports.getAllAttendanceRecords = async (req, res) => {
        try {
                const userId = req.user._id;
                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const attendanceRecords = await Attendance.find({ userId: userId });

                return res.status(200).json({ status: 200, data: attendanceRecords });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Server error' });
        }
};
exports.getAttendanceRecordById = async (req, res) => {
        try {
                const attendanceRecord = await Attendance.findById(req.params.id);
                if (!attendanceRecord) {
                        return res.status(404).json({ status: 404, message: 'Attendance record not found' });
                }
                return res.status(200).json({ status: 200, data: attendanceRecord });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Server error' });
        }
};
exports.markAttendance = async (req, res) => {
        try {
                const attendanceId = req.params.attendanceId;
                const { allDay, timeSlots, isMarkAttendance } = req.body;

                const attendanceRecord = await Attendance.findById(attendanceId);
                if (!attendanceRecord) {
                        return res.status(404).json({ status: 404, message: 'Attendance record not found' });
                }
                attendanceRecord.timeSlots.forEach(slot => {
                        slot.available = false;
                });

                if (allDay) {
                        attendanceRecord.timeSlots.forEach(slot => {
                                slot.available = true;
                        });
                        attendanceRecord.isMarkAttendance = isMarkAttendance || false
                } else {
                        if (!timeSlots || !Array.isArray(timeSlots)) {
                                return res.status(400).json({ status: 400, message: 'Invalid timeSlots format' });
                        }

                        for (const providedSlot of timeSlots) {
                                const foundSlot = attendanceRecord.timeSlots.find(slot =>
                                        slot.startTime === providedSlot.startTime && slot.endTime === providedSlot.endTime
                                );
                                if (foundSlot) {
                                        foundSlot.available = providedSlot.available;
                                }
                        }
                        attendanceRecord.isMarkAttendance = isMarkAttendance || false
                }

                await attendanceRecord.save();
                return res.status(200).json({ status: 200, message: 'Attendance marked successfully', data: attendanceRecord });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Server error' });
        }
};
exports.enableLockScreenPassword = async (req, res) => {
        try {
                const { lockScreenPassword } = req.body;

                const userId = req.user._id;
                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                userData.lockScreenPassword = lockScreenPassword;
                userData.isLockScreenPassword = true;
                await userData.save();

                return res.json({ status: 200, message: 'Lock screen password enabled successfully', data: userData });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, error: 'Failed to enable lock screen password' });
        }
};
exports.disableLockScreenPassword = async (req, res) => {
        try {
                const userId = req.user._id;
                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                userData.lockScreenPassword = null;
                userData.isLockScreenPassword = false;
                await userData.save();

                return res.json({ status: 200, message: 'Lock screen password disabled successfully', data: userData });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, error: 'Failed to disable lock screen password' });
        }
};




























exports.getTodayOrders = async (req, res) => {
        try {
                const data = await orderModel.find({ partnerId: req.user._id, Date: { $gte: fromDate }, Date: { $lte: toDate } });
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
exports.getTomorrowOrders = async (req, res) => {
        try {
                const data = await orderModel.find({ partnerId: req.user._id });
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
exports.getAllOrders = async (req, res) => {
        try {
                const data = await orderModel.find({ partnerId: req.user._id });
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
exports.getOrderById = async (req, res) => {
        try {
                const orderId = req.params.id;
                const order = await orderModel.findById(orderId);

                if (!order) {
                        return res.status(404).json({ status: 404, message: "Order not found", data: {} });
                }

                return res.status(200).json({ status: 200, message: "Order found", data: order });
        } catch (error) {
                console.log(error);
                return res.status(500).send({ status: 500, message: "Server error.", data: {} });
        }
};

exports.createSPAgreement = async (req, res) => {
        try {
                const {
                        mobile,
                        email,
                        panNumber,
                        aadharNumber
                } = req.body;

                const spAgreement = new SPAgreement({
                        photo: req.files['photo'][0].path,
                        agreementDocument: req.files['agreementDocument'][0].path,
                        mobile: mobile,
                        email: email,
                        aadharNumber: aadharNumber,
                        aadharFrontImage: req.files['aadharFrontImage'][0].path,
                        aadharBackImage: req.files['aadharBackImage'][0].path,
                        panNumber: panNumber,
                        panCardImage: req.files['panCardImage'][0].path
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
                const userId = req.user._id;
                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                const spAgreements = await SPAgreement.find({ userId: userId });
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
        const spAgreementId = req.params.id;

        try {
                const {
                        mobile,
                        email,
                        panNumber,
                        aadharNumber
                } = req.body;

                const updatedSPAgreement = {
                        photo: req.files['photo'][0].path,
                        agreementDocument: req.files['agreementDocument'][0].path,
                        mobile: mobile,
                        email: email,
                        aadharNumber: aadharNumber,
                        aadharFrontImage: req.files['aadharFrontImage'][0].path,
                        aadharBackImage: req.files['aadharBackImage'][0].path,
                        panNumber: panNumber,
                        panCardImage: req.files['panCardImage'][0].path
                };

                const updatedSPAgreementResult = await SPAgreement.findByIdAndUpdate(
                        spAgreementId,
                        updatedSPAgreement,
                        { new: true }
                );

                if (!updatedSPAgreementResult) {
                        return res.status(404).json({ message: 'SP Agreement not found' });
                }

                res.json({ status: 200, message: "updated sucessfully", data: updatedSPAgreementResult });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to update SP Agreement' });
        }
};

exports.createTraining = async (req, res) => {
        try {
                const { link, description, date } = req.body;

                const training = new Training({
                        link,
                        description,
                        date
                });

                const savedTraining = await training.save();

                res.status(201).json(savedTraining);
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create training' });
        }
};

exports.getAllTrainings = async (req, res) => {
        try {
                const trainings = await Training.find();
                res.status(200).json(trainings);
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch trainings' });
        }
};

exports.createComplaintSuggestion = async (req, res) => {
        try {
                const { suggestion, complaint } = req.body;
                const createdBy = req.user.id;

                const complaintSuggestion = new ComplaintSuggestion({
                        suggestion,
                        complaint,
                        createdBy
                });

                const savedComplaintSuggestion = await complaintSuggestion.save();

                res.status(201).json(savedComplaintSuggestion);
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create complaint/suggestion' });
        }
};

exports.getAllComplaintSuggestions = async (req, res) => {
        try {
                const complaintSuggestion = await ComplaintSuggestion.find();
                res.status(200).json(complaintSuggestion);
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch trainings' });
        }
};

exports.createReferral = async (req, res) => {
        try {
                const { name, mobileNumber, city, hub, address } = req.body;

                const referral = new Referral({
                        name,
                        mobileNumber,
                        city,
                        hub,
                        address
                });

                const savedReferral = await referral.save();

                res.status(201).json({ success: true, message: 'Referral created successfully', data: savedReferral });
        } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: 'Failed to create referral' });
        }
};
exports.createConsentForm = async (req, res) => {
        try {
                const { title, description } = req.body;
                const consentForm = new ConsentForm({
                        title,
                        description,
                });
                const savedConsentForm = await consentForm.save();

                res.status(201).json(savedConsentForm);
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create consent form' });
        }
};