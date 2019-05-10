const { User } = require('@model');
const { res, token } = require('te-emprego-sdk');
const bcrypt = require('bcrypt');

const getUser = async ({ email, password }) => new Promise(async (resolve, reject) => {
  const user = await User
    .findOne({ email })
    .select('+password')
    .lean()
    .exec();

  user
    ? resolve({ user, password })
    : reject({
      message: 'Invalid credentials. User does not exist.',
      status: 400,
    });
});

const verify = async ({ user, password }) => new Promise(async (resolve, reject) => {
  console.log(password, user.password);
  const isValid = await bcrypt.compare(password, user.password);

  isValid
    ? resolve(user)
    : reject({
      message: 'Invalid credentials. Wrong password',
      status: 400,
    });
});

const generateToken = async user => new Promise(async (resolve, reject) => {
  const newUser = { ...user };
  const newToken = await token
    .encode(user)
    .catch(error => reject({ message: error.message, status: 500 }));

  delete newUser.password;

  resolve({
    token: newToken,
    user: newUser,
  });
});

module.exports = credentials => getUser(credentials)
  .then(verify)
  .then(generateToken)
  .then(response => res.send(response, 200))
  .catch(res.error);
