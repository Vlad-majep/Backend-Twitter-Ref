const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ethUtil = require('ethereumjs-util');
const { ethers } = require("ethers");
const { Web3 } = require('web3');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const oauth = require('oauth');
const axios = require('axios');


// ! from config.json
const config = require('../config/config.json');

// * errors
const {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} = require('../errors/AllErrors');

// * models
const { user } = require('../models/User');

// * utils
// ? constants
const { MESSAGE, STATUS, SERVER_SETTING } = require('../utils/constants');

// Twitter access keys
const consumer_key = 'ВСТАВИТЬ';
const consumer_secret = 'ВСТАВИТЬ';

const oauthClient = new oauth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  consumer_key,
  consumer_secret,
  '1.0A',
  null,
  'HMAC-SHA1'
);

function generateReferralCode() {
  return Math.random().toString(36).substr(2, 6);
}

class Users {
  constructor(data) {
    this.wallet = {
      Ethereum: () => {
        const wallet = web3.eth.accounts.create();
        return {
          address: wallet.address,
          privateKey: wallet.privateKey,
        };
      },
    };
    this.jwt_secret = data.jwt_secret;
    this.cookie_setting = data.cookie_setting;
  }

  // ? create token
  _createToken = (data) => jwt.sign(data, this.jwt_secret);

  // * GET
  // ? get the current user by _id
  getInfo = (req, res, next) => {
    const { _id } = req.user;
    console.log('req.user:', req.user); // add this line for logging
    user
      .findById(_id)
      .orFail(() => res.status(404).send({ error: MESSAGE.ERROR.NOT_FOUND.USER }))
      .then((userMe) => {
        res.send({ data: userMe });
      })
      .catch(error => res.status(500).send({ error: error.message }));
  };

  // Get referral link
  referralLink = (req, res, next) => {
    const { _id } = req.user;
    user
      .findById(_id)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
      .then((userMe) => {
        const link = `http://localhost:3001/api/signup/${userMe.referralCode}`;
        res.send({ data: link })
      })
      .catch(next);
  };

  // Add referral code
  addReferralCode = (req, res, next) => {
    const { _id } = req.user;
    user
      .findById(_id)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
      .then(async (userMe) => {
        try {
          const { referralCode } = req.body;

          if (userMe.referrer) {
            return res.status(400).json({ message: 'User already has a referral code.' });
          }

          if (!referralCode) {
            return res.status(400).json({ message: 'Referral code is required.' });
          }

          // Check if a user with the specified referral code exists
          const referringUser = await user.findOne({ referralCode: referralCode });

          if (!referringUser) {
            return res.status(400).json({ message: 'Invalid referral code.' });
          }

          // Set the referring user in the referrer field of the current user
          userMe.referrer = referralCode;
          await userMe.save();

          referringUser.points += 1;
          await referringUser.save();

          return res.status(200).json({ message: 'Referral code added successfully.' });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
      })
      .catch(next);
  };

   // Add wallet
   addWallet = (req, res, next) => {
    const { _id } = req.user;
    user
      .findById(_id)
      .orFail(() => new NotFoundError(MESSAGE.ERROR.NOT_FOUND.USER))
      .then(async (userMe) => {
        try {
          const { wallet } = req.body;

          if (userMe.wallet) {
            return res.status(400).json({ message: 'User already has a wallet.' });
          }

          if (!wallet) {
            return res.status(400).json({ message: 'Wallet is required.' });
          }

          // Check if a user with the specified referral code exists
          const walletUser = await user.findOne({ wallet: wallet });

          if (walletUser) {
            return res.status(400).json({ message: 'Invalid wallet.' });
          }

          // Set the referring user in the referrer field of the current user
          userMe.wallet = wallet;
          await userMe.save();

          return res.status(200).json({ message: 'Referral code added successfully.' });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
      })
      .catch(next);
  };

  // Get authorization link
  getTwiterLink = (req, res, next) => {
    oauthClient.getOAuthRequestToken((error, oauthToken, oauthSecret, results) => {
      if (error) {
        console.error('Error getting authentication URL:', error);
      } else {
        const auth_url = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`;
        res.send({ data: { auth_url, oauthToken, oauthSecret } })
      }
    });
  };

  // Twitter authorization completion
  setTwitter = (req, res, next) => {
    const { oauthToken, oauthSecret, verifier } = req.body;

    oauthClient.getOAuthAccessToken(oauthToken, oauthSecret, verifier, (error, userAccessToken, userAccessTokenSecret, results) => {
      if (error) {
        console.error('Error getting OAuth access token:', error);
        res.status(401).send({ message: "OAuth access token error" });
      } else {
        const consumerKey = 'ВСТАВИТЬ';
        const consumerSecret = 'ВСТАВИТЬ';

        const oauth = OAuth({
          consumer: {
            key: consumerKey,
            secret: consumerSecret,
          },
          signature_method: 'HMAC-SHA1',
          hash_function(base_string, key) {
            return crypto.createHmac('sha1', key).update(base_string).digest('base64');
          },
        });

        const url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
        const requestData = {
          url: url,
          method: 'GET',
        };
        const requestHeaders = oauth.toHeader(oauth.authorize(requestData, {
          key: userAccessToken,
          secret: userAccessTokenSecret,
        }));

        fetch(url, {
          method: 'GET',
          headers: requestHeaders,
        })
          .then(response => response.json())
          .then(async user_data => {
            const username = user_data.screen_name;
            const avatar_url = user_data.profile_image_url_https;

            user.findOne({ name: username })
              .then(async (existingUser) => {
                if (existingUser) {
                  const token = this._createToken({ _id: existingUser._id, isUser: true });
                  console.log('Setting cookie for existing user:', token);

                  res.cookie('jwt', token, this.cookie_setting);
                  console.log('Cookie set for existing user');

                  res.send({ message: MESSAGE.INFO.LOGIN, existingUser });
                } else {

                  // Generate referral code and QR code for two-factor authentication
                  const referralCode = generateReferralCode();

                  // Create a new user with default tokens (USDC and USDT)
                  const newUser = await user.create({
                    name: username,
                    photo: avatar_url,
                    referralCode,
                    registrationDate: new Date(),
                  });

                  const token = this._createToken({ _id: newUser._id, isUser: true });
                  console.log('Setting cookie for existing user:', token);

                  res.cookie('jwt', token, this.cookie_setting);
                  console.log('Cookie set for existing user');

                  res.send({ message: MESSAGE.INFO.LOGIN, newUser });

                }
              });
          });
      }
    });
  };

  // Logout
  signOut = (req, res) => {
    res.clearCookie('jwt').send({ message: MESSAGE.INFO.LOGOUT });
  };
}

const users = new Users({
  jwt_secret: SERVER_SETTING.JWT_SECRET,
  cookie_setting: {
    expires: new Date(Date.now() + 12 * 3600000),
    // httpOnly: true,
    sameSite: 'None',
    secure: 'production',
  },
});

module.exports = { users };
