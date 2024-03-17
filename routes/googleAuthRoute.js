const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get("/google", passport.authenticate('google'));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure' }), 
  (req, res) => {
    res.redirect('/auth/success');
  }
);

router.get('/success', (req, res) => {
  res.send('Authentication successful!');
});

router.get('/failure', (req, res) => {
  res.send('Authentication failed!');
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
