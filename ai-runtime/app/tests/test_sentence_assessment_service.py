from app.models.word_assessment import (
    WordAssessment,
)

from app.services.assessment.sentence_assessment_service import (
    SentenceAssessmentService,
)

words = [

    WordAssessment(

        word="The",

        accuracy=100,

        similarity_total=2.0,

    ),

    WordAssessment(

        word="three",

        accuracy=86,

        similarity_total=2.58,

    ),

    WordAssessment(

        word="boys",

        accuracy=100,

        similarity_total=3.0,

    ),

]

service = (
    SentenceAssessmentService()
)

assessment = service.assess(

    sentence="The three boys",

    word_assessments=words,

)

print()

print("Sentence :", assessment.sentence)

print("Accuracy :", assessment.accuracy)

print("Words :", assessment.total_words)

print("Weak :", assessment.weak_words)