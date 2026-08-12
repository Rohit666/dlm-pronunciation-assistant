from pathlib import Path
import subprocess
import tempfile


class AudioPreprocessor:

    def __init__(self, ffmpeg_binary: str):
        self.ffmpeg = ffmpeg_binary

    def convert_to_wav(self, input_path: str) -> str:
        input_file = Path(input_path)

        output_file = Path(
            tempfile.gettempdir()
        ) / f"{input_file.stem}_16k.wav"

        command = [
            self.ffmpeg,
            "-y",
            "-i",
            str(input_file),
            "-ar",
            "16000",
            "-ac",
            "1",
            "-c:a",
            "pcm_s16le",
            str(output_file),
        ]

        subprocess.run(
            command,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        return str(output_file)