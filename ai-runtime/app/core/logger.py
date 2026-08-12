import logging

from app.core.config import LOG_FOLDER

logger = logging.getLogger("dlm-ai")

logger.setLevel(logging.INFO)

formatter = logging.Formatter(
    "%(asctime)s | %(levelname)s | %(message)s"
)

file_handler = logging.FileHandler(
    LOG_FOLDER / "runtime.log",
    encoding="utf-8",
)

file_handler.setFormatter(formatter)

logger.addHandler(file_handler)