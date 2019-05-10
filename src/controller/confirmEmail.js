const { User } = require('@model');
const { res } = require('te-emprego-sdk');

const getUser = async token => new Promise(async (resolve, reject) => {
  const user = await User
    .findOne({ emailConfirmationToken: token });

  user
    ? resolve(user)
    : reject({
      message: 'Invalid token.',
      status: 400,
    });
});

const applyConfirmation = user => new Promise((resolve, reject) => {
  user.emailConfirmationToken = null;
  user.emailConfirmed = true;

  user.save((err) => {
    err && reject({ message: err.message, status: 500 });
    resolve({ ok: true });
  });
});

module.exports = token => getUser(token)
  .then(applyConfirmation)
  .then(ok => res.send(ok, 200))
  .catch(res.error);
