const { res } = require('te-emprego-sdk');
const { User } = require('@model');
const crypto = require('crypto');
const mailer = require('../mailer');

const generateToken = async () => (await crypto.randomBytes(56)).toString('hex');

const canIAddUser = user => new Promise((resolve, reject) => {
  User
    .findOne({ email: user.email }, (err, exists) => {
      err && reject({ message: err.message, status: 500 });
      exists
        ? reject({ message: 'Este email já foi cadastrado.', status: 400 })
        : resolve(user);
    });
});

const sendMail = async user => new Promise((resolve, reject) => {
  mailer.sendgrid.sendMail({
    to: user.email,
    from: 'no-reply@teemprego.com.br',
    subject: 'Bem vindo',
    template: 'bem-vindo',
    context: {
      token: user.emailConfirmationToken,
      name: user.name,
      email: user.email,
      appBase: 'https://app.teemprego.com.br',
      imagesBase: 'https://teemprego.com.br/content/mail',
    },
  }, async (error) => {
    if (error) { reject({ message: error.message, status: 500 }); }
    resolve({
      status: 201,
      data: {
        user,
        message: 'Conta criada com sucesso.',
      },
    });
  });
});

const saveUser = async user => new Promise((resolve, reject) => {
  user.save((error, newUser) => {
    if (error) { reject({ message: error.message, status: 500 }); }
    // eslint-disable-next-line no-param-reassign
    delete newUser.password;
    resolve(newUser.toObject());
  });
});

const addUser = async (user) => {
  const newUser = new User(user);
  newUser.avatar = newUser.gravatar();

  const token = await generateToken();
  newUser.emailConfirmationToken = token;

  return newUser;
};

module.exports = async (user) => {
  const { data, status } = await canIAddUser(user)
    .then(addUser)
    .then(saveUser)
    .then(sendMail)
    .catch(res.error);

  return res.send(data, status);
};
