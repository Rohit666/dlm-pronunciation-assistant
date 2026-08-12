from app.services.pronunciation.reference_pronunciation_builder import (
    ReferencePronunciationBuilder,
)

builder = ReferencePronunciationBuilder()

document = builder.build(
    "The three boys"
)
assert [
    [p.symbol for p in word.phonemes]
    for word in document.words
] == [
    ["ð", "ə"],
    ["θ", "ɹ", "iː"],
    ["b", "ɔɪ", "z"],
]
print()

print("Words")

print("----------------")

for word in document.words:

    print(
        word.word,
        "".join(
            p.symbol
            for p in word.phonemes
        ),
    )

print()

print("Flatten")

print("----------------")

print(

    "".join(

        p.symbol

        for p in document.flatten()

    )

)