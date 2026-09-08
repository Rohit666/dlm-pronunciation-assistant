// Sequelize-CLI config (plain object — CLI cannot consume config/db.js,
// which exports an already-instantiated Sequelize instance). Same env
// vars as config/db.js so both stay in sync from one .env file.
require("dotenv").config();

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "mysql",
  logging: false,
};

module.exports = {
  development: base,
  test: base,
  production: base,
};
