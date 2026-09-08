const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
    // Store/read every timestamp as UTC. Without this, Sequelize's
    // mysql2 driver serializes JS Date objects using the Node
    // process's local time zone while CURRENT_TIMESTAMP/NOW() on the
    // MySQL side resolves against the server's own session time zone
    // (SYSTEM by default) — two different clocks feeding the same
    // columns, which is exactly the offset symptom. Setting this
    // pins the connection's session time_zone to UTC too (Sequelize
    // issues `SET time_zone` on connect), so both sides agree.
    // Frontend is responsible for localizing for display.
    timezone: "+05:30",
  },
);

module.exports = sequelize;
