from app.services.pronunciation.phoneme_service import (
    PhonemeService,
)

phoneme = PhonemeService()

for word in [
    "The",
    "three",
    "boys",
]:
    ipa = phoneme.text_to_ipa(word)

    print()

    print(word)

    print("IPA :", repr(ipa))

    print(
        "Tokens:",
        [
            token.symbol
            for token in phoneme.tokenize(ipa)
        ]
    )