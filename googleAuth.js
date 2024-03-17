require('dotenv').config({ path: "config/config.env" });
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('./models/userModel');


module.exports = function (passport) {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;


    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.CLIENT_URL,
                scope: ['profile', 'email'],
                passReqToCallback: true,
            },
            async (req, accessToken, refreshToken, profile, done) => {
                // console.log('Google Strategy - Profile:', profile);

                // Get user data from Google
                const newUser = {
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: 'defaultPassword', // Provide a default password or handle it as needed
                };


                // console.log('Google Strategy - New User:', newUser);

                try {
                    // Find the user in our database
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // If user is present in our database.
                        done(null, user);
                    } else {
                        // If the user is not present in our database, save user data to the database.
                        user = await User.create(newUser);
                        done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                    done(err, null); // Pass the error to the done callback
                }
            }
        )
    );
    /// Used to serialize the user for the session
    passport.serializeUser((user, done) => {
        try {
            // Ensure that user is not undefined and has the 'id' property
            // console.log('Serialized user:', user);
            if (user && user._id) {
                done(null, user._id); // Assuming MongoDB ObjectId is used
            } else {
                throw new Error('Invalid user object');
            }
        } catch (err) {
            console.error(err);
            done(err, null);
        }
    });

    // Used to deserialize the user
    passport.deserializeUser((id, done) => {
        const query = User.findById(id);

        if (parseInt(mongoose.version) >= 6) {
            // Mongoose version 6 and above, no callback needed
            query.then((user) => {
                // console.log('Deserialized user:', user);
                if (!user) {
                    return done(new Error('User not found'), null);
                }
                return done(null, user);
            }).catch((err) => {
                console.error(err);
                return done(err, null);
            });
        } else {
            // Older versions of Mongoose, using callback
            query.exec((err, user) => {
                if (err) {
                    console.error(err);
                    return done(err, null);
                }
                // console.log('Deserialized user:', user);
                if (!user) {
                    return done(new Error('User not found'), null);
                }
                return done(null, user);
            });
        }
    });


};
