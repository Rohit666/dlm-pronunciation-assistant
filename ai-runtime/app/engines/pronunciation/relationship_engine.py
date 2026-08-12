from app.models.relationship_result import (
    RelationshipResult,
)
from app.engines.pronunciation.knowledge_engine import (
    KnowledgeEngine,
)
from app.engines.pronunciation.feature_distance_engine import (
    FeatureDistanceEngine,
)

from app.engines.pronunciation.feature_weight_engine import (
    FeatureWeightEngine,
)
from app.models.feature_comparison import (
    FeatureComparison,
)
from app.engines.pronunciation.feature_scorer import (
    FeatureScorer,
)
class RelationshipEngine:
    def __init__(
    self,
    language="en",
):

        self.language = language

        self.knowledge_engine = KnowledgeEngine(
            language,
        )
        self.distance_engine = (
            FeatureDistanceEngine(
                language,
            )
        )
        self.weight_engine = (
            FeatureWeightEngine(
                language,
            )
        )
        self.feature_scorer = FeatureScorer(
    self.distance_engine,
    self.weight_engine,
)
        self.build_relationships(
    self.knowledge_engine.knowledge
)
    def build_relationships(
    self,
    knowledge_map,
):

        for source in knowledge_map.values():

            if source is None:
                continue

            source.relationship_cache.clear()

            for target in knowledge_map.values():

                if target is None:
                    continue

                relationship = self.build_relationship(
                    source,
                    target,
                )

                source.relationship_cache[
                    target.feature.symbol
                ] = relationship

    def build_relationship(
    self,
    source,
    target,
):

        if (
            source.feature.symbol
            ==
            target.feature.symbol
        ):

            return RelationshipResult(

                target_symbol=target.feature.symbol,

                similarity=1.0,

                penalty=0.0,

                changed_features=[],

                explanation=[
                    "Exact phoneme match"
                ],

                comparisons=[],
            )

        similarity, changed, explanation, comparisons = (
            self.calculate_similarity(
                source,
                target,
            )
        )

        return self.create_result(

            target,

            similarity,

            changed,

            explanation,

            comparisons,
        )
    
    def calculate_similarity(
    self,
    source,
    target,
):

        similarity = 0.0
        changed = []
        explanation = []
        comparisons = []
        consonant_weights = self.weight_engine.for_type(
            "consonant"
        )
        vowel_weights = self.weight_engine.for_type(
            "vowel"
        )
        if source.feature.type == "consonant":
            weights = consonant_weights
        elif source.feature.type == "vowel":
            weights = vowel_weights
        else:
            weights = {}
        feature_scores = [
            self.feature_scorer.score_type(
                source,
                target,
                weights,
            ),
            self.feature_scorer.score_place(
                source,
                target,
                weights,
            ),
            self.feature_scorer.score_manner(
                source,
                target,
                weights,
            ),
            self.feature_scorer.score_voicing(
                source,
                target,
                weights,
            ),
        ]
        if source.feature.type == "vowel":
            feature_scores.extend([
                self.feature_scorer.score_height(
                    source,
                    target,
                    vowel_weights,
                ),
                self.feature_scorer.score_backness(
                    source,
                    target,
                    vowel_weights,
                ),
                self.feature_scorer.score_rounding(
                    source,
                    target,
                    vowel_weights,
                ),
                self.feature_scorer.score_length(
                    source,
                    target,
                    vowel_weights,
                ),
            ])
        for comparison in feature_scores:
            if comparison is None:
                continue
            similarity += comparison.contribution
            comparisons.append(
                comparison
            )
            if comparison.similarity < 1.0:
                changed.append(
                    comparison.feature
                )
        return (
            similarity,
            changed,
            explanation,
            comparisons,
        )
    
    def create_result(
    self,
    target,
    similarity,
    changed,
    explanation,
    comparisons,
):

        similarity = round(
            min(similarity, 1.0),
            3,
        )

        penalty = round(
            1.0 - similarity,
            3,
        )

        if not changed:

            explanation.append(
                "Very similar articulation."
            )

        else:

            explanation.append(
                "Different: "
                + ", ".join(changed)
            )

        return RelationshipResult(

            target_symbol=target.feature.symbol,

            similarity=similarity,

            penalty=penalty,

            changed_features=changed,

            explanation=explanation,

            comparisons=comparisons,
        )    