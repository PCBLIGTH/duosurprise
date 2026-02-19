const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'duosurprise',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL via XAMPP/MariaDB');
        // Sync models
        await sequelize.sync({ alter: true });
        console.log('Database synced');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, connectDB };
