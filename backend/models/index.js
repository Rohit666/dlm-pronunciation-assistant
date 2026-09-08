const Sequelize = require("sequelize");

const sequelize = require("../config/db");

const db = {};

db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.Batch = require("./Batch")(sequelize, Sequelize.DataTypes);
db.Mentee = require("./Mentee")(sequelize, Sequelize.DataTypes);
db.Lesson = require("./Lesson")(sequelize, Sequelize.DataTypes);
db.LessonSentence = require("./LessonSentence")(sequelize, Sequelize.DataTypes);
db.PracticeSession = require("./PracticeSession")(
  sequelize,
  Sequelize.DataTypes,
);
db.Notification = require("./Notification")(sequelize, Sequelize.DataTypes);
db.ActivityLog = require("./ActivityLog")(sequelize, Sequelize.DataTypes);
db.PracticeAttempt = require("./PracticeAttempt")(
  sequelize,
  Sequelize.DataTypes,
);
db.StudentPhonemeStat = require("./StudentPhonemeStat")(
  sequelize,
  Sequelize.DataTypes,
);
db.Assessment = require("./Assessment")(sequelize, Sequelize.DataTypes);
db.WordAssessment = require("./WordAssessment")(sequelize, Sequelize.DataTypes);
db.PhonemeAssessment = require("./PhonemeAssessment")(
  sequelize,
  Sequelize.DataTypes,
);
db.Diagnosis = require("./Diagnosis")(sequelize, Sequelize.DataTypes);
db.LearningNeed = require("./LearningNeed")(sequelize, Sequelize.DataTypes);
db.AssessmentSnapshot = require("./AssessmentSnapshot")(
  sequelize,
  Sequelize.DataTypes,
);
db.PracticeSessionTry = require("./PracticeSessionTry")(
  sequelize,
  Sequelize.DataTypes,
);
// Run associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

db.Sequelize = Sequelize;

module.exports = db;
