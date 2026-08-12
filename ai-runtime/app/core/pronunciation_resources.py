from pathlib import Path
from app.core.resource_loader import (
    ResourceLoader,
)

class PronunciationResources:

    def __init__(
        self,
        resources_root: Path,
        language: str = "en",
    ):
        self.resources_root = resources_root
        self.language = language

    @property
    def base_folder(self):
        return (
            self.resources_root
            / "pronunciation"
            / self.language
        )

    def weights(self):
        return ResourceLoader.load_json(
            self.base_folder / 
            "phonetic_weights.json"
        )

    def distances(self):
        return ResourceLoader.load_json(
            self.base_folder / 
            "feature_distance.json"
        )

    def rules(self):
        return ResourceLoader.load_json(
            self.base_folder / 
            "pronunciation_rules.json"
        )
    def alignment_rules(self):
        return ResourceLoader.load_json(
            self.base_folder / 
            "alignment_rules.json"
        )
    def feature_list(self):
        return ResourceLoader.load_json(
            self.base_folder / 
            "phonetic_features.json"
        )


    def features(self):
        return {
            feature["symbol"]: feature
            for feature in self.feature_list()
        }
    def vowels(self):
        return {
            symbol
            for symbol, feature in self.features().items()
            if feature["type"] == "vowel"
        }


    def consonants(self):
        return {
            symbol
            for symbol, feature in self.features().items()
            if feature["type"] == "consonant"

        }
    def symbols(self):

        return {
            feature["symbol"]
            for feature
            in self.feature_list()
        }