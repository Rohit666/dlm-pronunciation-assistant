const recommendationService = require("../services/recommendationService");
const ERROR_MESSAGES = require("../constants/errorMessages");

exports.getRecommendations = async (req, res) => {
  try {
    const recommendations =
      await recommendationService.getRecommendationsForMentee(req.user.id);
    res.json({
      success: true,
      ...recommendations,
    });
  } catch (error) {
    console.error(error);
    if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
      res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to load recommendations",
      });
    }
  }
};
