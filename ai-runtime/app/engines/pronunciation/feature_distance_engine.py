from app.core.resource_manager import ResourceManager


class FeatureDistanceEngine:

    def __init__(self, language="en"):

        self.language = language

        self.distances = (
            ResourceManager
            .pronunciation(language)
            .distances()
        )

    def distance(
        self,
        category,
        source,
        target,
    ):

        if source is None or target is None:
            return 1.0

        if source == target:
            return 0.0

        category_table = self.distances.get(category)

        if category_table is None:
            return 1.0

        source_table = category_table.get(source)

        if source_table is None:
            return 1.0

        return source_table.get(
            target,
            1.0,
        )