const { database } = require('te-emprego-sdk');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { Schema, model } = database;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
    select: false,
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
  },
  contact: {
    phones: [String],
    // The bellow model follows the viacep api: https://viacep.com.br/
    address: {
      cep: String,
      logradouro: String,
      bairro: String,
      complemento: String,
      localidade: String,
      uf: String,
      unidade: String,
      ibge: String,
      gia: String,
      numero: { type: Schema.Types.Mixed },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: String,
    select: false,
  },
  tokenIsUsed: {
    type: Boolean,
    default: false,
  },
  emailConfirmationToken: {
    type: String,
  },
  emailConfirmed: {
    type: Boolean,
    default: false,
  },
  newEmail: {
    type: String,
  },
  newEmailConfirmationToken: {
    type: String,
  },
});

UserSchema.pre('save', async function (next) {
  if (this.password) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
  }
});

UserSchema.methods.gravatar = function (size = 200) {
  if (!this.email) return `https://gravatar.com/avatar/?s=${size}&d=retro`;

  const md5 = crypto
    .createHash('md5')
    .update(this.email)
    .digest('hex');

  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};


module.exports = {
  User: model('User', UserSchema),
};
