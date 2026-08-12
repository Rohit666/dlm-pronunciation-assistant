const { ActivityLog } = require("../models");

const createActivityLog = async ({
  user_id = null,
  action,
  description,
  entity_type = null,
  entity_id = null,
}) => {
  await ActivityLog.create({
    user_id,
    action,
    description,
    entity_type,
    entity_id,
  });
};

module.exports = createActivityLog;
