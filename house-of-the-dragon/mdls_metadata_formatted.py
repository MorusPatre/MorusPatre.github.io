import os
import csv
import subprocess
import argparse
import plistlib
from fractions import Fraction
import ast # For safe evaluation of string literals
import unicodedata # For character mapping
import re # For sorting logic

# --- DATA MAPPINGS & CONFIG ---
# Map of characters to the actors who play them
CHARACTER_TO_ACTORS_MAP = {
    'Geralt of Rivia': ['Henry Cavill', 'Liam Hemsworth'], 'Mousesack': ['Adam Levy'],
    'Téa': ['Adele Oni'], 'Mother Nenneke': ['Adjoa Andoh'], 'Vereena': ['Agnes Born'],
    'Lydia van Bredevoort': ['Aisha Fabienne Ross'], 'Voleth Meir': ['Ania Marson'],
    'Triss Merigold': ['Anna Shaffer'], 'Yennefer of Vengerberg': ['Anya Chalotra'],
    'Duny / Emperor Emhyr var Emreis': ['Bart Edwards'], 'Eskel': ['Basil Eidenbenz'],
    'Eist Tuirseach': ['Björn Hlynur Haraldsson'], 'Philippa Eilhart': ['Cassie Clare'],
    'Rience': ['Chris Fulton'], 'Véa': ['Colette Dalal Tchantcho'], 'Cahir': ['Eamon Farren'],
    'Renfri': ['Emma Appleton'], 'Princess Cirilla \'Ciri\' of Cintra': ['Freya Allan'],
    'Sigismund Dijkstra': ['Graham McTavish'], 'Queen Kalis of Lyria': ['Isobel Laidler'],
    'Young Alderman': ['Jack Bandeira'], 'Yarpen Zigrin': ['Jeremy Crawford'],
    'Queen Calanthe': ['Jodhi May'], 'Jaskier': ['Joey Batey'], 'Vanielle of Brugge': ['Judit Fekete'],
    'Yanick Brass': ['Kain Francis'], 'Gage': ['Kaine Zajaz'], 'Vesemir': ['Kim Bodnia'],
    'Nivellen': ['Kristofer Hivju'], 'Stregobor': ['Lars Mikkelsen'], 'Fenn': ['Liz Carr'],
    'Sir Lazlo': ['Maciej Musiał'], 'Vilgefortz of Roggeveen': ['Mahesh Jadu'],
    'Francesca Findabair': ['Mecia Simson'], 'Fringilla Vigo': ['Mimî M. Khayisa'],
    'Tissaia de Vries': ['MyAnna Buring'], 'Valdo Marx': ['Nathan Armakwei Laryea'],
    'Lambert': ['Paul Bullion'], 'Hemet': ['Philippe Spall'], 'Fletcher': ['Roderick Hill'],
    'Borch Three Jackdaws': ['Ron Cook'], 'Istredd': ['Royce Pierreson'],
    'Lucas Corto': ['Simeon Dyer'], 'Codringher': ['Simon Callow'],
    'Martin': ['Sonny Ashbourne Serkis'], 'Fabio Sachs': ['Stuart Thompson'],
    'Artorius Vigo': ['Terence Maynard'], 'Anica': ['Szandra V Asztalos'],
    'Sabrina Glevissig': ['Therica Wilson-Read'], 'Danek': ['Tobi Bamtefa'],
    'Filavandrel': ['Tom Canton'], 'Dara': ['Wilson Mbomio'], 'Coen': ['Yasen Atour'],
}

# Automatically create the reverse mapping from actor to character
ACTOR_TO_CHARACTER_MAP = {}
for character, actors in CHARACTER_TO_ACTORS_MAP.items():
    for actor in actors:
        normalized_actor = unicodedata.normalize('NFC', actor)
        ACTOR_TO_CHARACTER_MAP[normalized_actor] = character

# --- CHANGE START ---
# Define the exact columns to appear in the final CSV, in order.
FINAL_CSV_HEADERS_KMD = [
    '_relative_filepath', 'kMDItemFSName', '_season', '_episode', 'kMDItemUserTags',
    '_characters', 'kMDItemKeywords', 'kMDItemTitle', 'kMDItemFSSize',
    '_combined_dimensions', 'kMDItemXMPCredit', 'kMDItemAcquisitionMake',
    'kMDItemAcquisitionModel', 'kMDItemColorSpace', 'kMDItemProfileName',
    'kMDItemFocalLength', 'kMDItemDescription', 'kMDItemHasAlphaChannel',
    'kMDItemRedEyeOnOff', 'kMDItemMeteringMode', 'kMDItemFNumber',
    'kMDItemExposureProgram', 'kMDItemExposureTimeSeconds', 'kMDItemInstructions',
]
# --- CHANGE END ---

# Derive the actual kMDItem keys we need to fetch from the mdls command.
MDLS_KEYS_TO_FETCH = sorted(list(set(
    [k for k in FINAL_CSV_HEADERS_KMD if not k.startswith('_')] +
    ['kMDItemPixelWidth', 'kMDItemPixelHeight']
)))

# Pre-build the command-line arguments for mdls for maximum efficiency
MDLS_COMMAND_ARGS = []
for key in MDLS_KEYS_TO_FETCH:
    MDLS_COMMAND_ARGS.extend(['-name', key])

# Mappings for metadata translation
METADATA_MAPPINGS = {
    'kMDItemMeteringMode': {
        0: 'Unknown', 1: 'Average', 2: 'Center-weighted average', 3: 'Spot',
        4: 'Multi-spot', 5: 'Pattern', 6: 'Partial', 255: 'Other'
    },
    'kMDItemExposureProgram': {
        0: 'Not defined', 1: 'Manual', 2: 'Normal program', 3: 'Aperture priority',
        4: 'Shutter priority', 5: 'Creative program (biased toward depth of field)',
        6: 'Action program (biased toward fast shutter speed)',
        7: 'Portrait mode (for closeup photos with the background out of focus)',
        8: 'Landscape mode (for landscape photos with the background in focus)'
    },
    'kMDItemHasAlphaChannel': {True: 'Yes', False: 'No'},
    'kMDItemRedEyeOnOff': {True: 'Yes', False: 'No'}
}

# --- CHANGE START ---
# Mappings for human-readable column headers
HEADER_DISPLAY_NAMES = {
    '_relative_filepath': 'Relative File path', '_season': 'Season', '_episode': 'Episode',
    'kMDItemFSName': 'File name', 'kMDItemFSSize': 'Size', 'kMDItemPixelWidth': 'Pixel width',
    'kMDItemPixelHeight': 'Pixel height', 'kMDItemMeteringMode': 'Metering mode',
    'kMDItemExposureProgram': 'Exposure program', '_combined_dimensions': 'Dimensions',
    'kMDItemAcquisitionMake': 'Device make', 'kMDItemAcquisitionModel': 'Device model',
    'kMDItemProfileName': 'Color profile', 'kMDItemColorSpace': 'Color space',
    'kMDItemRedEyeOnOff': 'Red eye', 'kMDItemHasAlphaChannel': 'Alpha channel',
    'kMDItemInstructions': 'Instructions', 'kMDItemXMPCredit': 'Credit',
    'kMDItemFNumber': 'F number', 'kMDItemUserTags': 'Actors', '_characters': 'Characters',
    'kMDItemTitle': 'Title', 'kMDItemFocalLength': 'Focal length',
    'kMDItemDescription': 'Description', 'kMDItemExposureTimeSeconds': 'Exposure time',
    'kMDItemKeywords': 'Keywords',
}
# --- CHANGE END ---


# --- SORTING HELPERS ---
FOLDER_TO_SEASON_MAP = {'/WW/': 1, '/MM/': 2, '/EE/': 3, '/RR/': 4}

# --- CHANGE START ---
# Replaced with the exact function from generate_and_format_metadata.py
def extract_season_episode(filepath):
    """Extracts season and episode using flexible, prioritized pattern matching."""
    filename = os.path.basename(filepath)

    match_prefix = re.match(r'^0(\d)(\d{2})', filename)
    if match_prefix:
        s = int(match_prefix.group(1))
        e = int(match_prefix.group(2))
        if s > 0:
            episode = e if e > 0 else None
            if episode is not None and episode > 8:
                episode = None
            return s, episode

    match_prefix_no_zero = re.match(r'^([1-9])(\d{2})', filename)
    if match_prefix_no_zero:
        s = int(match_prefix_no_zero.group(1))
        e = int(match_prefix_no_zero.group(2))
        if s > 0:
            episode = e if e > 0 else None
            if episode is not None and episode > 8:
                episode = None
            return s, episode

    season, episode = None, None
    normalized_path = filepath.lower().replace('-', '_')

    season_match = re.search(r'season_?(\d{1,2})', normalized_path)
    if season_match:
        season = int(season_match.group(1))
    else:
        season_match_short = re.search(r'\bs(\d{1,2})\b', normalized_path)
        if season_match_short:
            season = int(season_match_short.group(1))

    if season is None:
        for folder, s_num in FOLDER_TO_SEASON_MAP.items():
            if folder in filepath:
                season = s_num
                break

    episode_match = re.search(r'episode_?(\d{1,2})', normalized_path)
    if episode_match:
        episode = int(episode_match.group(1))
    else:
        episode_match_short = re.search(r'\be(\d{1,2})\b', normalized_path)
        if episode_match_short:
            episode = int(episode_match_short.group(1))

    match_legacy = re.search(r'_(\d)(\d{2})_', filepath, re.IGNORECASE)
    if match_legacy:
        if episode is None:
            episode = int(match_legacy.group(2))
        if season is None:
            season = int(match_legacy.group(1))
    
    if episode is not None and episode > 8:
        episode = None
            
    return season, episode
# --- CHANGE END ---

# --- FORMATTING & METADATA FUNCTIONS ---
def map_actors_to_characters(actors_str):
    if not isinstance(actors_str, str) or not actors_str: return ''
    normalized_actors_str = unicodedata.normalize('NFC', actors_str)
    actors_list = [actor.strip() for actor in normalized_actors_str.split(',')]
    characters = [ACTOR_TO_CHARACTER_MAP[actor] for actor in actors_list if actor in ACTOR_TO_CHARACTER_MAP]
    return ", ".join(characters)

def format_bytes(bytes_value):
    if bytes_value is None: return None
    bytes_value = float(bytes_value)
    if bytes_value >= 10**9:
        formatted = f"{bytes_value / 10**9:,.2f} GB".replace('.', '#').replace(',', '.').replace('#', ',')
        return formatted.replace(',0 GB', ' GB')
    elif bytes_value >= 10**6:
        formatted = f"{bytes_value / 10**6:,.1f} MB".replace('.', '#').replace(',', '.').replace('#', ',')
        return formatted.replace(',0 MB', ' MB')
    elif bytes_value >= 10**3:
        return f"{bytes_value / 10**3:,.0f} KB".replace('.', '#').replace(',', '.').replace('#', ',')
    else:
        return f"{int(bytes_value)} bytes"

def format_exposure_time(seconds):
    if seconds is None: return None
    if seconds == 0: return "0"
    if seconds >= 1: return f"{seconds}"
    fraction = Fraction(seconds).limit_denominator(10000)
    return f"1/{fraction.denominator:,}".replace(',', '.') if fraction.numerator == 1 else f"{fraction.numerator}/{fraction.denominator:,}".replace(',', '.')

def clean_list_string_representation(value):
    if isinstance(value, str) and value.startswith('[') and value.endswith(']'):
        try:
            list_val = ast.literal_eval(value)
            if isinstance(list_val, list): return ", ".join(str(item).strip("'\"") for item in list_val)
        except (ValueError, SyntaxError): pass
    return value

def get_image_metadata(image_path):
    """Retrieves a specific set of metadata, translates it, and adds derived fields."""
    try:
        command = ['mdls', '-plist', '-'] + MDLS_COMMAND_ARGS + [image_path]
        mdls_result = subprocess.run(command, capture_output=True, text=True, check=True)
        metadata = plistlib.loads(mdls_result.stdout.encode('utf-8'))
        
        metadata['_filepath'] = image_path
        metadata['_relative_filepath'] = os.path.relpath(image_path)
        
        # --- CHANGE START ---
        # Logic for blank file name
        filename = metadata.get('kMDItemFSName')
        if filename and re.match(r'^0\d{3}', filename):
            metadata['kMDItemFSName'] = ''
            
        # Logic for Season and Episode columns
        season, episode = extract_season_episode(image_path)
        metadata['_season'] = season
        metadata['_episode'] = episode
        # --- CHANGE END ---
        
        width = metadata.get('kMDItemPixelWidth')
        height = metadata.get('kMDItemPixelHeight')
        if width is not None and height is not None: metadata['_combined_dimensions'] = f"{width} × {height}"

        f_number = metadata.get('kMDItemFNumber')
        if isinstance(f_number, (int, float)): metadata['kMDItemFNumber'] = f"f/{str(f_number).replace('.', ',')}"

        if (file_size := metadata.get('kMDItemFSSize')) is not None:
            metadata['kMDItemFSSize'] = format_bytes(file_size)

        if (focal_length := metadata.get('kMDItemFocalLength')) is not None and isinstance(focal_length, (int, float)):
             metadata['kMDItemFocalLength'] = f"{int(focal_length)} mm" if focal_length == int(focal_length) else f"{str(focal_length).replace('.', ',')} mm"

        if (exposure_time := metadata.get('kMDItemExposureTimeSeconds')) is not None:
            metadata['kMDItemExposureTimeSeconds'] = format_exposure_time(exposure_time)

        if (keywords := metadata.get('kMDItemKeywords')) and isinstance(keywords, list):
            metadata['kMDItemKeywords'] = ", ".join(str(item).strip("'\"") for item in keywords)

        if (authors := metadata.get('kMDItemXMPCredit')) and isinstance(authors, list):
            metadata['kMDItemXMPCredit'] = ", ".join(str(item).strip("'\"") for item in authors)

        if (user_tags := metadata.get('kMDItemUserTags')) and isinstance(user_tags, list):
            actors_string = ", ".join(str(item).strip("'\"") for item in user_tags)
            metadata['kMDItemUserTags'] = actors_string
            metadata['_characters'] = map_actors_to_characters(actors_string)

        for key, mapping in METADATA_MAPPINGS.items():
            if key in metadata:
                original_value = metadata[key]
                if key in ['kMDItemHasAlphaChannel', 'kMDItemRedEyeOnOff']:
                    if isinstance(original_value, bool): metadata[key] = mapping.get(original_value)
                elif isinstance(original_value, (int, float)):
                    if (translated_value := mapping.get(original_value)):
                        if key == 'kMDItemExposureProgram':
                            metadata[key] = "0" if original_value == 0 else translated_value
                        else:
                            metadata[key] = translated_value

        for key, value in metadata.items():
            if value is not None:
                metadata[key] = clean_list_string_representation(value)
        return metadata
    except (subprocess.CalledProcessError, FileNotFoundError, plistlib.InvalidFileException) as e:
        print(f"Error processing file {image_path} with mdls: {e}")
        return None

def find_image_files(folder_path, recursive):
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}
    image_files = []
    if recursive:
        for root, _, files in os.walk(folder_path):
            for f in files:
                if os.path.splitext(f)[1].lower() in image_extensions: image_files.append(os.path.join(root, f))
    else:
        try:
            files = os.listdir(folder_path)
            image_files = [os.path.join(folder_path, f) for f in files if os.path.splitext(f)[1].lower() in image_extensions]
        except FileNotFoundError:
            print(f"Error: The folder '{folder_path}' was not found.")
            return []
    return image_files

def collect_metadata_to_csv(folder_path, csv_file_path, recursive):
    """Collects, sorts, and writes a specific set of metadata to a CSV file."""
    image_paths = find_image_files(folder_path, recursive)
    if not image_paths:
        print(f"No images found in '{folder_path}'.")
        return

    all_metadata_raw = []
    print(f"Scanning {len(image_paths)} images...")
    for image_path in image_paths:
        if (metadata := get_image_metadata(image_path)):
            all_metadata_raw.append(metadata)
    
    # --- Sorting ---
    # --- CHANGE START ---
    # Updated to use the pre-calculated season and episode for efficiency
    def get_sort_key(metadata_item):
        filepath = metadata_item.get('_filepath', '')
        season = metadata_item.get('_season')
        episode = metadata_item.get('_episode')
        unit_num_match = re.search(r'Unit_(\d+)', filepath, re.IGNORECASE)
        unit_num = int(unit_num_match.group(1)) if unit_num_match else -1
        # Sort by season, then episode, then unit number, then filepath
        return (season if season is not None else -1, episode if episode is not None else -1, unit_num, filepath)
    # --- CHANGE END ---

    print("Sorting metadata...")
    all_metadata_raw.sort(key=get_sort_key)
    
    # --- CSV Writing ---
    display_headers = [HEADER_DISPLAY_NAMES.get(h, h) for h in FINAL_CSV_HEADERS_KMD]

    with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=display_headers, extrasaction='ignore')
        writer.writeheader()
        print(f"Writing data to {csv_file_path}...")
        for metadata_row_raw in all_metadata_raw:
            # First, create a cleaned-up version of the row where None is replaced with ''
            cleaned_data = {key: ('' if value is None else value) for key, value in metadata_row_raw.items()}
            # Then, map the keys to their display names for the CSV header
            row_for_csv = {HEADER_DISPLAY_NAMES.get(k, k): v for k, v in cleaned_data.items()}
            writer.writerow(row_for_csv)
            
    print(f"✅ Metadata successfully written to {csv_file_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Collects, translates, sorts, and orders a specific set of image metadata.")
    parser.add_argument("folder", nargs='?', default='.', help="The path to the folder containing images. Defaults to the current directory.")
    parser.add_argument("-r", "--recursive", action="store_true", help="Recursively search for images in subdirectories.")
    parser.add_argument("--output", default="mdls_metadata_formatted.csv", help="The name of the output CSV file. Defaults to 'mdls_metadata_formatted.csv'.")
    args = parser.parse_args()
    collect_metadata_to_csv(args.folder, args.output, args.recursive)
