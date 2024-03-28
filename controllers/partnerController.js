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
const TransportationCharges = require('../models/transportationModel');
const Training = require('../models/traningVideoModel');
const ComplaintSuggestion = require('../models/complainet&suggestionModel');
const Referral = require('../models/refferalModel');
const ConsentForm = require('../models/consentFormModel');


// const rating = require('../models/ratingModel');
// const favouriteBooking = require('../models/favouriteBooking');
exports.partnerRegistration = async (req, res) => {
        try {
                const { phone } = req.body;
                const user = await User.findOne({ phone: phone, userType: "PARTNER" });
                if (!user) {
                        req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        req.body.accountVerification = false;
                        req.body.userType = "PARTNER";
                        const userCreate = await User.create(req.body);
                        return res.status(200).send({ status: 200, message: "Partner signup successfully.", data: userCreate, });
                } else {
                        return res.status(409).send({ status: 409, msg: "Already Exit" });
                }
        } catch (error) {
                console.log(error);
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
                        return res.status(400).json({ message: "Invalid OTP" });
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
exports.changePassword = async (req, res) => {
        try {
                const data = await User.findOne({ _id: req.user._id, });
                if (data) {
                        if (req.body.newPassword == req.body.confirmPassword) {
                                const updated = await User.findOneAndUpdate({ _id: data._id }, { $set: { password: bcrypt.hashSync(req.body.newPassword) } }, { new: true });
                                return res.status(200).send({ message: "Password update successfully.", data: updated, });
                        } else {
                                return res.status(501).send({ message: "Password Not matched.", data: {}, });
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.signin = async (req, res) => {
        try {
                const { email, password } = req.body;
                const user = await User.findOne({ email: email, userType: "PARTNER" });
                if (!user) {
                        return res.status(404).send({ message: "user not found ! not registered" });
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
exports.reSetPassword = async (req, res) => {
        try {
                const { phone } = req.body;
                const user = await User.findOne({ phone: phone, userType: "PARTNER" });
                if (user) {
                        req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                        req.body.otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
                        req.body.accountVerification = false;
                        const updated = await User.findOneAndUpdate({ _id: user._id }, { $set: req.body }, { new: true });
                        return res.status(200).send({ status: 200, message: "Otp send on mobile successfully.", data: updated, });
                } else {
                        return res.status(404).send({ status: 404, msg: "not Found" });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Server error" });
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

exports.createTransportationCharges = async (req, res) => {
        try {
                const { amount, reason } = req.body;

                let attachFile;

                if (req.file) {
                        attachFile = req.file ? req.file.path : "";
                }
                const transportationCharges = new TransportationCharges({
                        amount,
                        reason,
                        attachFile
                });

                const savedTransportationCharges = await transportationCharges.save();

                res.status(201).json({ status: 201, message: "created sucessfully", data: savedTransportationCharges });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create transportation charges' });
        }
};

exports.getAllTransportationCharges = async (req, res) => {
        try {
                const transportationCharges = await TransportationCharges.find();
                res.status(200).json({ status: 200, message: "data retrived sucessfully", data: transportationCharges });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch transportation charges' });
        }
};

exports.getTransportationChargesById = async (req, res) => {
        const transportationId = req.params.id;

        try {
                const transportationCharges = await TransportationCharges.findById(transportationId);
                if (!transportationCharges) {
                        return res.status(404).json({ message: 'Transportation Charges not found' });
                }
                res.json({ tatus: 200, message: "transportation Chasrges data retrived sucessfully", data: transportationCharges });
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to get Transportation Charges' });
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