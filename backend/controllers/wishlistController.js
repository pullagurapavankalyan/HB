const Wishlist = require('../models/Wishlist');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

// @desc    Add to wishlist
// @route   POST /api/wishlist/add
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { hotelId } = req.body;
  
  let wishlist = await Wishlist.findOne({ userId: req.user._id });
  
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId: req.user._id, hotels: [hotelId] });
  } else {
    if (!wishlist.hotels.includes(hotelId)) {
      wishlist.hotels.push(hotelId);
      await wishlist.save();
    }
  }

  successResponse(res, 200, 'Added to wishlist', wishlist);
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/remove/:hotelId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { hotels: req.params.hotelId } },
    { new: true }
  );
  
  successResponse(res, 200, 'Removed from wishlist', wishlist);
});

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('hotels', 'hotelName images rating city');
  successResponse(res, 200, 'Wishlist retrieved', wishlist || { hotels: [] });
});

module.exports = { addToWishlist, removeFromWishlist, getWishlist };
