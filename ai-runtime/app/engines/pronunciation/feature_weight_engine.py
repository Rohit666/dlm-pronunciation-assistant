from app.core.resource_manager import ResourceManager


class FeatureWeightEngine:

    def __init__(self, language="en"):

        self.weights = (
            ResourceManager
            .pronunciation(language)
            .weights()
        )

    def for_type(
        self,
        phoneme_type,
    ):

        return self.weights.get(
            phoneme_type,
            {},
        )