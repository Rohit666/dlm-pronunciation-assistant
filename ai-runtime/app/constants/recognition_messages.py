class RecognitionMessage:
    NO_SPEECH_MESSAGE = (
        "No speech was detected."
    )
    NO_MATCH_MESSAGE = (
        "No matching words were found between the expected speech and the student's speech."
    )
    PARTIAL_MATCH_MESSAGE = (
    "Part of the expected speech was recognized. "
    "The pronunciation assessment will continue "
    "using the matched words."
)