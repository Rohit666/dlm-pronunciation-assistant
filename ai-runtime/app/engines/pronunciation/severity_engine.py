from app.constants.severity import Severity
class SeverityEngine:

    def calculate(
        self,
        similarity,
    ):

        if similarity >= 0.90:
            return Severity.VERY_LOW
        if similarity >= 0.75:
            return Severity.LOW
        if similarity >= 0.50:
            return Severity.MEDIUM
        if similarity >= 0.25:
            return Severity.HIGH
        return Severity.VERY_HIGH