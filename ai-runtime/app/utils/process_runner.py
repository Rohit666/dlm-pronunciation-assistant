import subprocess


class ProcessRunner:

    @staticmethod
    def run(command):

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )

        return result.stdout.strip()