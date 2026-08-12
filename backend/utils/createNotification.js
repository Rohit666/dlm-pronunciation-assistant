const { Notification } = require("../models");

const createNotification = async ({
  user_id,
  title,
  message,
  type,
  reference_id = null,
}) => {
  await Notification.create({
    user_id,
    title,
    message,
    type,
    reference_id,
  });
};

module.exports = createNotification;
