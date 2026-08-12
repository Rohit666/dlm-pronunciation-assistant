# from app.engines.pronunciation.ipa_tokenizer import (
#     IPATokenizer,
# )

# tokenizer = IPATokenizer()

# for symbol in tokenizer.multi_symbols:

#     if "ɔ" in symbol or "ɪ" in symbol:

#         print(symbol)
from app.core.resource_manager import (
    ResourceManager,
)
resources = ResourceManager.pronunciation()

for feature in resources.feature_list():

    if "ɔ" in feature["symbol"]:

        print(repr(feature["symbol"]))
print("+++++")
for symbol in sorted(resources.vowels()):
    print(repr(symbol))


print("+++++")
print(
    resources.features()["ɔɪ"]["type"]
)