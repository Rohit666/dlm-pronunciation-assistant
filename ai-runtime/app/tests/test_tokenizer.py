from app.engines.pronunciation.ipa_tokenizer import ( 
    IPATokenizer,
)

tokenizer = IPATokenizer()

tokens = tokenizer.tokenize(
    "ˈeɪ_b_əl"
)

for token in tokens:

    print(token)