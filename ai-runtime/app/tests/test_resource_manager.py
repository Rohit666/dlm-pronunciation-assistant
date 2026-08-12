from app.core.resource_manager import (
    ResourceManager,
)

phonemes = (
    ResourceManager.pronunciation().feature_list()
)
recognition_resources = (
    ResourceManager.recognition().weights   
)
print()

print(
    "Loaded phonemes:",
    len(phonemes),
)
print(
    "Loaded recognition resources:",
   recognition_resources
)

print()

print(
    phonemes[0],
)