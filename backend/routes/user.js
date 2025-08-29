const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const AppleStrategy = require('passport-apple'); // Assuming this is still needed, though not directly used in the register flow here
const OAuth2Client = require('google-auth-library');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to authenticate a user via JWT token.
 * It checks for the token in the 'Authorization' header and verifies its validity.
 * It passes the decoded user payload to the next middleware via req.user.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If no token is provided, return a 401 Unauthorized response.
  if (token == null) {
    // The 'return' keyword is crucial here to stop execution.
    return res.status(401).json({ message: 'Authentication token required' });
  }

  // Verify the provided token using the JWT_SECRET.
  jwt.verify(token, JWT_SECRET, (err, user) => {
    // If verification fails (e.g., token is expired or invalid), return a 403 Forbidden response.
    if (err) {
      console.error('JWT verification error:', err);
      
      // THIS IS THE KEY FIX: You must use res.status().json() together.
      // res.sendStatus(403) is a shortcut that sends the response immediately,
      // and you cannot then call .json() on it. The headers are already sent.
      // The `return` keyword is also vital to prevent the next() call.
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // If the token is valid, attach the user payload to the request object and proceed.
    req.user = user;
    next();
  });
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID_WEB,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_WEB,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      } else {
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        user = new User({
          googleId: profile.id,
          email: email,
          username: profile.displayName || profile.id
        });
        await user.save();
        return done(null, user);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, username: req.user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Google login successful', token });
  }
);


router.post('/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Google ID token is required' });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_WEB);

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID_WEB,
    });

    const payload = ticket.getPayload();

    const googleId = payload['sub'];
    const email = payload['email'];
    const username = payload['name'] || payload['email'];

    let user = await User.findOne({ googleId: googleId });

    if (user) {
      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ message: 'Google login successful', token });
    } else {
      user = new User({
        googleId: googleId,
        email: email,
        username: username
      });
      await user.save();

      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      return res.status(201).json({ message: 'Google user registered and logged in', token });
    }

  } catch (error) {
    console.error('Google authentication error:', error);
    if (error.code === 'ERR_INVALID_ARG_VALUE' || (error.message && error.message.includes('audience'))) {
      res.status(401).json({ message: 'Invalid or unverified Google ID token. Please ensure your GOOGLE_CLIENT_ID_WEB is correct and the token is valid.' });
    } else {
      res.status(500).json({ message: 'Server error during Google authentication' });
    }
  }
});


router.post('/register', async (req, res) => {
  try {
    // Changed to expect email and password for registration
    const { email, password } = req.body; 

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check for existing user by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create new user with email and password, setting username to email for consistency
    const newUser = new User({ 
      email, 
      password, 
      username: email,
      profile: {
        firstName: '',
        lastName: '',
        displayName: email
      },
      musicalProfile: {
        primaryInstrument: 'piano',
        skillLevel: 'beginner',
        genres: [],
        goals: [],
        customGoals: [],
        practiceGoals: {
          dailyMinutes: 30,
          weeklySessions: 5
        }
      },
      stats: {
        totalPracticeTime: 0,
        totalSessions: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageSessionLength: 0,
        totalXP: 0,
        level: 1,
        achievements: []
      },
      social: {
        friends: [],
        friendRequests: { sent: [], received: [] },
        followers: [],
        following: [],
        isPublic: true,
        allowFriendRequests: true
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          reminders: true,
          social: true
        },
        privacy: {
          showProgress: true,
          showStats: true,
          allowMessages: true
        },
        theme: 'dark',
        language: 'en'
      }
    });
    await newUser.save();

    // Generate JWT token for the newly registered user
    const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '1h' });

    // Return the token along with the success message
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


router.post('/login', async (req, res) => {
  try {
    // Changed from username to email for login
    const { email, password } = req.body; 

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email instead of username
    const user = await User.findOne({ email }); 
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});


router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Access granted to profile', user });
  } catch (error) {
    console.error('Profile access error:', error);
    res.status(500).json({ message: 'Server error accessing profile' });
  }
});

router.post('/profile/complete', authenticateToken, async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      displayName, 
      primaryInstrument, 
      skillLevel, 
      goals, 
      customGoals, 
      practiceGoals 
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile information
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (displayName) user.profile.displayName = displayName;
    
    // Update musical profile
    if (primaryInstrument) user.musicalProfile.primaryInstrument = primaryInstrument;
    if (skillLevel) user.musicalProfile.skillLevel = skillLevel;
    if (goals && Array.isArray(goals)) user.musicalProfile.goals = goals;
    if (customGoals && Array.isArray(customGoals)) user.musicalProfile.customGoals = customGoals;
    
    // Update practice goals
    if (practiceGoals) {
      if (practiceGoals.dailyMinutes) user.musicalProfile.practiceGoals.dailyMinutes = practiceGoals.dailyMinutes;
      if (practiceGoals.weeklySessions) user.musicalProfile.practiceGoals.weeklySessions = practiceGoals.weeklySessions;
    }

    await user.save();

    res.status(200).json({ 
      message: 'Profile completed successfully', 
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        musicalProfile: user.musicalProfile
      }
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({ message: 'Server error during profile completion' });
  }
});

router.post('/profile-info', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, displayName, primaryInstrument, skillLevel } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile information
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (displayName) user.profile.displayName = displayName;
    
    // Update musical profile
    if (primaryInstrument) user.musicalProfile.primaryInstrument = primaryInstrument;
    if (skillLevel) user.musicalProfile.skillLevel = skillLevel;

    await user.save();

    res.status(200).json({ 
      message: 'Profile information updated successfully',
      user: {
        id: user._id,
        profile: user.profile,
        musicalProfile: user.musicalProfile
      }
    });
  } catch (error) {
    console.error('Profile info update error:', error);
    res.status(500).json({ message: 'Server error during profile info update' });
  }
});

router.post('/practice-goals', authenticateToken, async (req, res) => {
  try {
    const { goals, customGoals, practiceGoals } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update musical profile with goals and practice preferences
    if (goals && Array.isArray(goals)) {
      user.musicalProfile.goals = goals;
    }
    
    if (customGoals && customGoals.trim()) {
      user.musicalProfile.customGoals = [customGoals.trim()];
    }
    
    if (practiceGoals) {
      if (practiceGoals.dailyMinutes) {
        user.musicalProfile.practiceGoals.dailyMinutes = practiceGoals.dailyMinutes;
      }
      if (practiceGoals.weeklySessions) {
        user.musicalProfile.practiceGoals.weeklySessions = practiceGoals.weeklySessions;
      }
    }

    await user.save();

    res.status(200).json({ 
      message: 'Practice goals saved successfully',
      user: {
        id: user._id,
        musicalProfile: user.musicalProfile
      }
    });
  } catch (error) {
    console.error('Practice goals save error:', error);
    res.status(500).json({ message: 'Server error during practice goals save' });
  }
});

module.exports = router;
