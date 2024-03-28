const auth = require("../controllers/admin.controller");
const authJwt = require("../middlewares/authJwt");
var multer = require("multer");
const path = require("path");
const express = require("express");
const router = express()
const { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, BrandUpload, E4UUpload, offerUpload, charges, serviceType, subCategory, mainCategoryBannerUpload, testimonial } = require('../middlewares/imageUpload')
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
        app.post("/api/v1/admin/Brand/addBrand", [authJwt.verifyToken], BrandUpload.single('image'), auth.createBrands);
        app.get("/api/v1/admin/Brand/allBrand", auth.getBrands);
        app.put("/api/v1/admin/Brand/updateBrand/:id", [authJwt.verifyToken], BrandUpload.single('image'), auth.updateBrand);
        app.delete("/api/v1/admin/Brand/deleteBrand/:id", [authJwt.verifyToken], auth.removeBrand);
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
        app.get("/api/v1/admin/ItemSubCategory/:categoryId", auth.getItemSubCategories);
        app.put("/api/v1/admin/ItemSubCategory/update/:id", [authJwt.verifyToken], auth.updateItemSubCategory);
        app.delete("/api/v1/admin/ItemSubCategory/delete/:id", [authJwt.verifyToken], auth.removeItemSubCategory);
        app.post("/api/v1/admin/Item/createItem", [authJwt.verifyToken], auth.createItem);
        app.get("/api/v1/admin/Item/:categoryId/:itemSubCategoryId", auth.getItem);
        app.put("/api/v1/admin/Item/update/:id", [authJwt.verifyToken], auth.updateItem);
        app.delete("/api/v1/admin/Item/delete/:id", [authJwt.verifyToken], auth.removeItem);
        app.post("/api/v1/admin/Service/addService", [authJwt.verifyToken], serviceUpload.array('image'), auth.createService);
        app.put('/api/v1/admin/services/:serviceId/add-location', [authJwt.verifyToken], auth.addServiceLocation)
        app.put('/api/v1/admin/services/:serviceId/update-location/:locationId', [authJwt.verifyToken], auth.updateServiceLocation)
        app.get("/api/v1/admin/Service/:mainCategoryId/:categoryId/:subCategoryId", [authJwt.verifyToken], auth.getService);
        app.get("/api/v1/admin/Service/getAllService", [authJwt.verifyToken], auth.getAllService);
        app.get('/api/v1/admin/service/:id', [authJwt.verifyToken], auth.getServiceById);
        app.delete("/api/v1/admin/Service/delete/:id", [authJwt.verifyToken], auth.removeService);
        app.post("/api/v1/admin/Service/addPackages", [authJwt.verifyToken], serviceUpload.array('image'), auth.createPackage);
        app.put('/api/v1/admin/package/:packageId/add-location', [authJwt.verifyToken], auth.addPackageLocation)
        app.put('/api/v1/admin/package/:packageId/update-location/:locationId', [authJwt.verifyToken], auth.updatePackageLocation)
        app.get("/api/v1/admin/Package/:mainCategoryId/:categoryId/:subCategoryId", [authJwt.verifyToken], auth.getPackage);
        app.get("/api/v1/admin/Package/getAllService", [authJwt.verifyToken], auth.getAllPackage);
        app.get('/api/v1/admin/Package/:id', [authJwt.verifyToken], auth.getPackageById);
        app.delete("/api/v1/admin/Package/delete/:id", [authJwt.verifyToken], auth.removePackage);
        app.put("/api/v1/admin/Package/update/:id", [authJwt.verifyToken], auth.updatePackage);
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
        app.post('/api/v1/admin/assignItems', [authJwt.verifyToken], auth.assignItems);
        app.get('/api/v1/admin/assignItemslist', [authJwt.verifyToken], auth.assignItemslist);





        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        app.post('/api/v1/admin/createSubscription', auth.createSubscription);
        // app.get('/api/v1/admin/getSubscription/:mainCategoryId/:categoryId', auth.getSubscription);
        app.get('/api/v1/admin/getSubscription', auth.getSubscription);
        app.put("/api/v1/admin/Service/uploadService/:id", [authJwt.verifyToken], serviceUpload.array('image'), auth.updateImagesinService);
        app.get("/api/v1/admin/Service/top/:categoryId/:subCategoryId", auth.getTopSellingService);
        app.put("/api/v1/admin/Service/update/:id", [authJwt.verifyToken], auth.updateService);
        app.get('/api/v1/admin/all-leaves', [authJwt.verifyToken], auth.getAllLeaves);
        app.put('/api/v1/admin/approve-leave/:id', [authJwt.verifyToken], auth.approveLeave);
        app.put('/api/v1/admin/cancel-leave/:id', [authJwt.verifyToken], auth.cancelLeave);
        app.get('/api/v1/admin/all-sp-agreements', [authJwt.verifyToken], auth.getAllSPAgreements);
        app.get('/api/v1/admin/sp-agreements/:id', [authJwt.verifyToken], auth.getSPAgreementById);
        app.get('/api/v1/admin/all-training-videos', [authJwt.verifyToken], auth.getAllTrainingVideos);
        app.get('/api/v1/admin/training-videos/:id', [authJwt.verifyToken], auth.getTrainingVideoById);
        app.get('/api/v1/admin/all-transportation-charges', [authJwt.verifyToken], auth.getAllTransportationCharges);
        app.get('/api/v1/admin/transportation-charges/:id', [authJwt.verifyToken], auth.getTransportationChargeById);
        app.get('/api/v1/admin/referrals', [authJwt.verifyToken], auth.getAllReferrals);
        app.get('/api/v1/admin/referrals/:id', [authJwt.verifyToken], auth.getReferralById);
        app.get('/api/v1/admin/consent-forms', [authJwt.verifyToken], auth.getAllConsentForms);
        app.get('/api/v1/admin/consent-forms/:id', [authJwt.verifyToken], auth.getConsentFormById);
        app.put('/api/v1/admin/update-minimum-cart-amount', [authJwt.verifyToken], auth.updateMinimumCartAmount);
        app.post("/api/v1/admin/serviceTypes", [authJwt.verifyToken], serviceType.single('image'), auth.createServiceType);
        app.get("/api/v1/admin/serviceTypes", [authJwt.verifyToken], auth.getAllServiceTypes);
        app.get("/api/v1/admin/serviceTypes/:serviceTypeId", [authJwt.verifyToken], auth.getServiceTypeById);
        app.put("/api/v1/admin/serviceTypes/:serviceTypeId", [authJwt.verifyToken], serviceType.single('image'), auth.updateServiceType);
        app.delete("/api/v1/admin/serviceTypes/:serviceTypeId", [authJwt.verifyToken], auth.deleteServiceType);
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






}