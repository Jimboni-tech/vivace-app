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

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.sendStatus(403).json({ message: 'Invalid or expired token' });
    }
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
    const newUser = new User({ email, password, username: email }); 
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

module.exports = router;
