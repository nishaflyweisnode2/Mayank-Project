const auth = require("../controllers/partnerController");
const leaveController = require('../controllers/leavesController');
const HelpLines = require('../controllers/helpLinesController');

const authJwt = require("../middlewares/authJwt");
const { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, userProfileUpload, spAgreementUpload, transportationCharges, complaintSuggestion } = require('../middlewares/imageUpload')
const express = require("express");
const app = express()
module.exports = (app) => {
        app.post("/api/v1/partner/registration", [authJwt.verifyToken], auth.registration);
        app.post("/api/v1/partner/socialLogin", auth.socialLogin);
        app.post("/api/v1/partner/loginWithPhone", auth.loginWithPhone);
        app.post("/api/v1/partner/:id", auth.verifyOtp);
        app.post("/api/v1/partner/resendOtp/:id", auth.resendOTP);
        app.get("/api/v1/partner/getProfile", [authJwt.verifyToken], auth.getProfile);
        app.put("/api/v1/partner/updateProfile", [authJwt.verifyToken], userProfileUpload.single('image'), auth.updateProfile);
        app.put("/api/v1/partner/updateLocation", [authJwt.verifyToken], auth.updateLocation);
        app.post("/api/v1/partner/address/new", [authJwt.verifyToken], auth.createAddress);
        app.get("/api/v1/partner/getAddress", [authJwt.verifyToken], auth.getallAddress);
        app.put("/api/v1/partner/address/:id", [authJwt.verifyToken], auth.updateAddress)
        app.delete('/api/v1/partner/address/:id', [authJwt.verifyToken], auth.deleteAddress);
        app.get('/api/v1/partner/address/:id', [authJwt.verifyToken], auth.getAddressbyId);
        app.get('/api/v1/partner/getAllOrders', [authJwt.verifyToken], auth.getAllOrders);
        app.get('/api/v1/partner/getTodayOrders', [authJwt.verifyToken], auth.getTodayOrders);
        app.get('/api/v1/partner/getTomorrowOrders', [authJwt.verifyToken], auth.getTomorrowOrders);
        app.get('/api/v1/partner/orders/:id', [authJwt.verifyToken], auth.getOrderById);
        app.post('/api/v1/partner-leaves', [authJwt.verifyToken], leaveController.createLeave);
        app.get('/api/v1/partner/leaves', [authJwt.verifyToken], leaveController.getAllLeaves);
        app.get('/api/v1/partner/leaves/:id', [authJwt.verifyToken], leaveController.getLeaveById);
        app.post("/api/v1/partner/help/contact", [authJwt.verifyToken], HelpLines.createHelpLine);
        app.get("/api/v1/partner/help/contact", [authJwt.verifyToken], HelpLines.getAllHelpLines);
        app.post('/api/v1/partner-sp-agreements', authJwt.verifyToken, spAgreementUpload.fields([
                { name: 'photo', maxCount: 1 },
                { name: 'agreementDocument', maxCount: 1 },
                { name: 'aadharFrontImage', maxCount: 1 },
                { name: 'aadharBackImage', maxCount: 1 },
                { name: 'panCardImage', maxCount: 1 }
        ]), auth.createSPAgreement);
        app.get('/api/v1/partner-sp-agreements', authJwt.verifyToken, auth.getAllSPAgreements);
        app.get('/api/v1/partner-sp-agreements/:id', authJwt.verifyToken, auth.getSPAgreementById);
        app.put('/api/v1/partner-sp-agreements/:id', authJwt.verifyToken, spAgreementUpload.fields([
                { name: 'photo', maxCount: 1 },
                { name: 'agreementDocument', maxCount: 1 },
                { name: 'aadharFrontImage', maxCount: 1 },
                { name: 'aadharBackImage', maxCount: 1 },
                { name: 'panCardImage', maxCount: 1 }
        ]), auth.updateSPAgreement);
        app.post('/api/v1/partner-transportation-charges', [authJwt.verifyToken], transportationCharges.single("attachFile"), auth.createTransportationCharges);
        app.get('/api/v1/partner-transportation-charges', [authJwt.verifyToken], auth.getAllTransportationCharges);
        app.get('/api/v1/partner-transportation-charges/:id', authJwt.verifyToken, auth.getTransportationChargesById);
        app.post('/api/v1/partner-trainings', [authJwt.verifyToken], auth.createTraining);
        app.get('/api/v1/partner/trainings', [authJwt.verifyToken], auth.getAllTrainings);
        app.post('/api/v1/partner-complaints-suggestions', [authJwt.verifyToken], complaintSuggestion.fields([
                { name: 'complaintAudio', maxCount: 1 },
                { name: 'suggestionAudio', maxCount: 1 }
        ]), auth.createComplaintSuggestion);
        app.get('/api/v1/partner/complaint-suggestiion', [authJwt.verifyToken], auth.getAllComplaintSuggestions);
        app.post('/api/v1/partner-create-referral', authJwt.verifyToken, auth.createReferral);
        app.post('/api/v1/partner/consent/forms', [authJwt.verifyToken], auth.createConsentForm);



}