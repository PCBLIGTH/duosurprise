const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false }, // Main image URL or icon
    images: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const rawValue = this.getDataValue('images');
            try {
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) {
                return [];
            }
        },
        set(value) {
            this.setDataValue('images', JSON.stringify(value));
        }
    },
    description: { type: DataTypes.TEXT },
    tag: { type: DataTypes.STRING },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = Product;
