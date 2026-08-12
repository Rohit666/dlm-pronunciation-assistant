from enum import Enum
class LearningNeedType(str, Enum):
    PHONEME = "phoneme"
    WORD_STRESS = "word_stress"
    SENTENCE_STRESS = "sentence_stress"
    FLUENCY = "fluency"
    RHYTHM = "rhythm"
    INTONATION = "intonation"
    PAUSE = "pause"
    LINKING = "linking"
    VOCABULARY = "vocabulary"
    GRAMMAR = "grammar"
    LISTENING = "listening"