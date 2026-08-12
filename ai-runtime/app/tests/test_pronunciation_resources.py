from app.core.resource_manager import (
    ResourceManager,
)

resources = ResourceManager.pronunciation()
recoginitions  = ResourceManager.recognition()
print()

print(
    "Features:",
    len(resources.features()),
)

print(
    "Weights:",
    resources.weights()["version"],
)

print(
    "Distances:",
    resources.distances()["version"],
)
print("Weights:",recoginitions.weights()["accept_threshold"])