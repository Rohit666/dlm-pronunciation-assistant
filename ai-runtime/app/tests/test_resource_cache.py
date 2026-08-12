from app.core.resource_loader import (
    ResourceLoader,
)

from app.core.resource_manager import (
    ResourceManager,
)

print(
    ResourceLoader.cache_size()
)

ResourceManager.pronunciation().features()

print(
    ResourceLoader.cache_size()
)

ResourceManager.pronunciation().features()

print(
    ResourceLoader.cache_size()
)

ResourceLoader.clear_cache()