require("dotenv").config();
require("./models");
const app = require("./app");
const sequelize = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to database");
    console.error(error);
  }
}

startServer();
