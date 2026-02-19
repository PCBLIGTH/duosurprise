const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Check if we should use SQLite (default for production/cloud if no DB_HOST is set)
if (process.env.NODE_ENV === 'production' || !process.env.DB_HOST) {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: false
    });
} else {
    // MySQL for Local Development (XAMPP)
    sequelize = new Sequelize(
        process.env.DB_NAME || 'duosurprise',
        process.env.DB_USER || 'root',
        process.env.DB_PASS || '',
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: 'mysql',
            logging: false
        }
    );
}

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        const dbType = sequelize.getDialect() === 'sqlite' ? 'SQLite (Cloud Mode)' : 'MySQL (Local Mode)';
        console.log(`Connected to database: ${dbType}`);
        // Sync models
        await sequelize.sync({ alter: true });
        console.log('Database synced');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, connectDB };
