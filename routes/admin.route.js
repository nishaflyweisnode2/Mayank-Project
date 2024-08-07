const auth = require("../controllers/admin.controller");
const authJwt = require("../middlewares/authJwt");
var multer = require("multer");
const path = require("path");
const express = require("express");
const router = express()
const { bannerUpload, subCategoryUpload, categoryUpload, serviceUpload, BreedUpload, E4UUpload, offerUpload, charges, subCategory, mainCategoryBannerUpload, testimonial, spAgreementUpload } = require('../middlewares/imageUpload')
module.exports = (app) => {
        app.post("/api/v1/admin/registration", auth.registration);
        app.post("/api/v1/admin/login", auth.signin);
        app.put("/api/v1/admin/update", [authJwt.verifyToken], auth.update);
        app.post("/api/v1/admin/Banner/AddBanner", [authJwt.verifyToken], bannerUpload.single('image'), auth.AddBanner);
        app.get("/api/v1/admin/Banner/allBanner", auth.getBanner);
        app.get("/api/v1/admin/Banner/all/heroBanner", auth.getHeroBanner);
        app.get("/api/v1/admin/Banner/all/offerBanner", auth.getOfferBanner);
        app.get("/api/v1/admin/Banner/all/staticBanner", auth.getStaticBanner);
        app.get("/api/v1/admin/Banner/bannerByPosition", auth.getBannerByPosition);
        app.get("/api/v1/admin/Banner/getBannerForCategoryByPosition/:mainCategoryId", auth.getBannerForMainCategoryByPosition);
        app.get('/api/v1/admin/Banner/banners', auth.getBannersBySearch);
        app.put('/api/v1/admin/banners/:id/update-position', auth.updateBannerPosition);
        app.get("/api/v1/admin/Banner/getBannerById/:id", auth.getBannerById);
        app.delete("/api/v1/admin/Banner/deleteBanner/:id", [authJwt.verifyToken], auth.DeleteBanner);
        app.post('/api/v1/admin/breed', [authJwt.verifyToken], BreedUpload.single('image'), auth.createBreed);
        app.get('/api/v1/admin/breed', [authJwt.verifyToken], auth.getBreeds);
        app.get('/api/v1/admin/breed/maincategory/:id', [authJwt.verifyToken], auth.getBreedsByMaincategory);
        app.get('/api/v1/admin/breed/:id', [authJwt.verifyToken], auth.getBreedById);
        app.put('/api/v1/admin/breed/:id', [authJwt.verifyToken], BreedUpload.single('image'), auth.updateBreed);
        app.delete('/api/v1/admin/breed/:id', [authJwt.verifyToken], auth.deleteBreed);
        // app.post("/api/v1/admin/Charges/addCharges", [authJwt.verifyToken], auth.createCharge);
        app.post("/api/v1/admin/Charges/addCharges", [authJwt.verifyToken], charges.single('image'), auth.createCharge);
        app.get("/api/v1/admin/Charges/allCharges", auth.getCharges);
        app.put("/api/v1/admin/Charges/updateCharges/:id", [authJwt.verifyToken], auth.updateCharge);
        app.delete("/api/v1/admin/Charges/deleteCharges/:id", [authJwt.verifyToken], auth.removeCharge);
        app.post("/api/v1/admin/addContactDetails", [authJwt.verifyToken], auth.addContactDetails);
        app.get("/api/v1/admin/viewContactDetails", auth.viewContactDetails);
        app.post("/api/v1/admin/E4u/createE4u", [authJwt.verifyToken], E4UUpload.single('image'), auth.createE4u);
        app.get("/api/v1/admin/E4u/getE4uByType/:type", auth.getE4uByType);
        app.get("/api/v1/admin/E4u/getE4u", auth.getE4u);
        app.put("/api/v1/admin/E4u/updateE4u/:id", [authJwt.verifyToken], E4UUpload.single('image'), auth.updateE4u);
        app.delete("/api/v1/admin/E4u/removeE4u/:id", [authJwt.verifyToken], auth.removeE4u);
        app.post("/api/v1/admin/weCanhelpyou/createweCanhelpyou", [authJwt.verifyToken], auth.createweCanhelpyou);
        app.get("/api/v1/admin/weCanhelpyou/getAllweCanhelpyou/:type", auth.getAllweCanhelpyou);
        app.get("/api/v1/admin/weCanhelpyou/getweCanhelpyouById/:id", auth.getweCanhelpyouById);
        app.put("/api/v1/admin/weCanhelpyou/updateweCanhelpyou/:id", [authJwt.verifyToken], auth.updateweCanhelpyou);
        app.delete("/api/v1/admin/weCanhelpyou/deleteweCanhelpyou/:id", [authJwt.verifyToken], auth.deleteweCanhelpyou);
        app.get("/api/v1/admin/ticket/listTicket", [authJwt.verifyToken], auth.listTicket);
        app.put('/api/v1/admin/replyOnTicket/:id', [authJwt.verifyToken], auth.replyOnTicket);
        app.put('/api/v1/admin/closeTicket/:id', [authJwt.verifyToken], auth.closeTicket);
        app.post("/api/v1/admin/Coupan/addCoupan", [authJwt.verifyToken], auth.addCoupan);
        app.get("/api/v1/admin/Coupan/listCoupan", [authJwt.verifyToken], auth.listCoupan);
        app.get("/api/v1/admin/Feedback/getById/:id", auth.getById);
        app.get("/api/v1/admin/Feedback/getAllfeedback", auth.getAllfeedback);
        app.delete("/api/v1/admin/Feedback/DeleteFeedback/:id", [authJwt.verifyToken], auth.DeleteFeedback);
        app.post("/api/v1/admin/mainCategory/addCategory", [authJwt.verifyToken], categoryUpload.single('image'), auth.createMainCategory);
        app.get("/api/v1/admin/mainCategory/allCategory", auth.getMainCategories);
        app.put("/api/v1/admin/mainCategory/updateCategory/:id", [authJwt.verifyToken], categoryUpload.single('image'), auth.updateMainCategory);
        app.delete("/api/v1/admin/mainCategory/deleteCategory/:id", [authJwt.verifyToken], auth.removeMainCategory);
        app.post("/api/v1/admin/Banner/mainCategory/AddBanner", [authJwt.verifyToken], mainCategoryBannerUpload.single('image'), auth.addBannerforMainCategory);
        app.get("/api/v1/admin/Banner/mainCategory/allBanner", auth.getBannerforMainCategory);
        app.get("/api/v1/admin/Banner/mainCategoryBanner/bannerByPosition", auth.getBannerByPositionforMainCategory);
        app.get("/api/v1/admin/Banner/getBannerForCategoryByPosition/mainCategory/:mainCategoryId", auth.getBannerforMainCategoryByPosition);
        app.get("/api/v1/admin/Banner/getBannerById/mainCategory/:id", auth.getMainCategoryBannerById);
        app.get('/api/v1/admin/Banner/mainCategory/banners', auth.getMainCategoryBannersBySearch);
        app.delete("/api/v1/admin/Banner/deleteBanner/mainCategory/:id", [authJwt.verifyToken], auth.mainCategoryDeleteBanner);

        app.post("/api/v1/admin/Category/createCategory", [authJwt.verifyToken], subCategoryUpload.single('image'), auth.createCategory);
        app.get("/api/v1/admin/Category/allCategory/:mainCategoryId", auth.getCategories);
        app.get("/api/v1/admin/Category/getAllCategory", auth.getAllCategories);
        app.put("/api/v1/admin/Category/update/:id", [authJwt.verifyToken], subCategoryUpload.single('image'), auth.updateCategory);
        app.delete("/api/v1/admin/Category/delete/:id", [authJwt.verifyToken], auth.removeCategory);
        app.post("/api/v1/admin/SubCategory/createCategory", [authJwt.verifyToken], subCategory.single('image'), auth.createSubCategory);
        app.get("/api/v1/admin/SubCategory/:mainCategoryId/:categoryId", auth.getSubCategories);
        app.get("/api/v1/admin/getAllSubCategories", auth.getAllSubCategories);
        app.put("/api/v1/admin/SubCategory/update/:id", [authJwt.verifyToken], subCategory.single('image'), auth.updateSubCategory);
        app.delete("/api/v1/admin/SubCategory/delete/:id", [authJwt.verifyToken], auth.removeSubCategory);
        app.post("/api/v1/admin/ItemSubCategory/createCategory", [authJwt.verifyToken], auth.createItemSubCategory);
        app.put("/api/v1/admin/ItemSubCategory/update/:id", [authJwt.verifyToken], auth.updateItemSubCategory);
        app.delete("/api/v1/admin/ItemSubCategory/delete/:id", [authJwt.verifyToken], auth.removeItemSubCategory);
        app.post("/api/v1/admin/Item/createItem", [authJwt.verifyToken], auth.createItem);
        app.get("/api/v1/admin/Item/:categoryId/:itemSubCategoryId", auth.getItem);
        app.put("/api/v1/admin/Item/update/:id", [authJwt.verifyToken], auth.updateItem);
        app.delete("/api/v1/admin/Item/delete/:id", [authJwt.verifyToken], auth.removeItem);
        app.post("/api/v1/admin/Service/addService", [authJwt.verifyToken], serviceUpload.array('image'), auth.createService);
        app.get("/api/v1/admin/Service/:mainCategoryId/:categoryId/:subCategoryId", [authJwt.verifyToken], auth.getService);
        app.get("/api/v1/admin/Service/petsize-wise/:mainCategoryId/:categoryId/:subCategoryId", [authJwt.verifyToken], auth.getServiceWithUserPetSizeWise);
        app.get("/api/v1/admin/Service/by-petsize-wise/:mainCategoryId/:categoryId/:subCategoryId/:sizeId", [authJwt.verifyToken], auth.getServiceByUserPetSizeWise);
        app.get("/api/v1/admin/Service-without-sub/:mainCategoryId/:categoryId", [authJwt.verifyToken], auth.getServiceWithoutSubCategory);
        app.get("/api/v1/admin/Service-without-sub/petsize-wise/:mainCategoryId/:categoryId", [authJwt.verifyToken], auth.getServiceWithoutSubCategoryWithUserPetSizeWise);
        app.get("/api/v1/admin/Service-without-sub/by-petsize-wise/:mainCategoryId/:categoryId/:sizeId", [authJwt.verifyToken], auth.getServiceWithoutSubCategoryByPetSizeWise);
        app.get("/api/v1/admin/Service-with-MAinCategory/:mainCategoryId", [authJwt.verifyToken], auth.getServiceWithMainCategory);
        app.get("/api/v1/admin/Service/getAllService", [authJwt.verifyToken], auth.getAllService);
        app.get('/api/v1/admin/service/:id', [authJwt.verifyToken], auth.getServiceById);
        app.delete("/api/v1/admin/Service/delete/:id", [authJwt.verifyToken], auth.removeService);
        app.put('/api/v1/admin/services/:id/isAddOnServices', [authJwt.verifyToken], auth.updateIsAddOnServices);
        app.post("/api/v1/admin/Service/addPackages", [authJwt.verifyToken], serviceUpload.array('image'), auth.createPackage);
        app.get("/api/v1/admin/Package/:mainCategoryId/:categoryId/:subCategoryId", [authJwt.verifyToken], auth.getPackage);
        app.get("/api/v1/admin/Package-without-sub/:mainCategoryId/:categoryId", [authJwt.verifyToken], auth.getPackageithoutSubCategory);
        app.get("/api/v1/admin/Package/getAllService", [authJwt.verifyToken], auth.getAllPackage);
        app.get('/api/v1/admin/Package/:id', [authJwt.verifyToken], auth.getPackageById);
        app.delete("/api/v1/admin/Package/delete/:id", [authJwt.verifyToken], auth.removePackage);
        app.put("/api/v1/admin/Package/update/:id", [authJwt.verifyToken], serviceUpload.array('image'), auth.updatePackage);
        app.put("/api/v1/admin/Package/uploadService/:id", [authJwt.verifyToken], serviceUpload.array('image'), auth.updateImagesinPackage);
        app.post("/api/v1/admin/Offer/addOffer", [authJwt.verifyToken], offerUpload.single('image'), auth.addOffer);
        app.get("/api/v1/admin/Offer/listOffer", [authJwt.verifyToken], auth.listOffer);
        app.get("/api/v1/admin/Offer/userOffer", [authJwt.verifyToken], auth.getUserOffer);
        app.get("/api/v1/admin/Offer/OtherOffer", [authJwt.verifyToken], auth.getOtherOffer);
        app.post("/api/v1/admin/FreeService/addFreeService", [authJwt.verifyToken], auth.createFreeService);
        app.get("/api/v1/admin/FreeService/allFreeService", auth.getFreeServices);
        app.put("/api/v1/admin/FreeService/updateFreeService/:id", [authJwt.verifyToken], auth.updateFreeServices);
        app.delete("/api/v1/admin/FreeService/deleteFreeService/:id", [authJwt.verifyToken], auth.removeFreeServices);
        app.get('/api/v1/admin/getOrders', [authJwt.verifyToken], auth.getOrders);
        app.put('/api/v1/admin/assignOrder/:userId/:orderId', [authJwt.verifyToken], auth.assignOrder);





        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        app.put("/api/v1/admin/Service/uploadService/:id", [authJwt.verifyToken], serviceUpload.array('image'), auth.updateImagesinService);
        app.get("/api/v1/admin/Service/top/:categoryId/:subCategoryId", auth.getTopSellingService);
        app.put("/api/v1/admin/Service/update/:id", [authJwt.verifyToken], serviceUpload.array('image'), auth.updateService);
        app.get('/api/v1/admin/all-leaves', [authJwt.verifyToken], auth.getAllLeaves);
        app.put('/api/v1/admin/approve-leave/:id', [authJwt.verifyToken], auth.approveLeave);
        app.put('/api/v1/admin/cancel-leave/:id', [authJwt.verifyToken], auth.cancelLeave);
        app.get('/api/v1/admin/all-sp-agreements', [authJwt.verifyToken], auth.getAllSPAgreements);
        app.get('/api/v1/admin/sp-agreements/:id', [authJwt.verifyToken], auth.getSPAgreementById);
        app.get('/api/v1/admin/all-training-videos', [authJwt.verifyToken], auth.getAllTrainingVideos);
        app.get('/api/v1/admin/training-videos/:id', [authJwt.verifyToken], auth.getTrainingVideoById);
        app.get('/api/v1/admin/referrals', [authJwt.verifyToken], auth.getAllReferrals);
        app.get('/api/v1/admin/referrals/:id', [authJwt.verifyToken], auth.getReferralById);
        app.get('/api/v1/admin/consent-forms', [authJwt.verifyToken], auth.getAllConsentForms);
        app.get('/api/v1/admin/consent-forms/:id', [authJwt.verifyToken], auth.getConsentFormById);
        app.put('/api/v1/admin/update-minimum-cart-amount', [authJwt.verifyToken], auth.updateMinimumCartAmount);
        app.post("/api/v1/admin/city/cities", [authJwt.verifyToken], auth.createCity);
        app.get("/api/v1/admin/city/cities", [authJwt.verifyToken], auth.getAllCities);
        app.get("/api/v1/admin/city/cities/:id", [authJwt.verifyToken], auth.getCityById);
        app.put("/api/v1/admin/city/cities/:id", [authJwt.verifyToken], auth.updateCityById);
        app.delete("/api/v1/admin/city/cities/:id", [authJwt.verifyToken], auth.deleteCityById);
        app.post('/api/v1/admin/area/areas', [authJwt.verifyToken], auth.createArea);
        app.get('/api/v1/admin/area/areas', [authJwt.verifyToken], auth.getAllAreas);
        app.get('/api/v1/admin/area/areas/:id', [authJwt.verifyToken], auth.getAreaById);
        app.get('/api/v1/admin/areas/city/:cityId', [authJwt.verifyToken], auth.getAreasByCityId);
        app.put('/api/v1/admin/area/areas/:id', [authJwt.verifyToken], auth.updateAreaById);
        app.delete('/api/v1/admin/area/areas/:id', [authJwt.verifyToken], auth.deleteAreaById);
        app.post("/api/v1/admin-testimonial", [authJwt.verifyToken], testimonial.single('image'), auth.createTestimonial);
        app.get("/api/v1/admin/testimonial", [authJwt.verifyToken], auth.getAllTestimonials);
        app.get("/api/v1/admin/testimonial/:id", [authJwt.verifyToken], auth.getTestimonialById);
        app.put('/api/v1/admin/testimonials/:id', [authJwt.verifyToken, testimonial.single('image')], auth.updateTestimonial);
        app.delete('/api/v1/admin/testimonials/:id', authJwt.verifyToken, auth.deleteTestimonial);
        app.post('/api/v1/admin/slot', [authJwt.verifyToken], auth.createSlot);
        app.get('/api/v1/admin/slot', [authJwt.verifyToken], auth.getAllSlots);
        app.get('/api/v1/admin/slot/:id', [authJwt.verifyToken], auth.getSlotById);
        app.put('/api/v1/admin/slot/:id', [authJwt.verifyToken], auth.updateSlotById);
        app.delete('/api/v1/admin/slot/:id', [authJwt.verifyToken], auth.deleteSlotById);
        app.post('/api/v1/admin/BreedScore', [authJwt.verifyToken], auth.createBreedScore);
        app.get('/api/v1/admin/BreedScore', [authJwt.verifyToken], auth.getAllBreedScores);
        app.get('/api/v1/admin/BreedScore/:id', [authJwt.verifyToken], auth.getBreedScoreById);
        app.put('/api/v1/admin/BreedScore/:id', [authJwt.verifyToken], auth.updateBreedScoreById);
        app.delete('/api/v1/admin/BreedScore/:id', [authJwt.verifyToken], auth.deleteBreedScoreById);
        app.post('/api/v1/admin/breedAggressiveScores', [authJwt.verifyToken], auth.createBreedAggressiveScore);
        app.get('/api/v1/admin/breedAggressiveScores', [authJwt.verifyToken], auth.getAllBreedAggressiveScores);
        app.get('/api/v1/admin/breedAggressiveScores/:id', [authJwt.verifyToken], auth.getBreedAggressiveScoresById);
        app.put('/api/v1/admin/breedAggressiveScores/:id', [authJwt.verifyToken], auth.updateBreedAggressiveScore);
        app.delete('/api/v1/admin/api/v1/admin/breedAggressiveScores/:id', [authJwt.verifyToken], auth.deleteBreedAggressiveScore);
        app.post('/api/v1/admin/transport-scores', [authJwt.verifyToken], auth.createTransportScore);
        app.get('/api/v1/admin/transport-scores', [authJwt.verifyToken], auth.getAllTransportScores);
        app.get('/api/v1/admin/transport-scores/:id', [authJwt.verifyToken], auth.getTransportScoreById);
        app.put('/api/v1/admin/transport-scores/:id', [authJwt.verifyToken], auth.updateTransportScoreById);
        app.delete('/api/v1/admin/transport-scores/:id', [authJwt.verifyToken], auth.deleteTransportScoreById);
        app.post('/api/v1/admin/proximityScores', [authJwt.verifyToken], auth.createProximityScore);
        app.get('/api/v1/admin/proximityScores', [authJwt.verifyToken], auth.getAllProximityScores);
        app.get('/api/v1/admin/proximityScores/:id', [authJwt.verifyToken], auth.getProximityScoreById);
        app.put('/api/v1/admin/proximityScores/:id', [authJwt.verifyToken], auth.updateProximityScore);
        app.delete('/api/v1/admin/proximityScores/:id', [authJwt.verifyToken], auth.deleteProximityScore);
        app.post('/api/v1/admin/serviceableArea', [authJwt.verifyToken], auth.createServiceableAreaRadius);
        app.get('/api/v1/admin/serviceableArea', [authJwt.verifyToken], auth.getAllServiceableAreaRadius);
        app.get('/api/v1/admin/serviceableArea/:id', [authJwt.verifyToken], auth.getServiceableAreaRadiusById);
        app.put('/api/v1/admin/serviceableArea/:id', [authJwt.verifyToken], auth.updateServiceableAreaRadius);
        app.delete('/api/v1/admin/serviceableArea/:id', [authJwt.verifyToken], auth.deleteServiceableAreaRadius);
        app.post('/api/v1/admin/experience-scores', [authJwt.verifyToken], auth.createExperienceScore);
        app.get('/api/v1/admin/experience-scores', [authJwt.verifyToken], auth.getAllExperienceScores);
        app.get('/api/v1/admin/experience-scores/:id', [authJwt.verifyToken], auth.getExperienceScoreById);
        app.put('/api/v1/admin/experience-scores/:id', [authJwt.verifyToken], auth.updateExperienceScore);
        app.delete('/api/v1/admin/experience-scores/:id', [authJwt.verifyToken], auth.deleteExperienceScore);
        app.post('/api/v1/admin/sizes', [authJwt.verifyToken], auth.createSize);
        app.get('/api/v1/admin/sizes', [authJwt.verifyToken], auth.getAllSizes);
        app.get('/api/v1/admin/sizes/:id', [authJwt.verifyToken], auth.getSizeById);
        app.put('/api/v1/admin/sizes/:id', [authJwt.verifyToken], auth.updateSizeById);
        app.delete('/api/v1/admin/sizes/:id', [authJwt.verifyToken], auth.deleteSizeById);
        app.post('/api/v1/admin/partner-sp-agreements', authJwt.verifyToken, spAgreementUpload.fields([
                { name: 'photo', maxCount: 1 },
                { name: 'agreementDocument', maxCount: 1 },
                { name: 'aadharFrontImage', maxCount: 1 },
                { name: 'aadharBackImage', maxCount: 1 },
                { name: 'panCardImage', maxCount: 1 }
        ]), auth.createSPAgreement);
        app.get('/api/v1/admin/partner-sp-agreements', authJwt.verifyToken, auth.getAllSPAgreements);
        app.get('/api/v1/admin/partner-sp-agreements/:id', authJwt.verifyToken, auth.getSPAgreementById);
        app.put('/api/v1/admin/partner-sp-agreements/:id', authJwt.verifyToken, spAgreementUpload.fields([
                { name: 'photo', maxCount: 1 },
                { name: 'agreementDocument', maxCount: 1 },
                { name: 'aadharFrontImage', maxCount: 1 },
                { name: 'aadharBackImage', maxCount: 1 },
                { name: 'panCardImage', maxCount: 1 }
        ]), auth.updateSPAgreement);
        app.delete('/api/v1/admin/partner-sp-agreements/:id', authJwt.verifyToken, auth.deleteSPAgreementById);
        app.post('/api/v1/admin/improves', authJwt.verifyToken, auth.createImprove);
        app.get('/api/v1/admin/improves', authJwt.verifyToken, auth.getAllImprove);
        app.get('/api/v1/admin/improves/:id', authJwt.verifyToken, auth.getImproveById);
        app.put('/api/v1/admin/improves/:id', authJwt.verifyToken, auth.updateImprove);
        app.delete('/api/v1/admin/improves/:id', authJwt.verifyToken, auth.deleteImprove);
        app.post('/api/v1/admin/notifications', [authJwt.verifyToken], auth.createNotification);
        app.put('/api/v1/admin/notifications/:notificationId', [authJwt.verifyToken], auth.markNotificationAsRead);
        app.get('/api/v1/admin/notifications/user/:userId', [authJwt.verifyToken], auth.getNotificationsForUser);
        app.get('/api/v1/admin/notifications/user', [authJwt.verifyToken], auth.getAllNotificationsForUser);
        app.delete('/api/v1/admin/notifications/delete/all', [authJwt.verifyToken], auth.deleteAllNotifications);
        app.delete('/api/v1/admin/notifications/delete/:id', [authJwt.verifyToken], auth.deleteNotificationById);
        app.post('/api/v1/admin/cancelation-policy', [authJwt.verifyToken], auth.createCancelationPolicy);
        app.get('/api/v1/admin/cancelation-policy', /*[authJwt.verifyToken],*/ auth.getAllCancelationPolicy);
        app.get('/api/v1/admin/cancelation-policy/:id', [authJwt.verifyToken], auth.getCancelationPolicyById);
        app.put('/api/v1/admin/cancelation-policy/:id', [authJwt.verifyToken], auth.updateCancelationPolicyById);
        app.delete('/api/v1/admin/cancelation-policy/:id', [authJwt.verifyToken], auth.deleteCancelationPolicyById);

}