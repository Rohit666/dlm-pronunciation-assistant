from app.models.alignment_operation import (
    AlignmentOperation,
)

from app.models.word_alignment_result import (
    WordAlignmentResult,
)

from app.models.word_alignment_step import (
    WordAlignmentStep,
)

from app.engines.pronunciation.word_similarity_engine import (
    WordSimilarityEngine,
)


class WordAlignmentEngine:

    MATCH_SCORE = 2.0
    GAP_SCORE = -1.0

    def __init__(self,language="en",):

        self.similarity = (
            WordSimilarityEngine()
        )

    def align(
        self,
        reference_words,
        student_words,
    ):

        rows = len(reference_words)
        cols = len(student_words)

        score = [
            [0.0] * (cols + 1)
            for _ in range(rows + 1)
        ]

        direction = [
            [None] * (cols + 1)
            for _ in range(rows + 1)
        ]

        # Initialize first column
        for i in range(1, rows + 1):

            score[i][0] = (
                score[i - 1][0]
                + self.GAP_SCORE
            )

            direction[i][0] = "UP"

        # Initialize first row
        for j in range(1, cols + 1):

            score[0][j] = (
                score[0][j - 1]
                + self.GAP_SCORE
            )

            direction[0][j] = "LEFT"

        # Fill matrix
        for i in range(1, rows + 1):

            reference = (
                reference_words[i - 1]
            )

            for j in range(1, cols + 1):

                student = (
                    student_words[j - 1]
                )

                similarity = (
                    self.similarity.similarity(
                        reference.normalized,
                        student.normalized,
                    )
                )

                diagonal = (
                    score[i - 1][j - 1]
                    + similarity
                    * self.MATCH_SCORE
                )

                up = (
                    score[i - 1][j]
                    + self.GAP_SCORE
                )

                left = (
                    score[i][j - 1]
                    + self.GAP_SCORE
                )

                best = max(
                    diagonal,
                    up,
                    left,
                )

                score[i][j] = best

                if best == diagonal:

                    direction[i][j] = "DIAGONAL"

                elif best == up:

                    direction[i][j] = "UP"

                else:

                    direction[i][j] = "LEFT"

        result = WordAlignmentResult(
            score=score[rows][cols]
        )

        i = rows
        j = cols

        while i > 0 or j > 0:

            move = direction[i][j]

            if move == "DIAGONAL":

                reference = (
                    reference_words[i - 1]
                )

                student = (
                    student_words[j - 1]
                )

                similarity = (
                    self.similarity.similarity(
                        reference.normalized,
                        student.normalized,
                    )
                )

                operation = (
                    AlignmentOperation.EXACT_MATCH
                    if similarity == 1.0
                    else AlignmentOperation.SUBSTITUTION
                )

                result.steps.append(

                    WordAlignmentStep(

                        reference=reference,

                        student=student,

                        operation=operation,

                        similarity=round(
                            similarity,
                            2,
                        ),

                    )

                )

                i -= 1
                j -= 1

            elif move == "UP":

                result.steps.append(

                    WordAlignmentStep(

                        reference=reference_words[
                            i - 1
                        ],

                        operation=AlignmentOperation.DELETION,

                    )

                )

                i -= 1

            else:

                result.steps.append(

                    WordAlignmentStep(

                        student=student_words[
                            j - 1
                        ],

                        operation=AlignmentOperation.INSERTION,

                    )

                )

                j -= 1

        result.steps.reverse()

        return result