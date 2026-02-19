const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Order = sequelize.define('Order', {
    recipientName: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    deliveryDate: { type: DataTypes.DATE, allowNull: false },
    message: { type: DataTypes.TEXT },
    productName: { type: DataTypes.STRING, allowNull: false },
    customContent: { type: DataTypes.TEXT }, // New field for personalization
    paymentMethod: {
        type: DataTypes.ENUM('om', 'moov', 'card'),
        allowNull: false
    },
    phoneNumber: { type: DataTypes.STRING },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    totalAmount: { type: DataTypes.INTEGER, allowNull: false },
    confirmationCode: { type: DataTypes.STRING } // For storing the OTP used
});

module.exports = Order;
