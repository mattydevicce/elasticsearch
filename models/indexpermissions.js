'use strict';
module.exports = (sequelize, DataTypes) => {
  const IndexPermissions = sequelize.define('IndexPermissions', {
    name: DataTypes.STRING,
    access: DataTypes.BOOLEAN,
    userID: DataTypes.INTEGER
  }, {});
  IndexPermissions.associate = function(models) {
    // associations can be defined here
    this.belongsTo(models.Users)
  };
  return IndexPermissions;
};