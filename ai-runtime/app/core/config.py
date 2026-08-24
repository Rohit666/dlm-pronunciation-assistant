from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
APP_NAME = "DLM AI Runtime"
VERSION = "1.0.0"
HOST = "127.0.0.1"
PORT = 8001
LOG_FOLDER = BASE_DIR / "logs"
TEMP_FOLDER = BASE_DIR / "temp"
DEFAULT_LANGUAGE = "en"
DEFAULT_ACCENT = "neutral"
DEFAULT_VOICE = "neutral"
LOG_FOLDER.mkdir(exist_ok=True)
TEMP_FOLDER.mkdir(exist_ok=True)
DEFAULT_WHISPER_MODEL = "models/ggml-base.en.bin"