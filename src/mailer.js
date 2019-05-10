const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const sgTransport = require('nodemailer-sendgrid-transport');

const options = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY,
  },
};

const sendgrid = new nodemailer.createTransport(sgTransport(options));

sendgrid.use('compile', hbs({
  viewEngine: {
    extName: '.hbs',
    partialsDir: 'src/view',
    layoutsDir: 'src/view',
  },
  viewPath: path.resolve('./src/view/'),
  extName: '.hbs',
}));

module.exports = {
  sendgrid,
};
