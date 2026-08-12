from app.models.learning_diagnosis import (
    LearningDiagnosis,
)

from app.models.learning_need import (
    LearningNeed,
)

from app.constants.learning_need_type import LearningNeedType
from app.models.alignment_operation import (
    AlignmentOperation,
)

class LearningDiagnosisService:
    
    def diagnose(
        self,
        assessment_document,
    ):

        diagnosis = LearningDiagnosis()

        aggregated = {}

        #
        # Overall accuracy
        #
        pronunciation = (
            assessment_document.pronunciation
        )

        if pronunciation:

            diagnosis.overall_accuracy = (
                pronunciation.overall_accuracy
            )

        #
        # Analyse every assessed word
        #
        for word in assessment_document.words:

            pronunciation = (
                word.pronunciation
            )

            if pronunciation is None:
                continue

            comparison = (
                pronunciation.phoneme_comparison
            )

            if comparison is None:
                continue

            #
            # Inspect every positional phoneme
            #
            for step in comparison.steps:

                #
                # Exact phoneme:
                # nothing to diagnose.
                #
                if step.matched:
                    continue

                #
                # No expected phoneme means
                # this is an insertion.
                #
                if step.expected is None:
                    continue

                target = (
                    step.expected.symbol
                )

                if target not in aggregated:

                    aggregated[target] = {
                        "occurrences": 0,
                        "substitutions": 0,
                        "deletions": 0,
                    }

                item = (
                    aggregated[target]
                )

                item["occurrences"] += 1

                if (
                    step.operation
                    == AlignmentOperation.SUBSTITUTION
                ):

                    item["substitutions"] += 1

                elif (
                    step.operation
                    == AlignmentOperation.DELETION
                ):

                    item["deletions"] += 1

        #
        # Build learning needs
        #
        for target, item in aggregated.items():

            diagnosis.needs.append(

                LearningNeed(

                    type=LearningNeedType.PHONEME,

                    target=target,

                    occurrences=item[
                        "occurrences"
                    ],

                    attributes=self._attributes(
                        item
                    ),

                )
            )

        #
        # Highest occurrence first
        #
        diagnosis.needs.sort(
            key=lambda need: (
                -need.occurrences,
                need.target,
            )
        )

        return diagnosis
    def _attributes(
            self,
            item,
        ):
            attributes = []
    
            if item["substitutions"] > 0:
                attributes.append(
                    "substitution"
                )
    
            if item["deletions"] > 0:
                attributes.append(
                    "missing_phoneme"
                )
    
            return attributes