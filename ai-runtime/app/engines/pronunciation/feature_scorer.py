from app.models.feature_comparison import (
    FeatureComparison,
)


class FeatureScorer:

    def __init__(
        self,
        distance_engine,
        weight_engine,
    ):

        self.distance_engine = distance_engine
        self.weight_engine = weight_engine

    # --------------------------------------------------
    # PLACE
    # --------------------------------------------------

    def score_place(
        self,
        source,
        target,
        weights,
    ):

        if (
            not source.feature.place
            or not target.feature.place
        ):
            return None

        weight = weights.get(
            "place",
            0.0,
        )

        distance = self.distance_engine.distance(
            "place",
            source.feature.place,
            target.feature.place,
        )

        similarity = 1.0 - distance

        contribution = (
            similarity
            * weight
        )

        return FeatureComparison(

            feature="place",

            source=source.feature.place,

            target=target.feature.place,

            weight=weight,

            similarity=round(
                similarity,
                3,
            ),

            contribution=round(
                contribution,
                3,
            ),

            explanation=(
                "Same place of articulation."
                if distance == 0
                else f"Distance = {distance}"
            ),
        )

    # --------------------------------------------------
    # TYPE
    # --------------------------------------------------

    def score_type(
        self,
        source,
        target,
        weights,
    ):

        weight = weights.get(
            "type",
            0.0,
        )

        similarity = (
            1.0
            if source.feature.type
            ==
            target.feature.type
            else 0.0
        )

        return FeatureComparison(

            feature="type",

            source=source.feature.type,

            target=target.feature.type,

            weight=weight,

            similarity=similarity,

            contribution=round(
                similarity * weight,
                3,
            ),

            explanation=(
                "Same phoneme type."
                if similarity == 1
                else "Different phoneme type."
            ),
        )

    # --------------------------------------------------
    # VOICING
    # --------------------------------------------------

    def score_voicing(
        self,
        source,
        target,
        weights,
    ):

        if (
            not source.feature.voicing
            or not target.feature.voicing
        ):
            return None

        weight = weights.get(
            "voicing",
            0.0,
        )

        similarity = (
            1.0
            if source.feature.voicing
            ==
            target.feature.voicing
            else 0.0
        )

        return FeatureComparison(

            feature="voicing",

            source=source.feature.voicing,

            target=target.feature.voicing,

            weight=weight,

            similarity=similarity,

            contribution=round(
                similarity * weight,
                3,
            ),

            explanation=(
                "Same voicing."
                if similarity == 1
                else "Different voicing."
            ),
        )

    # --------------------------------------------------
    # MANNER
    # --------------------------------------------------

    def score_manner(
        self,
        source,
        target,
        weights,
    ):

        if (
            not source.feature.manner
            or not target.feature.manner
        ):
            return None

        weight = weights.get(
            "manner",
            0.0,
        )

        similarity = (
            1.0
            if source.feature.manner
            ==
            target.feature.manner
            else 0.0
        )

        return FeatureComparison(

            feature="manner",

            source=source.feature.manner,

            target=target.feature.manner,

            weight=weight,

            similarity=similarity,

            contribution=round(
                similarity * weight,
                3,
            ),

            explanation=(
                "Same manner."
                if similarity == 1
                else "Different manner."
            ),
        )
    # --------------------------------------------------
    # HEIGHT
    # --------------------------------------------------

    def score_height(
        self,
        source,
        target,
        weights,
    ):

        if (
            not source.feature.height
            or not target.feature.height
        ):
            return None

        weight = weights.get(
            "height",
            0.0,
        )

        similarity = (
            1.0
            if source.feature.height
            ==
            target.feature.height
            else 0.0
        )

        return FeatureComparison(

            feature="height",

            source=source.feature.height,

            target=target.feature.height,

            weight=weight,

            similarity=similarity,

            contribution=round(
                similarity * weight,
                3,
            ),

            explanation=(
                "Same tongue height."
                if similarity == 1
                else "Different tongue height."
            ),
        )
    # --------------------------------------------------
    # BACKNESS
    # --------------------------------------------------

    def score_backness(
        self,
        source,
        target,
        weights,
    ):

        if (
            not source.feature.backness
            or not target.feature.backness
        ):
            return None

        weight = weights.get(
            "backness",
            0.0,
        )

        similarity = (
            1.0
            if source.feature.backness
            ==
            target.feature.backness
            else 0.0
        )

        return FeatureComparison(

            feature="backness",

            source=source.feature.backness,

            target=target.feature.backness,

            weight=weight,

            similarity=similarity,

            contribution=round(
                similarity * weight,
                3,
            ),

            explanation=(
                "Same tongue position."
                if similarity == 1
                else "Different tongue position."
            ),
        )
    # --------------------------------------------------
    # ROUNDING
    # --------------------------------------------------

    def score_rounding(
        self,
        source,
        target,
        weights,
    ):

        if (
            not source.feature.rounding
            or not target.feature.rounding
        ):
            return None

        weight = weights.get(
            "rounding",
            0.0,
        )

        similarity = (
            1.0
            if source.feature.rounding
            ==
            target.feature.rounding
            else 0.0
        )

        return FeatureComparison(

            feature="rounding",

            source=source.feature.rounding,

            target=target.feature.rounding,

            weight=weight,

            similarity=similarity,

            contribution=round(
                similarity * weight,
                3,
            ),

            explanation=(
                "Same lip rounding."
                if similarity == 1
                else "Different lip rounding."
            ),
        )
    # --------------------------------------------------
    # LENGTH
    # --------------------------------------------------

    def score_length(
        self,
        source,
        target,
        weights,
    ):

        if (
            not source.feature.length
            or not target.feature.length
        ):
            return None

        weight = weights.get(
            "length",
            0.0,
        )

        similarity = (
            1.0
            if source.feature.length
            ==
            target.feature.length
            else 0.0
        )

        return FeatureComparison(

            feature="length",

            source=source.feature.length,

            target=target.feature.length,

            weight=weight,

            similarity=similarity,

            contribution=round(
                similarity * weight,
                3,
            ),

            explanation=(
                "Same vowel length."
                if similarity == 1
                else "Different vowel length."
            ),
        )