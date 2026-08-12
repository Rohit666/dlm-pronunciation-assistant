# from app.services.pronunciation.phoneme_service import PhonemeService

# phoneme = PhonemeService()

# print(

#     phoneme.text_to_ipa(

#         "The three boys"

#     )

# )
from app.core.resource_manager import ResourceManager

resources = ResourceManager.pronunciation()

features = resources.features()

print(type(features))
print(features[:2] if isinstance(features, list) else list(features.items())[:2])