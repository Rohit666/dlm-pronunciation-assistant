from pathlib import Path

from app.core.resource_loader import (
    ResourceLoader,
)
class RecognitionResources:

    def __init__(
        self,
        base: Path,
    ):

        self.base = (
            base / "recognition"
        )

    def weights(
        self,
    ):
        return ResourceLoader.load_json(
            self.base /
            "recognition_weights.json"

        )   
    def dictionary_variants(
        self,
    ):
        return ResourceLoader.load_json(
            self.base /
            "dictionary_variants.json"

        )
       
    def accept_threshold(self):
        return self.weights()["accept_threshold"]

    def text_weight(self):
        return self.weights()["text"]

    def ipa_weight(self):
        return self.weights()["ipa"]

    def morphology_bonus(self):
        return self.weights()["morphology_bonus"]
    
    def dictionary_bonus(self):
        return self.weights()["dictionary_bonus"]