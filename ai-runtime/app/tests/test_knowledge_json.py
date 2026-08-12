from app.core.resource_manager import ResourceManager

phonemes = ResourceManager.pronunciation().feature_list()

print(f"Total phonemes : {len(phonemes)}")

symbols = set()

for phoneme in phonemes:
    print("phoneme:", phoneme)
    symbol = phoneme["symbol"]

    if symbol in symbols:
        print(f"Duplicate: {symbol}")

    symbols.add(symbol)

print("Unique symbols:", len(symbols))