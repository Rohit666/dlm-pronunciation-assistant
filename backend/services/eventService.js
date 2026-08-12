const createNotification = require("../utils/createNotification");

const createActivityLog = require("../utils/createActivityLog");

const NOTIFICATION_TYPES = require("../constants/notificationTypes");

const ACTIVITY_TYPES = require("../constants/activityTypes");

const emitPracticeSubmitted = async ({
  mentorUserId,
  menteeName,
  practiceSessionId,
  actorUserId,
}) => {
  // Notification
  await createNotification({
    user_id: mentorUserId,

    title: "New Practice Submission",

    message: `${menteeName} submitted pronunciation practice.`,

    type: NOTIFICATION_TYPES.PRACTICE_SUBMITTED,

    reference_id: practiceSessionId,
  });

  // Activity log
  await createActivityLog({
    user_id: actorUserId,

    action: ACTIVITY_TYPES.PRACTICE_SUBMITTED,

    description: `${menteeName} submitted pronunciation practice.`,

    entity_type: "practice_session",

    entity_id: practiceSessionId,
  });
};

module.exports = {
  emitPracticeSubmitted,
};
