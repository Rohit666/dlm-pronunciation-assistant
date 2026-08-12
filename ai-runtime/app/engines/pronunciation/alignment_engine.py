from app.core.resource_manager import ResourceManager

from app.engines.pronunciation.relationship_engine import (
    RelationshipEngine,
)
from app.models.alignment_cell import (
    AlignmentCell,
)
from app.models.alignment_operation import (
    AlignmentOperation,
)
from app.models.alignment_result import (
    AlignmentResult,
)

from app.models.alignment_step import (
    AlignmentStep,
)

class AlignmentEngine:

    def __init__(
        self,
        language="en",
    ):

        self.language = language

        self.relationship_engine = (
            RelationshipEngine(
                language,
            )
        )

        rules = (
            ResourceManager
            .pronunciation(language)
            .alignment_rules()
        )

        self.gap_penalty = rules["gapPenalty"]

        self.minimum_similarity = rules[
            "minimumSimilarity"
        ]

        self.exact_match_threshold = rules[
            "exactMatchThreshold"
        ]

    # --------------------------------------------------
    # MATRIX
    # --------------------------------------------------

    def build_matrix(
        self,
        reference_length,
        student_length,
    ):

        rows = student_length + 1

        cols = reference_length + 1

        matrix = [
            [
                AlignmentCell()
                for _ in range(cols)
            ]
            for _ in range(rows)
        ]

        # First row

        for col in range(1, cols):
            matrix[0][col].score = round(
                matrix[0][col - 1].score
                + self.gap_penalty,
                3,
            )
            matrix[0][col].previous_row = 0
            matrix[0][col].previous_col = col - 1
            matrix[0][col].operation = (
                AlignmentOperation.DELETION
            )

        # First column

        for row in range(1, rows):
            matrix[row][0].score = round(
                matrix[row - 1][0].score
                + self.gap_penalty,
                3,
            )
            matrix[row][0].previous_row = row - 1
            matrix[row][0].previous_col = 0
            matrix[row][0].operation = (
                AlignmentOperation.INSERTION
            )
        return matrix

    # --------------------------------------------------
    def relationship_score(
        self,
        reference,
        student,
    ):
        knowledge = (
            self.relationship_engine
            .knowledge_engine
            .knowledge
        )
        reference_phoneme = knowledge[
            reference.symbol
        ]
        relationship = (
            reference_phoneme
            .relationship_cache[
                student.symbol
            ]
        )
        return relationship
    # --------------------------------------------------

    def diagonal_score(
        self,
        matrix,
        row,
        col,
        relationship,
    ):
        return (
            matrix[row - 1][col - 1].score
            +
            relationship.similarity
        )
    # --------------------------------------------------

    def left_score(
        self,
        matrix,
        row,
        col,
    ):
        return (
            matrix[row][col - 1].score
            +
            self.gap_penalty
        )
    # --------------------------------------------------

    def up_score(
        self,
        matrix,
        row,
        col,
    ):
        return (
            matrix[row - 1][col].score
            +
            self.gap_penalty
        )
    # --------------------------------------------------
    
    def determine_operation(
        self,
        relationship,
    ):
        if (
            relationship.similarity
            >= self.exact_match_threshold
        ):
            return AlignmentOperation.EXACT_MATCH
        return AlignmentOperation.SIMILAR_MATCH
   
    # --------------------------------------------------

    def fill_matrix(
        self,
        matrix,
        reference,
        student,
    ):
        for row in range(
            1,
            len(matrix),
        ):
            for col in range(
                1,
                len(matrix[0]),
            ):
                relationship = (
                    self.relationship_score(
                        reference[col - 1],
                        student[row - 1],
                    )
                )
                diagonal = self.diagonal_score(
                    matrix,
                    row,
                    col,
                    relationship,
                )
                left = self.left_score(
                    matrix,
                    row,
                    col,
                )
                up = self.up_score(
                    matrix,
                    row,
                    col,
                )
                best = max(
                    diagonal,
                    left,
                    up,
                )
                cell = matrix[row][col]

                cell.score = round(
                    best,
                    3,
                )
                if best == diagonal:

                    cell.previous = (
                        row - 1,
                        col - 1,
                    )

                    cell.relationship = (
                        relationship
                    )

                    cell.operation = (
                        self.determine_operation(
                            relationship
                        )
                    )
                elif best == left:

                    cell.previous = (
                        row,
                        col - 1,
                    )

                    cell.operation = (
                        AlignmentOperation.DELETION
                    )
                else:
                    cell.previous = (
                        row - 1,
                        col,
                    )
                    cell.operation = (
                        AlignmentOperation.INSERTION
                    )
        return matrix
   # --------------------------------------------------

    def align(
        self,
        reference,
        student,
    ):
        matrix = self.build_matrix(
            len(reference),
            len(student),
        )

        matrix = self.fill_matrix(
            matrix,
            reference,
            student,
        )
        return self.traceback(
            matrix,
            reference,
            student,
        )
    
    # --------------------------------------------------

    def traceback(
        self,
        matrix,
        reference,
        student,
    ):
        
        row = len(student)
        col = len(reference)
        result = AlignmentResult()
        while row > 0 or col > 0:
            cell = matrix[row][col]
            reference_symbol = None
            student_symbol = None
            if col > 0:
                reference_symbol = (
                    reference[col - 1].symbol
                )
            if row > 0:
                student_symbol = (
                    student[row - 1].symbol
                )
            if (
                cell.operation
                == AlignmentOperation.INSERTION
            ):
                reference_symbol = None
            elif (
                cell.operation
                == AlignmentOperation.DELETION
            ):
                student_symbol = None
            result.steps.append(
                AlignmentStep(
                    reference_symbol=reference_symbol,
                    student_symbol=student_symbol,
                    operation=cell.operation,
                    similarity=(
                        0.0
                        if cell.relationship is None
                        else cell.relationship.similarity
                    ),
                    relationship=cell.relationship,
                )
            )
            if cell.previous is None:
                break
            row, col = cell.previous
        result.steps.reverse()
        result.score = matrix[
            len(student)
        ][
            len(reference)
        ].score
        return result