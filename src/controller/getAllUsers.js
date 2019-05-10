const { User } = require('@model');
const { res } = require('te-emprego-sdk');

module.exports = async (id) => {
  const query = id ? { _id: id } : {};
  const method = id ? 'findOne' : 'find';
  const users = await User[method](query);
  return res.send(users);
};
