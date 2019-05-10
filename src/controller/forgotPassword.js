const { User } = require('@model');
const { res } = require('te-emprego-sdk');
const crypto = require('crypto');
const mailer = require('../mailer');

const setRecoveryToken = email => new Promise(async (resolve, reject) => {
  const token = (await crypto.randomBytes(30)).toString('hex');

  const now = new Date();
  now.setHours(now.getHours() + 1);

  const update = {
    $set: {
      passwordResetToken: token,
      passwordResetExpires: now,
      tokenIsUsed: false,
    },
  };

  const user = await User
    .findOneAndUpdate({ email }, update);

  user
    ? resolve({ email, user, token })
    : reject({
      message: 'User not found.',
      status: 400,
    });
});

const sendEmail = ({ email, user, token }) => new Promise((resolve, reject) => {
  mailer.sendgrid.sendMail({
    to: email,
    from: 'no-reply@teemprego.com.br',
    subject: 'Recuperar senha',
    template: 'password-recover',
    context: { token, name: user.name, email: user.email },
  }, (error) => {
    error && reject({ message: error.message, status: 500 });
    resolve({ ok: true });
  });
});

module.exports = email => setRecoveryToken(email)
  .then(sendEmail)
  .then(data => res.send(data, 200))
  .catch(error => res.error({ message: error.message, status: 500 }));
