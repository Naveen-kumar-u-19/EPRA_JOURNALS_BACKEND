const passport = require('passport');
require('dotenv').config();
var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;
passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
  try {
    if (jwt_payload.id) {
      return done(null, jwt_payload);
    }
    else {
      return done(null, false);
    }
  }
  catch (err) {
    return done(err, false);
  }
}));