from app.core.resource_manager import ResourceManager

resources = ResourceManager.pronunciation()

features = resources.features()

print("Total:", len(features))

required = [

    "ɹ",

    "r",

    "ɔɪ",

    "aɪ",

    "eɪ",

    "oʊ",

    "aʊ",

    "ɔː",

    "iː",

    "uː",

]

print()

for symbol in required:

    print(

        symbol,

        "✓" if symbol in features else "✗",

    )