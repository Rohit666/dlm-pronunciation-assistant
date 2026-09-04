// sequelize-cli config (JS, not JSON, so it can read .env like config/db.js does).
// .sequelizerc points here. Drop this in backend/config/config.js.
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
