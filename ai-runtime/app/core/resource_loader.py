import json


class ResourceLoader:

    _cache = {}

    @classmethod
    def load_json(
        cls,
        path,
    ):

        path = str(path)

        if path in cls._cache:

            return cls._cache[path]

        with open(
            path,
            encoding="utf-8",
        ) as file:

            data = json.load(
                file
            )

        cls._cache[path] = data

        return data

    @classmethod
    def clear_cache(
        cls,
    ):

        cls._cache.clear()

    @classmethod
    def cache_size(
        cls,
    ):

        return len(
            cls._cache
        )