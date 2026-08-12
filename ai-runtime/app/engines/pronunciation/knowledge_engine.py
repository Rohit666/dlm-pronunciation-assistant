from app.core.resource_manager import (
    ResourceManager,
)

from app.models.phonetic_feature import (
    PhoneticFeature,
)

from app.models.phonetic_knowledge import (
    PhoneticKnowledge,
)


class KnowledgeEngine:

    def __init__(
        self,
        language="en",
    ):

        phonemes = (ResourceManager.pronunciation(language).feature_list()
)
        self.language = language

        self.knowledge = {}

        for phoneme in phonemes:

            feature = PhoneticFeature(

                symbol=phoneme["symbol"],

                language=phoneme["language"],

                type=phoneme["type"],

                place=phoneme.get("place"),

                manner=phoneme.get("manner"),

                voicing=phoneme.get("voicing"),

                height=phoneme.get("height"),

                backness=phoneme.get("backness"),

                rounding=phoneme.get("rounding"),

                length=phoneme.get("length"),

                difficulty=phoneme.get(
                    "difficulty",
                    1,
                ),

                common_substitutions=phoneme.get(
                    "commonSubstitutions",
                    [],
                ),

                teaching_tip=phoneme.get(
                    "teachingTip",
                    "",
                ),

            )

            knowledge = PhoneticKnowledge(

                feature=feature,

                difficulty=feature.difficulty,

                substitutions=feature.common_substitutions,

                teaching_tip=feature.teaching_tip,

            )

            self.knowledge[
                feature.symbol
            ] = knowledge

    def get(self, symbol):

        return self.knowledge.get(symbol)

    def enrich(self, tokens):

        for token in tokens:

            token.knowledge = self.get(
                token.symbol
            )

        return tokens