from typing import Set, Tuple, List, Dict
from collections import defaultdict


def parse_word_line(line: str) -> Tuple[Tuple[str, str], ...]:
    ''' parses word line to get POS and features '''

    line_parts = line.split('\t', 5)
    pos, feature = line_parts[3: 5]
    data = [
        tuple(k_v.split('='))
        for k_v in feature.split('|')
        if k_v != '_'  # `_` denotes absence according to Universal Dependencies
    ]
    data.append(('POS', pos))
    
    # check multiple keys of the same kind
    if len([x[0] for x in data]) > len(set(x[0] for x in data)):
        print(f'multiple keys in {data}')

    # return tuple of tuples (key, value) sorted by key
    return tuple(sorted(data, key = lambda x: x[0]))


def get_possible_values(variations: List[Tuple[Tuple[str, str], ...]]) -> Dict[str, List[str]]:
    ''' get possible feature values from variations '''

    possible_values = defaultdict(set)
    for variation in variations:
        for k, v in variation:
            possible_values[k].add(v)
    return {k: list(v) for k, v in possible_values.items()}


# prepare all variations from vertical data
variations: Set[Tuple[Tuple[str, str], ...]] = set()
with open('vertikala_pdt', 'r') as f:
    for line in f:
        if line.strip().startswith('<'):  # skip lines with xml tags
            continue
        variations.add(parse_word_line(line))
variations: List[Tuple[Tuple[str, str], ...]] = list(variations)


# examples of filters, can be chained
# nouns = list(filter(lambda x: ('POS', 'NOUN') in x, variations))
# verbs = list(filter(lambda x: ('POS', 'VERB') in x, variations))
# punct = list(filter(lambda x: ('POS', 'PUNCT') in x, variations))
