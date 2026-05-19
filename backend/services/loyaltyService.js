const LoyaltyAccount = require('../models/LoyaltyAccount');

/**
 * Adds points to a user's loyalty account
 */
const calculateLoyaltyPoints = async (userId, pointsToEarn, bookingId) => {
  let account = await LoyaltyAccount.findOne({ userId });
  
  if (!account) {
    account = await LoyaltyAccount.create({ userId, points: 0, tier: 'Bronze' });
  }

  account.points += pointsToEarn;
  account.history.push({
    transactionType: 'Earned',
    pointsAmount: pointsToEarn,
    bookingId,
    description: 'Points earned from booking'
  });

  await account.save();
  return account;
};

/**
 * Automatically upgrades user tier based on point threshold
 */
const upgradeTierIfNeeded = async (userId) => {
  const account = await LoyaltyAccount.findOne({ userId });
  if (!account) return;

  const totalPoints = account.points;
  let newTier = 'Bronze';

  if (totalPoints >= 10000) newTier = 'Platinum';
  else if (totalPoints >= 5000) newTier = 'Gold';
  else if (totalPoints >= 1000) newTier = 'Silver';

  if (account.tier !== newTier) {
    account.tier = newTier;
    await account.save();
    return newTier; // returning new tier triggers a notification in the controller
  }
  return null;
};

module.exports = { calculateLoyaltyPoints, upgradeTierIfNeeded };
