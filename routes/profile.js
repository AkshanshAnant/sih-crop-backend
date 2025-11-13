// routes/profile.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import farmerProfile from '../models/FarmerProfile.js';

const router = express.Router();

// @route   GET /api/profile
// @desc    Get the authenticated user's profile details
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const profile = await farmerProfile.findOne({ userId: req.user.id }).populate('userId', 'username email');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/profile
// @desc    Create or update a user profile
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { location, preferredCrop, farmSizeAcres } = req.body;
  const profileFields = {
    userId: req.user.id,
    location,
    preferredCrop,
    farmSizeAcres,
  };
  

  try {
    let profile = await farmerProfile.findOne({ userId: req.user.id });
    if (profile) {
      // Update existing profile
      profile = await farmerProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json({ message: 'Profile updated successfully', profile });
    }
    // Create new profile
    profile = new farmerProfile(profileFields);
    await profile.save();
    res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

router.put('/', authMiddleware, async (req, res) => {
  const { location, preferredCrop, farmSizeAcres } = req.body;

  // Build the profileFields object with only the fields provided in the request body
  const profileFields = {};
  if (location) profileFields.location = location;
  if (preferredCrop) profileFields.preferredCrop = preferredCrop;
  if (farmSizeAcres) profileFields.farmSizeAcres = farmSizeAcres;

  try {
    let profile = await farmerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update the existing profile
    profile = await farmerProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: profileFields },
      { new: true }
    );

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


export default router;