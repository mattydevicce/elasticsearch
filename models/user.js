'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    nane: DataTypes.STRING,
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    this.hasMany(models.IndexPermissions)
  };
  return User;
};