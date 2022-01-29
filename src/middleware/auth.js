const jwt = require("jsonwebtoken");
const User = require("../models/user");
//FOR google auth method
const { OAuth2Client } = require("google-auth-library");

const authMiddleware = async function(req, res, next) {
  // console.log("out1")

  if (req.query.userAuthProvider === "googleAuth") {

    try {
      const token = req.header("Authorization").replace("Bearer ", "");
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      if (!ticket) {
        throw new Error();
      }
      const email = ticket.getPayload().email;
      const user =await User.findOne({ email: email });
      if (!user) {
        throw new Error();
      }
      req.user = user;
      req.body.token = token;
      next();
    } catch (error) {
      res.status(500).send({error:"Authentication Failed"});
    }
  } else {
    try {
      const token = req.header("Authorization").replace("Bearer ", "");
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET); //returns user Id
      const user = await User.findOne({
        _id: decodedToken._id,
        "tokens.token": token
      });
      if (!user) {
        throw new Error();
      }
      req.user = user;
      req.token = token;

      next();
    } catch (error) {
      res.status(500).send("Authentication Failed");
    }
  }
};

module.exports = authMiddleware;
