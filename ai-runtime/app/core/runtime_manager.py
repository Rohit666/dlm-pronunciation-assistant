import platform

from app.providers.whisper_provider import WhisperProvider
from app.providers.ffmpeg_provider import FFmpegProvider
from app.providers.espeak_provider import ESpeakProvider


class RuntimeManager:

    # --------------------------------------------------
    # Platform
    # --------------------------------------------------

    @classmethod
    def platform(cls):
        return platform.system()

    # --------------------------------------------------
    # Whisper
    # --------------------------------------------------

    @classmethod
    def whisper_binary(cls):
        return WhisperProvider.binary()

    @classmethod
    def whisper_model(cls):
        return WhisperProvider.model()

    @classmethod
    def whisper_provider(cls):
        return WhisperProvider.validate()

    # --------------------------------------------------
    # FFmpeg
    # --------------------------------------------------

    @classmethod
    def ffmpeg_binary(cls):
        return FFmpegProvider.binary()

    @classmethod
    def ffmpeg_provider(cls):
        return FFmpegProvider.validate()

    # --------------------------------------------------
    # eSpeak
    # --------------------------------------------------

    @classmethod
    def espeak_binary(cls):
        return ESpeakProvider.binary()

    @classmethod
    def espeak_provider(cls):
        return ESpeakProvider.validate()

    # --------------------------------------------------
    # Runtime
    # --------------------------------------------------

    @classmethod
    def validate_runtime(cls):

        whisper = cls.whisper_provider()

        ffmpeg = cls.ffmpeg_provider()

        espeak = cls.espeak_provider()

        return {

            "platform": cls.platform(),

            "whisper": {

                "available": whisper.available,

                "source": whisper.source,

                "path": whisper.path,

                "version": whisper.version,

                "model": cls.whisper_model().name,

            },

            "ffmpeg": {

                "available": ffmpeg.available,

                "source": ffmpeg.source,

                "path": ffmpeg.path,

                "version": ffmpeg.version,

            },

            "espeak": {

                "available": espeak.available,

                "source": espeak.source,

                "path": espeak.path,

                "version": espeak.version,

            },

        }