const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get rooms by hotel ID with availability check
// @route   GET /api/rooms/hotel/:hotelId
// @access  Public
const getHotelRooms = asyncHandler(async (req, res) => {
  const { checkIn, checkOut } = req.query;
  let query = { hotelId: req.params.hotelId };

  // If dates are provided, filter out rooms booked in that range
  if (checkIn && checkOut) {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    query.bookedDates = {
      $not: {
        $elemMatch: {
          $or: [
            { checkIn: { $lt: outDate }, checkOut: { $gt: inDate } }
          ]
        }
      }
    };
  }

  const rooms = await Room.find(query);
  successResponse(res, 200, 'Rooms retrieved', rooms);
});

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private/Manager
const createRoom = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.body.hotelId);
  if (!hotel) return errorResponse(res, 404, 'Hotel not found');

  if (hotel.managerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    return errorResponse(res, 403, 'Not authorized to add rooms to this hotel');
  }

  const room = await Room.create(req.body);
  await Hotel.findByIdAndUpdate(hotel._id, { $push: { rooms: room._id } });

  successResponse(res, 201, 'Room created', room);
});

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private/Manager
const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('hotelId');
  if (!room) return errorResponse(res, 404, 'Room not found');

  if (room.hotelId.managerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    return errorResponse(res, 403, 'Not authorized to update this room');
  }

  const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  successResponse(res, 200, 'Room updated', updatedRoom);
});

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Manager
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('hotelId');
  if (!room) return errorResponse(res, 404, 'Room not found');

  if (room.hotelId.managerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    return errorResponse(res, 403, 'Not authorized to delete this room');
  }

  await Hotel.findByIdAndUpdate(room.hotelId._id, { $pull: { rooms: room._id } });
  await room.deleteOne();

  successResponse(res, 200, 'Room deleted');
});

module.exports = { getHotelRooms, createRoom, updateRoom, deleteRoom };
