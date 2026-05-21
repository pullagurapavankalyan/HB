const fs = require('fs');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const parseLocationFromLink = (link) => {
  if (!link || typeof link !== 'string') return null;
  try {
    const url = new URL(link.trim());
    let coords = null;

    const q = url.searchParams.get('q');
    if (q) {
      coords = q.split(',').map((item) => item.trim());
    }

    if (!coords || coords.length < 2) {
      const atIndex = url.pathname.indexOf('@');
      if (atIndex !== -1) {
        coords = url.pathname.slice(atIndex + 1).split(',').map((item) => item.trim());
      }
    }

    if (coords && coords.length >= 2) {
      const lat = Number(coords[0]);
      const lng = Number(coords[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return [lng, lat];
      }
    }
  } catch (err) {
    return null;
  }
  return null;
};

// @desc    Get all hotels with advanced filtering and pagination
// @route   GET /api/hotels
// @access  Public
const getHotels = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = { isActive: true };

  if (req.query.keyword) {
    const keywordRegex = { $regex: req.query.keyword.trim(), $options: 'i' };
    query.$or = [
      { hotelName: keywordRegex },
      { city: keywordRegex },
      { state: keywordRegex },
      { country: keywordRegex },
      { address: keywordRegex }
    ];
  }

  if (req.query.amenities) {
    const amenitiesArr = req.query.amenities.split(',');
    query.amenities = { $all: amenitiesArr };
  }

  if (req.query.minRating) {
    query.rating = { $gte: Number(req.query.minRating) };
  }

  if (req.query.managerId) {
    query.managerId = req.query.managerId;
  }

  let sortObj = { featured: -1, rating: -1 };
  if (req.query.sortBy === 'price_asc') {
    sortObj = { 'rooms.price': 1 };
  } else if (req.query.sortBy === 'rating_desc') {
    sortObj = { rating: -1 };
  }

  const total = await Hotel.countDocuments(query);
  let hotels = await Hotel.find(query)
    .select('-images.data')
    .skip(skip)
    .limit(limit)
    .sort(sortObj)
    .populate('rooms', 'price roomType');

  hotels = hotels.map((hotel) => {
    const hotelObj = hotel.toObject();
    if (hotelObj.images) {
      hotelObj.images = hotelObj.images.filter((img) => img.url && img.originalName);
    }
    return hotelObj;
  });

  successResponse(res, 200, 'Hotels retrieved', {
    hotels,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
const getHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id)
    .select('-images.data')
    .populate('managerId', 'name email')
    .populate('rooms')
    .populate({
      path: 'reviews',
      populate: { path: 'userId', select: 'name profileImage' }
    });

  if (!hotel) return errorResponse(res, 404, 'Hotel not found');

  const hotelObj = hotel.toObject();
  if (hotelObj.images) {
    hotelObj.images = hotelObj.images.filter((img) => img.url && img.originalName);
  }

  successResponse(res, 200, 'Hotel retrieved', hotelObj);
});

// @desc    Create a hotel
// @route   POST /api/hotels
// @access  Private/Manager
const createHotel = asyncHandler(async (req, res) => {
  // Validate required fields
  if (!req.body.hotelName || !req.body.city || !req.body.country || !req.body.address || !req.body.state || !req.body.description) {
    return errorResponse(res, 400, 'Missing required fields: hotelName, city, country, address, state, description');
  }

  let parsedData = { ...req.body, managerId: req.user._id };

  if (typeof parsedData.amenities === 'string') {
    try {
      parsedData.amenities = JSON.parse(parsedData.amenities);
    } catch (e) {
      parsedData.amenities = [];
    }
  }

  if (typeof parsedData.location === 'string') {
    try {
      parsedData.location = JSON.parse(parsedData.location);
    } catch (e) {
      parsedData.location = null;
    }
  }

  if (typeof parsedData.locationLink === 'string') {
    parsedData.locationLink = parsedData.locationLink.trim();
  }

  if (!parsedData.location || !Array.isArray(parsedData.location.coordinates) || parsedData.location.coordinates.length !== 2) {
    const coords = parseLocationFromLink(parsedData.locationLink);
    parsedData.location = {
      type: 'Point',
      coordinates: coords && coords.length === 2 ? coords : [0, 0]
    };
  }

  parsedData.rating = 0;

  if (req.files && req.files.length > 0) {
    parsedData.images = req.files.map((file) => {
      const fileBuffer = fs.readFileSync(file.path);
      return {
        url: `/uploads/${file.filename}`,
        originalName: file.originalname,
        contentType: file.mimetype,
        data: fileBuffer
      };
    });
  }

  try {
    const hotel = await Hotel.create(parsedData);
    successResponse(res, 201, 'Hotel created', hotel);
  } catch (err) {
    console.error('Hotel creation error:', err);
    return errorResponse(res, 400, err.message || 'Failed to create hotel');
  }
});

// @desc    Update a hotel
// @route   PUT /api/hotels/:id
// @access  Private/Manager
const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return errorResponse(res, 404, 'Hotel not found');

  if (hotel.managerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    return errorResponse(res, 403, 'Not authorized to update this hotel');
  }

  let updateData = { ...req.body };

  if (typeof updateData.amenities === 'string') {
    try {
      updateData.amenities = JSON.parse(updateData.amenities);
    } catch (e) {
      updateData.amenities = hotel.amenities;
    }
  }

  if (typeof updateData.location === 'string') {
    try {
      updateData.location = JSON.parse(updateData.location);
    } catch (e) {
      updateData.location = hotel.location;
    }
  }

  if (typeof updateData.locationLink === 'string') {
    updateData.locationLink = updateData.locationLink.trim();
  }

  if ((!updateData.location || !Array.isArray(updateData.location.coordinates) || updateData.location.coordinates.length !== 2) && updateData.locationLink) {
    const coords = parseLocationFromLink(updateData.locationLink);
    updateData.location = {
      type: 'Point',
      coordinates: coords || hotel.location.coordinates || [0, 0]
    };
  }

  if (req.files && req.files.length > 0) {
    updateData.images = req.files.map((file) => {
      const fileBuffer = fs.readFileSync(file.path);
      return {
        url: `/uploads/${file.filename}`,
        originalName: file.originalname,
        contentType: file.mimetype,
        data: fileBuffer
      };
    });
  }

  const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  successResponse(res, 200, 'Hotel updated', updatedHotel);
});

// @desc    Delete a hotel
// @route   DELETE /api/hotels/:id
// @access  Private/Manager
const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return errorResponse(res, 404, 'Hotel not found');

  if (hotel.managerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    return errorResponse(res, 403, 'Not authorized to delete this hotel');
  }

  await Room.deleteMany({ hotelId: hotel._id });
  await hotel.deleteOne();

  successResponse(res, 200, 'Hotel and associated rooms removed');
});

// @desc    Get hotel image from MongoDB
// @route   GET /api/hotels/:hotelId/images/:imageId
// @access  Public
const getHotelImage = asyncHandler(async (req, res) => {
  const { hotelId, imageId } = req.params;
  const hotel = await Hotel.findById(hotelId).select('images');
  if (!hotel) return errorResponse(res, 404, 'Hotel not found');

  const image = hotel.images.id(imageId);
  if (!image || !image.data || image.data.length === 0) {
    return res.redirect('https://placeholder.co/400x250?text=Image+Not+Found');
  }

  const contentType = image.contentType || 'image/jpeg';
  res.set('Content-Type', contentType);
  res.set('Content-Disposition', `inline; filename="${image.originalName || 'image'}"`);
  res.send(image.data);
});

module.exports = {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelImage
};
