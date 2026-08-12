from importlib import resources
import json
from pathlib import Path

from app.models.phoneme_token import PhonemeToken
from app.core.resource_manager import (
    ResourceManager,
)

class IPATokenizer:

    def __init__(self):

        resources = (
            ResourceManager.pronunciation()
        )
        self.multi_symbols = sorted(
            resources.symbols(),
            key=len,
            reverse=True,
        )
        self.vowels = resources.vowels()
        self.consonants = resources.consonants()
        # self.multi_symbols = sorted(
        #     self.vowels.union(self.consonants),
        #     key=len,
        #     reverse=True,
        # )
    def tokenize(self, ipa):

        ipa = ipa.replace("_", "")

        tokens = []

        stress = False

        secondary = False

        i = 0

        while i < len(ipa):
            if ipa[i] == "ˈ":
                stress = True
                i += 1
                continue
            if ipa[i] == "ˌ":
                secondary = True
                i += 1
                continue
            matched = None
            for symbol in self.multi_symbols:
                if ipa.startswith(symbol, i):
                    matched = symbol
                    break
            if matched:
                category = (
                    "vowel"
                    if matched in self.vowels
                    else "consonant"
                )

                tokens.append(
                    PhonemeToken(
                        symbol=matched,
                        stress=stress,
                        secondary_stress=secondary,
                        long="ː" in matched,
                        category=category,
                    )
                )

                stress = False
                secondary = False

                i += len(matched)
                continue

            else:
                unknown = ipa[i]
                print(f"Unknown IPA symbol: {repr(unknown)}")
                i += 1
                continue

        return tokens