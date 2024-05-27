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
const OnboardingDetails = require('../models/onBoardingMode');
const qr = require('qrcode');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const ContactDetail = require("../models/ContactDetail");
const MainCategory = require("../models/category/mainCategory");
const Team = require('../models/teamModel');
const ApprovalRequest = require('../models/teamApprovalModel');




// Configure Cloudinary with your credentials
cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_KEY,
        api_secret: process.env.CLOUD_SECRET,
});
const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
const idCode = async () => {
        var digits = "0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 10)];
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
                        const referralCode = await idCode();
                        const firstName = data.fullName.trim().split(' ')[0];


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
                                role: req.body.role || data.role,
                                providerCode: firstName + (await referralCode)
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
                        const existingRecord = await Attendance.findOne({ userId: userData._id, date: todayDate, mainCategoryId: userData.currentRole });
                        if (existingRecord) {
                                console.log(`Attendance record already exists for user ${userData._id}`);
                                continue;
                        }

                        const slots = await Slot.find();
                        const attendanceRecord = new Attendance({
                                userId: userData._id,
                                mainCategoryId: userData.currentRole,
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
exports.updatePoliceVerificationDocuments = async (req, res) => {
        try {
                const userId = req.user._id;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                let existingDetails = await OnboardingDetails.findOne({ userId: userId });

                if (!existingDetails) {
                        existingDetails = new OnboardingDetails({ userId: userId });
                }

                if (req.file) {
                        existingDetails.policeVerification = req.file.path;
                        existingDetails.isPoliceVerificationUpload = true;
                }

                const updatedDetails = await existingDetails.save();

                return res.status(200).json({ status: 200, message: 'Onboarding Details police Verification documents updated successfully', data: updatedDetails });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
        }
};
exports.updateCertificateDocuments = async (req, res) => {
        try {
                const userId = req.user._id;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                let existingDetails = await OnboardingDetails.findOne({ userId: userId });

                if (!existingDetails) {
                        existingDetails = new OnboardingDetails({ userId: userId });
                }
                let certificateDocument = [];
                if (req.files) {
                        certificateDocument = req.files.map(file => ({ img: file.path }));
                }

                existingDetails.certificateDocument = certificateDocument;
                existingDetails.isCertificateDocumentUpload = true;

                const updatedDetails = await existingDetails.save();

                return res.status(200).json({ status: 200, message: 'Onboarding Details Certificate documents updated successfully', data: updatedDetails });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
        }
};
exports.updateAddressProof = async (req, res) => {
        try {
                const userId = req.user._id;
                const { name, email, yourAddress, mobileNumber, pincode, city, state, district, alternateMobileNumber } = req.body;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                let existingDetails = await OnboardingDetails.findOne({ userId: userId });

                if (!existingDetails) {
                        existingDetails = new OnboardingDetails({ userId: userId });
                }

                if (req.files['officeAddressProof']) {
                        let dlFront = req.files['officeAddressProof'];
                        existingDetails.addressProof.officeAddressProof = dlFront[0].path;
                        existingDetails.addressProof.isUploadAddress = true;
                }
                if (req.files['electricBillProof']) {
                        let dlBack = req.files['electricBillProof'];
                        existingDetails.addressProof.electricBillProof = dlBack[0].path;
                        existingDetails.addressProof.isUploadAddress = true;
                }

                console.log("existingDetails.addressProof.officeAddressProof", existingDetails.addressProof.officeAddressProof);
                if (name) existingDetails.addressProof.name = name;
                if (email) existingDetails.addressProof.email = email;
                if (yourAddress) existingDetails.addressProof.yourAddress = yourAddress;
                if (mobileNumber) existingDetails.addressProof.mobileNumber = mobileNumber;
                if (pincode) existingDetails.addressProof.pincode = pincode;
                if (city) existingDetails.addressProof.city = city;
                if (state) existingDetails.addressProof.state = state;
                if (district) existingDetails.addressProof.district = district;
                if (alternateMobileNumber) existingDetails.addressProof.alternateMobileNumber = alternateMobileNumber;

                existingDetails.addressProof.isUploadAddress = true;

                const updatedCar = await existingDetails.save();

                return res.status(200).json({ status: 200, message: 'Address proof details updated successfully', data: updatedCar });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, error: 'Internal Server Error' });
        }
};
exports.updateAadharDetails = async (req, res) => {
        try {
                const userId = req.user._id;
                const { aadharNumber } = req.body;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                let existingDetails = await OnboardingDetails.findOne({ userId: userId });

                if (!existingDetails) {
                        existingDetails = new OnboardingDetails({ userId: userId });
                }

                if (req.files['aadharFrontImage']) {
                        let aadharFrontImage = req.files['aadharFrontImage'];
                        existingDetails.aadharFrontImage = aadharFrontImage[0].path;
                        existingDetails.isAadharCardUpload = true;
                }
                if (req.files['aadharBackImage']) {
                        let aadharBackImage = req.files['aadharBackImage'];
                        existingDetails.aadharBackImage = aadharBackImage[0].path;
                        existingDetails.isAadharCardUpload = true;
                }

                existingDetails.aadharOtp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                existingDetails.aadharNumber = aadharNumber;

                const updatedCar = await existingDetails.save();

                return res.status(200).json({ status: 200, message: 'aadhaar details updated successfully', data: updatedCar });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, error: 'Internal Server Error' });
        }
};
exports.updatePancardDocuments = async (req, res) => {
        try {
                const userId = req.user._id;
                const { panNumber } = req.body;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                let existingDetails = await OnboardingDetails.findOne({ userId: userId });

                if (!existingDetails) {
                        existingDetails = new OnboardingDetails({ userId: userId });
                }

                if (req.file) {
                        existingDetails.panCardImage = req.file.path;
                        existingDetails.isPanCardUpload = true;
                }
                existingDetails.panNumber = panNumber;

                const updatedDetails = await existingDetails.save();

                return res.status(200).json({ status: 200, message: 'Onboarding Details PanCard documents updated successfully', data: updatedDetails });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
        }
};
exports.updateBankDetails = async (req, res) => {
        try {
                const userId = req.user._id;
                const { bankName, accountNumber, reAccountNumber, accountHolderName, ifscCode } = req.body;

                const userData = await User.findOne({ _id: userId });
                if (!userData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                }

                let existingDetails = await OnboardingDetails.findOne({ userId: userId });

                if (!existingDetails) {
                        existingDetails = new OnboardingDetails({ userId: userId });
                }

                if (req.file) {
                        existingDetails.bankDetails.cheque = req.file.path;
                        existingDetails.bankDetails.isUploadbankDetails = true;
                }

                if (bankName) existingDetails.bankDetails.bankName = bankName;
                if (accountNumber) existingDetails.bankDetails.accountNumber = accountNumber;
                if (reAccountNumber) existingDetails.bankDetails.reAccountNumber = reAccountNumber;
                if (accountHolderName) existingDetails.bankDetails.accountHolderName = accountHolderName;
                if (ifscCode) existingDetails.bankDetails.ifscCode = ifscCode;

                existingDetails.bankDetails.isUploadbankDetails = true;

                const updatedCar = await existingDetails.save();

                return res.status(200).json({ status: 200, message: 'Address proof details updated successfully', data: updatedCar });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, error: 'Internal Server Error' });
        }
};
exports.approveAadharVerifyOtp = async (req, res) => {
        try {
                const partnerId = req.user._id;
                const { otp } = req.body;

                const findUser = await User.findById(partnerId);
                if (!findUser) {
                        return res.status(404).json({ status: 404, message: 'User not found' });
                }

                let existingDetails = await OnboardingDetails.findOne({ userId: partnerId });

                if (!existingDetails) {
                        return res.status(400).json({ status: 400, message: "not fount" });
                }
                if (existingDetails.aadharOtp !== otp) {
                        return res.status(400).json({ status: 400, message: "Invalid OTP" });
                }
                await existingDetails.save();

                return res.status(200).send({ status: 200, message: "OTP verified successfully", data: existingDetails });
        } catch (err) {
                console.error(err.message);
                return res.status(500).send({ error: "Internal server error" + err.message });
        }
};
exports.approveAadharResendOTP = async (req, res) => {
        try {
                const partnerId = req.user._id;
                const user = await User.findById(partnerId);
                if (!user) {
                        return res.status(404).json({ status: 404, message: 'User not found' });
                }

                const otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false });

                let existingDetails = await OnboardingDetails.findOne({ userId: partnerId });

                if (!existingDetails) {
                        return res.status(400).json({ status: 400, message: "not fount" });
                }
                existingDetails.aadharOtp = otp;
                await existingDetails.save();

                return res.status(200).send({ status: 200, message: "OTP resent", data: existingDetails });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.switchRole = async (req, res) => {
        try {
                const partnerId = req.user._id;
                const roleId = req.params.roleId;

                const user = await User.findById(partnerId).populate('role');
                if (!user) {
                        return res.status(404).json({ message: 'User not found' });
                }

                let roleIndex = -1;
                for (let i = 0; i < user.role.length; i++) {
                        if (user.role[i]._id.toString() === roleId) {
                                roleIndex = i;
                                break;
                        }
                }

                if (roleIndex === -1) {
                        return res.status(404).json({ message: 'Role not found for this user' });
                }

                user.currentRole = roleId;
                await user.save();

                return res.status(200).json({ message: 'User role switched successfully', data: user });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
        }
};
exports.getCurrentRole = async (req, res) => {
        try {
                const partnerId = req.user._id;

                const user = await User.findById(partnerId).populate('role currentRole');
                if (!user) {
                        return res.status(404).json({ message: 'User not found' });
                }

                const currentRoleId = user.currentRole;

                return res.status(200).json({ message: 'Current role retrieved successfully', currentRoleId });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
        }
};
exports.getIdCard = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id }).populate('city sector currentRole occupation role');
                if (!data) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                const userData = data.toJSON();

                const qrCodeData = JSON.stringify(userData);

                const qrCodePath = `qr_codes/user_${data._id}.png`;
                await qr.toFile(qrCodePath, qrCodeData);
                console.log("qrCodePath", qrCodePath);
                const cloudinaryUploadResponse = await cloudinary.uploader.upload(qrCodePath, {
                        folder: 'QrCode',
                        resource_type: 'raw'
                });

                userData.qrCodePath = cloudinaryUploadResponse.secure_url;

                await User.findByIdAndUpdate(data._id, { qrCodePath: userData.qrCodePath });

                fs.unlinkSync(qrCodePath);

                return res.status(200).json({ status: 200, message: "get IdCard", data: userData });
        } catch (error) {
                console.log(error);
                return res.status(500).send({ status: 500, message: "Server error.", data: {} });
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
exports.createReferral = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id });
                const { referredName, referredMobile, referredOccupation } = req.body;

                if (!data) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                if (referredOccupation) {
                        const validOccupations = await MainCategory.find({ _id: { $in: referredOccupation } });
                        if (validOccupations.length !== referredOccupation.length) {
                                return res.status(400).json({ status: 400, message: "Invalid referredOccupation IDs" });
                        }
                }

                const referral = new Referral({
                        referrer: data._id,
                        referredName,
                        referredMobile,
                        referredOccupation,

                });

                const savedReferral = await referral.save();

                res.status(201).json({ success: true, message: 'Referral created successfully', data: savedReferral });
        } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: 'Failed to create referral' });
        }
};
exports.createTeam = async (req, res) => {
        try {
                const userId = req.user._id;
                const { name, teamMemberIds } = req.body;

                const user = await User.findOne({ _id: userId });
                if (!user) {
                        return res.status(404).json({ status: 404, message: "User not found", data: {} });
                }

                const existingTeams = await Team.countDocuments({ teamLeader: userId });
                if (existingTeams >= 3) {
                        return res.status(400).json({ status: 400, message: "You can only create up to three teams.", data: {} });
                }

                if (teamMemberIds.length > 3) {
                        return res.status(400).json({ status: 400, message: "You can only add up to three members per team.", data: {} });
                }

                const team = new Team({
                        name,
                        teamLeader: userId,
                        teamMembers: []
                });

                await team.save();

                for (const memberId of teamMemberIds) {
                        const approvalRequest = new ApprovalRequest({
                                teamId: team._id,
                                requesterId: userId,
                                memberId: memberId
                        });
                        await approvalRequest.save();
                }

                return res.status(201).json({ status: 201, message: 'Team created successfully. Approval requests sent.', data: team });
        } catch (error) {
                return res.status(500).json({ status: 500, message: error.message });
        }
};
exports.getAllTeams = async (req, res) => {
        try {
                const userId = req.user._id

                const user = await User.findOne({ _id: userId });
                if (!user) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }

                const teams = await Team.find({ teamLeader: userId }).populate('teamLeader').populate('teamMembers');

                return res.status(200).json({ status: 200, data: teams });
        } catch (error) {
                return res.status(500).json({ status: 500, message: error.message });
        }
};
exports.getTeamsById = async (req, res) => {
        try {
                const { id } = req.params;

                const teams = await Team.findById(id).populate('teamLeader').populate('teamMembers');
                return res.status(200).json({ status: 200, data: teams });
        } catch (error) {
                return res.status(500).json({ status: 500, message: error.message });
        }
};
exports.updateTeam = async (req, res) => {
        try {
                const { id } = req.params;
                const userId = req.user._id

                const { name, teamMemberIds } = req.body;

                const user = await User.findOne({ _id: userId });
                if (!user) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }

                const team = await Team.findById(id);
                if (!team) {
                        return res.status(404).json({ status: 'error', message: 'Team not found' });
                }

                team.teamLeader = userId;

                if (teamMemberIds) {
                        const teamMembers = await User.find({ _id: { $in: teamMemberIds } });
                        team.teamMembers = teamMembers.map(member => member._id);
                }

                if (name) {
                        team.name = name;
                }

                await team.save();
                return res.status(200).json({ status: 200, message: 'Team updated successfully', data: team });
        } catch (error) {
                return res.status(500).json({ status: 500, message: error.message });
        }
};
exports.deleteTeam = async (req, res) => {
        try {
                const { id } = req.params;
                const team = await Team.findByIdAndDelete(id);
                if (!team) {
                        return res.status(404).json({ status: 'error', message: 'Team not found' });
                }
                return res.status(200).json({ status: 200, message: 'Team deleted successfully' });
        } catch (error) {
                return res.status(500).json({ status: 500, message: error.message });
        }
};
exports.addTeamMember = async (req, res) => {
        try {
                const userId = req.user._id;
                const { teamId, memberId } = req.body;

                const team = await Team.findOne({ _id: teamId, teamLeader: userId });

                if (!team) {
                        return res.status(404).json({ status: 404, message: "Team not found or you are not authorized to edit this team.", data: {} });
                }

                const member = await User.findById(memberId);
                if (!member) {
                        return res.status(404).json({ status: 404, message: "User to be added not found.", data: {} });
                }

                if (team.teamMembers.includes(memberId)) {
                        return res.status(400).json({ status: 400, message: "User is already a team member.", data: {} });
                }

                if (team.teamMembers.length >= 3) {
                        return res.status(400).json({ status: 400, message: "You can only add up to three members per team.", data: {} });
                }

                const approvalRequest = new ApprovalRequest({
                        teamId: team._id,
                        requesterId: userId,
                        memberId: memberId,
                        status: 'Pending'
                });
                await approvalRequest.save();

                return res.status(200).json({ status: 200, message: 'Approval request sent successfully', data: approvalRequest });
        } catch (error) {
                return res.status(500).json({ status: 500, message: error.message });
        }
};
exports.removeTeamMember = async (req, res) => {
        try {
                const userId = req.user._id;
                const { teamId, memberId } = req.body;

                const user = await User.findOne({ _id: userId });
                if (!user) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }

                const team = await Team.findOne({ _id: teamId, teamLeader: userId });

                if (!team) {
                        return res.status(404).json({ status: 404, message: "Team not found or you are not authorized to edit this team.", data: {} });
                }

                team.teamMembers = team.teamMembers.filter(member => member.toString() !== memberId);

                await team.save();

                return res.status(200).json({ status: 200, message: 'Team member removed successfully', data: team });
        } catch (error) {
                return res.status(500).json({ status: 500, message: error.message });
        }
};
exports.getApprovalRequestsByUser = async (req, res) => {
        try {
                const userId = req.user._id;

                const user = await User.findOne({ _id: userId });
                if (!user) {
                        return res.status(404).json({ status: 404, message: "User not found", data: {} });
                }

                const approvalRequests = await ApprovalRequest.find({ memberId: userId, status: 'Pending' })
                        .populate('teamId', 'name')
                        .populate('requesterId', 'name');

                if (!approvalRequests.length) {
                        return res.status(404).json({ status: 404, message: "No pending approval requests found", data: [] });
                }

                return res.status(200).json({ status: 200, message: 'Pending approval requests retrieved successfully', data: approvalRequests });
        } catch (error) {
                return res.status(500).json({ status: 500, message: error.message });
        }
};
exports.acceptApprovalRequest = async (req, res) => {
        try {
                const userId = req.user._id;
                const { requestId } = req.body;

                const user = await User.findOne({ _id: userId });
                if (!user) {
                        return res.status(404).json({ status: 404, message: "User not found", data: {} });
                }

                const approvalRequest = await ApprovalRequest.findOne({ _id: requestId, memberId: userId });
                if (!approvalRequest) {
                        return res.status(404).json({ status: 404, message: "Approval request not found", data: {} });
                }

                approvalRequest.status = 'Accepted';
                await approvalRequest.save();

                const team = await Team.findById(approvalRequest.teamId);
                team.teamMembers.push(userId);
                await team.save();

                return res.status(200).json({ status: 200, message: 'Approval request accepted. You have been added to the team.', data: team });
        } catch (error) {
                return res.status(500).json({ status: 500, message: error.message });
        }
};
exports.declineApprovalRequest = async (req, res) => {
        try {
                const userId = req.user._id;
                const { requestId } = req.body;

                const user = await User.findOne({ _id: userId });
                if (!user) {
                        return res.status(404).json({ status: 404, message: "User not found", data: {} });
                }

                const approvalRequest = await ApprovalRequest.findOne({ _id: requestId, memberId: userId });
                if (!approvalRequest) {
                        return res.status(404).json({ status: 404, message: "Approval request not found", data: {} });
                }

                approvalRequest.status = 'Declined';
                await approvalRequest.save();

                return res.status(200).json({ status: 200, message: 'Approval request declined.', data: {} });
        } catch (error) {
                return res.status(500).json({ status: 500, message: error.message });
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