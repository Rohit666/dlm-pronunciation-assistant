const { Mentee } = require("../models");
const menteeInsightsService = require("../services/menteeInsightsService");

async function resolveMentee(req, res) {
  const mentee = await Mentee.findOne({ where: { user_id: req.user.id } });
  if (!mentee) {
    res.status(404).json({ success: false, message: "Mentee not found." });
    return null;
  }
  return mentee;
}

// GET /api/analytics/mentee/overview
exports.getOverview = async (req, res) => {
  try {
    const mentee = await resolveMentee(req, res);
    if (!mentee) return;

    const overview = await menteeInsightsService.getMenteeOverview(mentee.id);
    res.json({ success: true, overview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/analytics/mentee/phonemes
exports.getPhonemes = async (req, res) => {
  try {
    const mentee = await resolveMentee(req, res);
    if (!mentee) return;

    const phonemes = await menteeInsightsService.getMenteePhonemes(mentee.id);
    res.json({ success: true, ...phonemes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
