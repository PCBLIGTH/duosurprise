const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Newsletter = sequelize.define('Newsletter', {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    subscribedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = Newsletter;
