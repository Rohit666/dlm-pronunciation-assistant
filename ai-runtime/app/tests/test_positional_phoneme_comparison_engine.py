import unittest

from app.engines.pronunciation.relationship_engine import (
    RelationshipEngine,
)

from app.models.phoneme_token import (
    PhonemeToken,
)

from app.models.alignment_operation import (
    AlignmentOperation,
)

from app.engines.pronunciation.positional_phoneme_comparison_engine import (
    PositionalPhonemeComparisonEngine,
)


class TestPositionalPhonemeComparisonEngine(
    unittest.TestCase,
):

    @classmethod
    def setUpClass(cls):

       cls.relationship = RelationshipEngine("en")

       cls.knowledge = (
            cls.relationship.knowledge_engine
        )

    def token(self, symbol):

        knowledge = (
            self.knowledge.knowledge[symbol]
        )

        return PhonemeToken(

            symbol=symbol,

            knowledge=knowledge,
        )

    # ---------------------------------------------------------

    def test_exact_match(self):

        engine = (
            PositionalPhonemeComparisonEngine()
        )

        reference = [

            self.token("θ"),
            self.token("r"),
            self.token("iː"),

        ]

        student = [

            self.token("θ"),
            self.token("r"),
            self.token("iː"),

        ]
        print(reference[0].knowledge)
        print(reference[0].knowledge.relationship_cache)
        print(len(reference[0].knowledge.relationship_cache))
        result = engine.compare(
            reference,
            student,
        )

        self.assertEqual(
            len(result.steps),
            3,
        )

        self.assertEqual(
            result.exact_matches,
            3,
        )

        for step in result.steps:

            self.assertTrue(
                step.matched
            )

            self.assertEqual(

                step.operation,

                AlignmentOperation.EXACT_MATCH,

            )

            self.assertIsNotNone(
                step.relationship
            )

    # ---------------------------------------------------------

    def test_substitution_keeps_position(self):

        engine = (
            PositionalPhonemeComparisonEngine()
        )

        reference = [

            self.token("θ"),
            self.token("r"),
            self.token("iː"),

        ]

        student = [

            self.token("f"),
            self.token("ɔː"),
            self.token("r"),

        ]

        result = engine.compare(
            reference,
            student,
        )

        self.assertEqual(
            len(result.steps),
            3,
        )

        self.assertEqual(
            result.exact_matches,
            0,
        )

        expected = [

            ("θ", "f"),

            ("r", "ɔː"),

            ("iː", "r"),

        ]

        for index, step in enumerate(
            result.steps
        ):

            self.assertEqual(
                step.expected.symbol,
                expected[index][0],
            )

            self.assertEqual(
                step.detected.symbol,
                expected[index][1],
            )

            self.assertFalse(
                step.matched
            )

            self.assertEqual(

                step.operation,

                AlignmentOperation.SUBSTITUTION,

            )

            self.assertIsNotNone(
                step.relationship
            )

    # ---------------------------------------------------------

    def test_deletion(self):

        engine = (
            PositionalPhonemeComparisonEngine()
        )

        reference = [

            self.token("θ"),
            self.token("r"),
            self.token("iː"),

        ]

        student = [

            self.token("θ"),
            self.token("r"),

        ]

        result = engine.compare(
            reference,
            student,
        )

        self.assertEqual(
            len(result.steps),
            3,
        )

        self.assertEqual(
            result.exact_matches,
            2,
        )

        deletion = result.steps[2]

        self.assertEqual(
            deletion.expected.symbol,
            "iː",
        )

        self.assertIsNone(
            deletion.detected,
        )

        self.assertFalse(
            deletion.matched,
        )

        self.assertEqual(

            deletion.operation,

            AlignmentOperation.DELETION,

        )

    # ---------------------------------------------------------

    def test_insertion(self):

        engine = (
            PositionalPhonemeComparisonEngine()
        )

        reference = [

            self.token("θ"),
            self.token("r"),

        ]

        student = [

            self.token("θ"),
            self.token("r"),
            self.token("iː"),

        ]

        result = engine.compare(
            reference,
            student,
        )

        self.assertEqual(
            len(result.steps),
            3,
        )

        self.assertEqual(
            result.exact_matches,
            2,
        )

        insertion = result.steps[2]

        self.assertIsNone(
            insertion.expected,
        )

        self.assertEqual(
            insertion.detected.symbol,
            "iː",
        )

        self.assertFalse(
            insertion.matched,
        )

        self.assertEqual(

            insertion.operation,

            AlignmentOperation.INSERTION,

        )

    # ---------------------------------------------------------
#
# This test protects the core philosophy of
# DLM Pronunciation Assistant.
#
# Pronunciation assessment compares
# phonemes POSITIONALLY.
#
# It MUST NEVER reorder phonemes
# to maximize similarity.
#
    def test_preserves_order(self):

        """
        This is the most important rule
        of the new engine.

        The engine MUST NEVER reorder
        phonemes.

        Expected:
            θ r iː

        Detected:
            f ɔː r

        MUST stay

            θ -> f
            r -> ɔː
            iː -> r

        and NOT

            θ -> f
            r -> r
            iː -> ɔː
        """

        engine = (
            PositionalPhonemeComparisonEngine()
        )

        reference = [

            self.token("θ"),
            self.token("r"),
            self.token("iː"),

        ]

        student = [

            self.token("f"),
            self.token("ɔː"),
            self.token("r"),

        ]

        result = engine.compare(
            reference,
            student,
        )

        self.assertEqual(
            result.steps[0].detected.symbol,
            "f",
        )

        self.assertEqual(
            result.steps[1].detected.symbol,
            "ɔː",
        )

        self.assertEqual(
            result.steps[2].detected.symbol,
            "r",
        )


if __name__ == "__main__":

    unittest.main()