const auth = require("../controllers/userController");
const authJwt = require("../middlewares/authJwt");
const { productUpload, bannerUpload, blogUpload, aboutusUpload, subCategoryUpload, categoryUpload, serviceUpload, userProfileUpload, testimonial } = require('../middlewares/imageUpload')
const express = require("express");
const router = express()
module.exports = (app) => {
        app.post("/api/v1/user/registration", [authJwt.verifyToken], auth.registration);
        app.post("/api/v1/user/socialLogin", auth.socialLogin);
        app.post("/api/v1/user/loginWithPhone", auth.loginWithPhone);
        app.post("/api/v1/user/:id", auth.verifyOtp);
        app.post("/api/v1/user/resendOtp/:id", auth.resendOTP);
        app.get("/api/v1/user/getProfile", [authJwt.verifyToken], auth.getProfile);
        app.put("/api/v1/user/updateProfile", [authJwt.verifyToken], userProfileUpload.single('image'), auth.updateProfile);
        app.put("/api/v1/user/updateLocation", [authJwt.verifyToken], auth.updateLocation);
        app.post("/api/v1/user/address/new", [authJwt.verifyToken], auth.createAddress);
        app.get("/api/v1/user/getAddress", [authJwt.verifyToken], auth.getallAddress);
        app.put("/api/v1/user/address/:id", [authJwt.verifyToken], auth.updateAddress)
        app.delete('/api/v1/user/address/:id', [authJwt.verifyToken], auth.deleteAddress);
        app.get('/api/v1/user/address/:id', [authJwt.verifyToken], auth.getAddressbyId);
        app.get("/api/v1/user/getFreeServices", [authJwt.verifyToken], auth.getFreeServices);
        app.get("/api/v1/user/getCart", [authJwt.verifyToken], auth.getCart);
        app.get("/api/v1/user/Offer/listOffer", [authJwt.verifyToken], auth.listOffer);
        app.get("/api/v1/user/Offer/userOffer", [authJwt.verifyToken], auth.getUserOffer);
        app.post("/api/v1/user/ticket/createTicket", [authJwt.verifyToken], auth.createTicket);
        app.get("/api/v1/user/ticket/listTicket", [authJwt.verifyToken], auth.listTicket);
        app.get('/api/v1/user/ticket/:id', auth.getTicketbyId);
        app.put('/api/v1/user/replyOnTicket/:id', [authJwt.verifyToken], auth.replyOnTicket);
        // app.post("/api/v1/user/Cart/addToCart", [authJwt.verifyToken], auth.addToCart);
        app.post("/api/v1/user/Cart/addToCartSingleService", [authJwt.verifyToken], auth.addToCartSingleService);
        app.post("/api/v1/user/Cart/addToCartPackageNormal", [authJwt.verifyToken], auth.addToCartPackageNormal);
        app.post("/api/v1/user/Cart/addToCartPackageCustomise", [authJwt.verifyToken], auth.addToCartPackageCustomise);
        app.post("/api/v1/user/Cart/addToCartPackageEdit", [authJwt.verifyToken], auth.addToCartPackageEdit);
        app.post('/api/v1/user/Cart/remove-from-cart', [authJwt.verifyToken], auth.removeFromCart);
        app.post('/api/v1/user/Cart/remove-package-from-cart', [authJwt.verifyToken], auth.removePackageFromCart);
        //
        app.post('/api/v1/user/Cart/add-service', [authJwt.verifyToken], auth.addServiceToCart);
        app.put('/api/v1/user/Cart/updateQuantity', [authJwt.verifyToken], auth.updateServiceQuantity);
        app.put('/api/v1/user/Cart/packages/updateQuantity', [authJwt.verifyToken], auth.updatePackageQuantity);
        //
        app.put("/api/v1/user/Cart/provideTip", [authJwt.verifyToken], auth.provideTip);
        app.get("/api/v1/user/Coupan/listCoupan", [authJwt.verifyToken], auth.listCoupan);
        app.put("/api/v1/user/Cart/applyCoupan", [authJwt.verifyToken], auth.applyCoupan);
        app.put("/api/v1/user/Cart/applyWallet", [authJwt.verifyToken], auth.applyWallet);
        app.put("/api/v1/user/Cart/addFreeServiceToCart", [authJwt.verifyToken], auth.addFreeServiceToCart);
        app.put("/api/v1/user/Cart/addSuggestionToCart", [authJwt.verifyToken], auth.addSuggestionToCart);
        app.put("/api/v1/user/Cart/addAdressToCart/:id", [authJwt.verifyToken], auth.addAdressToCart);
        app.put("/api/v1/user/Cart/addDateAndTimeToCart", [authJwt.verifyToken], auth.addDateAndTimeToCart);
        app.put("/api/v1/user/Cart/updateDateAndTimeByOrderId", [authJwt.verifyToken], auth.updateDateAndTimeByOrderId);
        app.post("/api/v1/user/Cart/checkout", [authJwt.verifyToken], auth.checkout);
        app.post("/api/v1/user/Cart/placeOrder/:orderId", [authJwt.verifyToken], auth.placeOrder);
        app.delete('/api/v1/user/Cart/orders/:orderId', [authJwt.verifyToken], auth.deleteOrder);
        app.post("/api/v1/user/Cart/cancelOrder/:orderId", [authJwt.verifyToken], auth.cancelOrder);
        app.get('/api/v1/user/getOngoingOrders', [authJwt.verifyToken], auth.getOngoingOrders);
        app.get('/api/v1/user/getCompleteOrders', [authJwt.verifyToken], auth.getCompleteOrders);
        app.get("/api/v1/user/getOrder/:id", [authJwt.verifyToken], auth.getOrder);
        app.post("/api/v1/user/Feedback/AddFeedback", [authJwt.verifyToken], auth.AddFeedback);
        app.post("/api/v1/user/FavouriteBooking/addFavouriteBooking/:orderId", [authJwt.verifyToken], auth.addFavouriteBooking);
        app.get("/api/v1/user/FavouriteBooking/listFavouriteBooking", [authJwt.verifyToken], auth.listFavouriteBooking);
        app.get("/api/v1/user/wallet/allTransactionUser", [authJwt.verifyToken], auth.allTransactionUser);
        app.get("/api/v1/user/wallet/allcreditTransactionUser", [authJwt.verifyToken], auth.allcreditTransactionUser);
        app.get("/api/v1/user/wallet/allDebitTransactionUser", [authJwt.verifyToken], auth.allDebitTransactionUser);
        app.post('/api/v1/user/wallet/addWallet', [authJwt.verifyToken], auth.addMoney);
        app.post('/api/v1/user/wallet/removeWallet', [authJwt.verifyToken], auth.removeMoney);
        app.get('/api/v1/user/wallet/getwallet', [authJwt.verifyToken], auth.getWallet);
        app.get("/api/v1/user/testimonial", [authJwt.verifyToken], auth.getAllTestimonials);
        app.get("/api/v1/user/testimonial/:id", [authJwt.verifyToken], auth.getTestimonialById);
        app.post('/api/v1/user/rating/ratings', [authJwt.verifyToken], auth.createRating);
        app.get("/api/v1/user/allRatingsForOrder", [authJwt.verifyToken], auth.getAllRatingsForOrder);
        app.get("/api/v1/user/rating/:ratingId", [authJwt.verifyToken], auth.getRatingById);
        app.get('/api/v1/user/rating-orderRatings', [authJwt.verifyToken], auth.getRatingCountsForOrder);
        app.get('/api/v1/user/user-ratings', [authJwt.verifyToken], auth.getUserRatingsWithOrders);
        app.post('/api/v1/user/rating/maincategoryRating', [authJwt.verifyToken], auth.giveMaincategoryRating);
        app.get("/api/v1/user/allRatingsForMainCategory/:mainCategory", [authJwt.verifyToken], auth.getAllRatingsForMainCategory);
        app.get('/api/v1/user/rating-mainCategoryRatings/:categoryId', [authJwt.verifyToken], auth.getRatingCountsForMainCategory);
        app.get('/api/v1/user/rating-mainAllCategoryRatings', [authJwt.verifyToken], auth.getRatingCountsForAllMainCategory);
        app.post('/api/v1/user/comment/:_id', [authJwt.verifyToken], auth.commentOnImage);
        app.put("/api/v1/user/orders/:orderId/status", [authJwt.verifyToken], auth.updateOrderStatus);
        app.get("/api/v1/user/Category/allServices", auth.getCategoriesServices);
        app.get("/api/v1/user/Category/allPackges", auth.getCategoriesPackages);
        app.get("/api/v1/user/Category/allCategory", auth.getCategories);
        app.get('/api/v1/user/Category/search', [authJwt.verifyToken], auth.listServiceforSearch);
        app.get('/api/v1/user/frequently-added-services', [authJwt.verifyToken], auth.getFrequentlyAddedServices);
        app.post('/api/v1/user/orders/:orderId/reportIssue', [authJwt.verifyToken], auth.reportIssue);
        app.get('/api/v1/user/orders/:orderId/reportIssue', [authJwt.verifyToken], auth.getIssueReports);
        app.get('/api/v1/user/slot', [authJwt.verifyToken], auth.getAllSlots);
        app.get('/api/v1/user/slot/:id', [authJwt.verifyToken], auth.getSlotById);
        app.get('/api/v1/user/city/cities', [authJwt.verifyToken], auth.getAllCities);
        app.get('/api/v1/user/city/cities/:id', [authJwt.verifyToken], auth.getCityById);
        app.get('/api/v1/user/area/areas', [authJwt.verifyToken], auth.getAllAreas);
        app.get('/api/v1/user/area/areas/:id', [authJwt.verifyToken], auth.getAreaById);
        app.get('/api/v1/user/areas/city/:cityId', [authJwt.verifyToken], auth.getAreasByCityId);
        app.get("/api/v1/user/Banner/all/staticBanner", [authJwt.verifyToken], auth.getStaticBanner);
        app.put('/api/v1/user/updateCartPackageEdit', [authJwt.verifyToken], auth.updateEditPackageInCart);
        app.put('/api/v1/user/updateCustomizePackageInCart', [authJwt.verifyToken], auth.updateCustomizePackageInCart);


}