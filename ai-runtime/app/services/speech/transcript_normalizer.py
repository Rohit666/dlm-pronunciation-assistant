import re


class TranscriptNormalizer:

    BRACKET_PATTERN = re.compile(r"\[[^\]]+\]")
    PAREN_PATTERN = re.compile(r"\([^)]+\)")
    SPACE_PATTERN = re.compile(r"\s+")

    @classmethod
    def normalize(cls, transcript: str) -> str:

        if transcript is None:
            return ""

        text = transcript.strip()

        #
        # Remove Whisper annotations
        #
        text = cls.BRACKET_PATTERN.sub("", text)

        text = cls.PAREN_PATTERN.sub("", text)

        #
        # Collapse whitespace
        #
        text = cls.SPACE_PATTERN.sub(" ", text)

        text = text.strip()

        return text