const { Client } = require('pg');
const conn_string = require('./db_config');

async function registerUser(username, password) {
    const client = new Client(conn_string);
    await client.connect();
    try {
        const query_string = {
            text: 'INSERT INTO users(username, password) VALUES($1, $2)',
            values: [username, password],
        };
        const query_result = await client.query(query_string);

        if (query_result.rowCount === 1) {
            return true; // Registration successful
        } else {
            return false; // Registration failed
        }
    } catch (error) {
        console.error('Error during registration:', error);
        return false; // Registration failed due to an error
    } finally {
        await client.end();
    }
}

module.exports = registerUser;
