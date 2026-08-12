from pathlib import Path


from app.core.runtime_manager import RuntimeManager
from app.utils.process_runner import ProcessRunner
from app.engines.pronunciation.ipa_tokenizer import ( 
    IPATokenizer,
)

class PhonemeService:

    def __init__(self):

        runtime = RuntimeManager.espeak_provider()
        if not runtime.available:
            raise RuntimeError(runtime.message)
        self.binary = RuntimeManager.espeak_binary()
        self.tokenizer = IPATokenizer()
    def text_to_ipa(
        self,
        text: str,
    ):

        command = [
            str(self.binary),
            "-q",
            "--ipa=3",
            text,
        ]
        ipa = ProcessRunner.run(command)
        return ipa
    
    def tokenize(
        self,
        ipa,
    ):
        return self.tokenizer.tokenize(
        ipa
    )
    def split_words(
        self,
        sentence_ipa,
    ):
        return sentence_ipa.split()