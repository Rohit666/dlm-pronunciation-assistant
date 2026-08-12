from copy import deepcopy

from app.models.pronunciation_document import (
    PronunciationDocument,
)


class RecognitionNormalizer:

    def normalize(
        self,
        reference: PronunciationDocument,
        student: PronunciationDocument,
    ) -> tuple[PronunciationDocument, int]:
        """
        Returns a recognition-specific copy of the student's
        pronunciation document together with the number of
        normalizations applied.
        """

        recognition_student = deepcopy(student)

        merges = self._merge_adjacent_words(
            reference,
            recognition_student,
        )

        return recognition_student, merges

    def _merge_adjacent_words(
        self,
        reference: PronunciationDocument,
        student: PronunciationDocument,
    ) -> int:

        #
        # Fast lookup of all reference words.
        #
        reference_words = {
            word.normalized
            for word in reference.words
        }

        merged_words = []

        merges = 0

        i = 0

        while i < len(student.words):

            current = student.words[i]

            #
            # Last word cannot be merged.
            #
            if i == len(student.words) - 1:

                merged_words.append(current)
                break

            next_word = student.words[i + 1]

            candidate = (
                current.normalized
                + next_word.normalized
            )

            #
            # Merge only if the combined word
            # exists in the reference lesson.
            #
            if self._can_merge(
                candidate,
                reference_words
            ):
            #if candidate in reference_words:
                merged = deepcopy(current)

                #
                # Preserve formatting exactly as
                # Whisper produced it.
                #
                merged.word = (
                    current.word + next_word.word
                )

                merged.normalized = candidate

                merged_words.append(merged)

                merges += 1

                i += 2

                continue

            merged_words.append(current)

            i += 1

        student.words = merged_words

        return merges
    def _can_merge(
        self,
        candidate: str,
        reference_words: set[str],
) -> bool:

        return candidate in reference_words