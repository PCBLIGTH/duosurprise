const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
    try {
        // Connect without specifying database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || ''
        });

        console.log('Connected to MySQL server');

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'duosurprise'}`);
        console.log(`Database '${process.env.DB_NAME || 'duosurprise'}' created or already exists`);

        await connection.end();
        console.log('✅ Database setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating database:', error.message);
        console.error('\n⚠️  Assurez-vous que XAMPP/MySQL est démarré!');
        process.exit(1);
    }
}

createDatabase();
