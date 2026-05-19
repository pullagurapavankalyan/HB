const Review = require('../models/Review');
const Hotel = require('../models/Hotel');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Add review
// @route   POST /api/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { hotelId, rating, comment } = req.body;

  const existingReview = await Review.findOne({ hotelId, userId: req.user._id });
  if (existingReview) return errorResponse(res, 400, 'You have already reviewed this hotel');

  const review = await Review.create({
    hotelId,
    userId: req.user._id,
    rating: Number(rating),
    comment
  });

  // Recalculate hotel rating aggregation
  const reviews = await Review.find({ hotelId });
  const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
  const avgRating = totalRating / reviews.length;

  await Hotel.findByIdAndUpdate(hotelId, {
    $push: { reviews: review._id },
    rating: avgRating,
    reviewsCount: reviews.length
  });

  successResponse(res, 201, 'Review added successfully', review);
});

// @desc    Get hotel reviews
// @route   GET /api/reviews/hotel/:hotelId
// @access  Public
const getHotelReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ hotelId: req.params.hotelId })
    .populate('userId', 'name profileImage')
    .sort({ createdAt: -1 });

  successResponse(res, 200, 'Reviews retrieved', reviews);
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return errorResponse(res, 404, 'Review not found');

  if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    return errorResponse(res, 403, 'Not authorized');
  }

  const hotelId = review.hotelId;
  await review.deleteOne();

  // Recalculate
  const reviews = await Review.find({ hotelId });
  const avgRating = reviews.length > 0 ? reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length : 0;
  
  await Hotel.findByIdAndUpdate(hotelId, {
    $pull: { reviews: req.params.id },
    rating: avgRating,
    reviewsCount: reviews.length
  });

  successResponse(res, 200, 'Review deleted');
});

module.exports = { addReview, getHotelReviews, deleteReview };
