from app.engines.pronunciation.alignment_engine import (
    AlignmentEngine,
)

engine = AlignmentEngine()

matrix = engine.build_matrix(

    reference_length=4,

    student_length=3,

)
for row in matrix:
    print(matrix[0][0])