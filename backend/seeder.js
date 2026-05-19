const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Coupon = require('./models/Coupon');
const LoyaltyAccount = require('./models/LoyaltyAccount');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-hotel-booking');
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Booking.deleteMany();
    await Room.deleteMany();
    await Review.deleteMany();
    await Hotel.deleteMany();
    await LoyaltyAccount.deleteMany();
    await Coupon.deleteMany();
    await User.deleteMany();

    // Create Admin and Managers
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@hotel.com', password, role: 'Admin' },
      { name: 'Manager John', email: 'manager1@hotel.com', password, role: 'Manager' },
      { name: 'Manager Jane', email: 'manager2@hotel.com', password, role: 'Manager' },
      { name: 'Regular Guest', email: 'guest@hotel.com', password, role: 'User' },
    ]);

    const admin = users[0]._id;
    const manager1 = users[1]._id;
    const manager2 = users[2]._id;
    const guestUser = users[3]._id;

    // Create Loyalty Account for Guest
    await LoyaltyAccount.create({ userId: guestUser, points: 500, tier: 'Silver' });

    // Create Coupons
    const coupon = await Coupon.create({
      code: 'SUMMER2026',
      discountType: 'Percentage',
      discountValue: 20,
      expiryDate: new Date('2026-12-31'),
    });

    // Create Hotels
    const hotels = await Hotel.insertMany([
      {
        hotelName: 'Grand Ocean Resort',
        description: 'A beautiful luxury resort by the ocean.',
        address: '123 Ocean Drive',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        location: { type: 'Point', coordinates: [-80.191790, 25.761680] },
        managerId: manager1,
        featured: true,
        rating: 4.8,
        reviewsCount: 1,
        images: [
          { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945', originalName: 'ocean-resort-1.jpg' }
        ],
        amenities: ['Pool', 'Spa', 'Free WiFi', 'Beachfront'],
      },
      {
        hotelName: 'Urban Boutique Hotel',
        description: 'Modern boutique hotel in the heart of the city.',
        address: '456 Downtown Ave',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        location: { type: 'Point', coordinates: [-74.005974, 40.712776] },
        managerId: manager2,
        featured: false,
        rating: 0,
        reviewsCount: 0,
        images: [
          { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', originalName: 'boutique-hotel-1.jpg' }
        ],
        amenities: ['Gym', 'Bar', 'Free WiFi'],
      },
    ]);

    // Create Rooms
    const rooms = await Room.insertMany([
      {
        hotelId: hotels[0]._id,
        roomNumber: '101',
        roomType: 'Deluxe Ocean View',
        capacity: { adults: 2, children: 1 },
        price: 350,
        amenities: ['Balcony', 'King Bed', 'Ocean View'],
      },
      {
        hotelId: hotels[0]._id,
        roomNumber: '102',
        roomType: 'Presidential Suite',
        capacity: { adults: 4, children: 2 },
        price: 1200,
        amenities: ['Private Pool', 'Butler Service', 'Ocean View'],
      },
      {
        hotelId: hotels[1]._id,
        roomNumber: '201',
        roomType: 'Standard Urban',
        capacity: { adults: 2, children: 0 },
        price: 200,
        amenities: ['City View', 'Queen Bed'],
      },
    ]);

    // Update Hotel Room references
    await Hotel.findByIdAndUpdate(hotels[0]._id, { $push: { rooms: { $each: [rooms[0]._id, rooms[1]._id] } } });
    await Hotel.findByIdAndUpdate(hotels[1]._id, { $push: { rooms: rooms[2]._id } });

    // Create a Review for the first hotel
    const review = await Review.create({
      userId: guestUser,
      hotelId: hotels[0]._id,
      rating: 5,
      comment: 'Absolutely phenomenal stay!',
    });

    await Hotel.findByIdAndUpdate(hotels[0]._id, { $push: { reviews: review._id } });

    // Create a Booking
    const booking = await Booking.create({
      userId: guestUser,
      hotelId: hotels[0]._id,
      roomId: rooms[0]._id,
      checkInDate: new Date('2026-06-01'),
      checkOutDate: new Date('2026-06-05'),
      totalAmount: 1400,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
    });

    // Add booked dates to room
    await Room.findByIdAndUpdate(rooms[0]._id, {
      $push: { bookedDates: { bookingId: booking._id, checkIn: booking.checkInDate, checkOut: booking.checkOutDate } }
    });

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Booking.deleteMany();
    await Room.deleteMany();
    await Review.deleteMany();
    await Hotel.deleteMany();
    await LoyaltyAccount.deleteMany();
    await Coupon.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
