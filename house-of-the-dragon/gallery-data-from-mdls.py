import csv
import json
import os
import re
import unicodedata
import pandas as pd

# --- HELPER FUNCTIONS ---
def simplify_text_for_search(text):
    if not text: return ""
    nfkd_form = unicodedata.normalize('NFD', text)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)])

def get_sort_key(row):
    """Defines the display order: by episode, unit, then original path."""
    episode_num = row.get('episode_num', -1)
    unit_num = row.get('unit_num', -1)
    return (-1 if episode_num is None else episode_num, unit_num, row['Relative File path'])

def to_kebab_case(text):
    """Converts 'Device Model' to 'device-model' for data attributes."""
    s1 = re.sub(r'(.)([A-Z][a-z]+)', r'\1-\2', text)
    return re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', s1).replace(' ', '-').lower()

# --- MAIN SCRIPT LOGIC ---
try:
    csv_filename = 'mdls_metadata_formatted.csv'
    with open(csv_filename, mode='r', newline='', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        all_rows = list(reader)

    # First pass: Add sorting keys from data in the CSV.
    for row in all_rows:
        try:
            episode_str = row.get('Episode', '')
            row['episode_num'] = int(float(episode_str)) if episode_str else -1
        except (ValueError, TypeError):
            row['episode_num'] = -1
        
        unit_num = -1
        unit_match = re.search(r'_[u](?:nit)?(\d+)', row['Relative File path'], re.IGNORECASE)
        if unit_match:
            unit_num = int(unit_match.group(1))
        row['unit_num'] = unit_num

    sorted_rows = sorted(all_rows, key=get_sort_key)
    
    all_images_data = []
    cdn_base_url = "https://cdn.mouseia.com"

    # Second pass: Generate a dictionary for each image.
    for row in sorted_rows:
        relative_path = row.get('Relative File path')
        if not relative_path:
            continue

        actual_filename = os.path.basename(relative_path)
        metadata_filename = row.get('File name', '')

        actors_raw = row.get('Actors', '') if pd.notna(row.get('Actors')) else ''
        characters_raw = row.get('Characters', '') if pd.notna(row.get('Characters')) else ''
        actors_list = [actor.strip() for actor in actors_raw.split(',') if actor.strip()]
        characters_list = [char.strip() for char in characters_raw.split(',') if char.strip()]

        actors_display = ", ".join(actors_list)
        characters_display = ", ".join(characters_list)
        
        season_str, episode_str = row.get('Season'), row.get('Episode')
        
        # Generate search terms
        search_terms_set = set()
        
        search_terms_set.add(simplify_text_for_search(actual_filename.lower()))
        name_without_ext, _ = os.path.splitext(actual_filename)
        search_terms_set.add(simplify_text_for_search(name_without_ext.lower()))

        if season_str:
            search_terms_set.add(f"season {season_str}"); search_terms_set.add(f"s{season_str}")
        if episode_str:
            search_terms_set.add(f"episode {episode_str}"); search_terms_set.add(f"e{episode_str}")
        if season_str and episode_str:
            search_terms_set.add(f"s{season_str}e{episode_str}")
        if actors_raw: search_terms_set.add(simplify_text_for_search(actors_raw.lower()))
        if characters_raw: search_terms_set.add(simplify_text_for_search(characters_raw.lower()))
        search_attr = " ".join(sorted(list(search_terms_set)))
        
        final_src_path = f"house-of-the-dragon/{actual_filename}"
        thumbnail_path = f"house-of-the-dragon/thumbnail/{name_without_ext}.webp"

        # Create the dictionary for the image, inserting keys in a specific order.
        image_data = {}
        
        # 1. Add primary, ordered keys as requested.
        image_data["src"] = f"{cdn_base_url}/{final_src_path}"
        image_data["thumbnail"] = f"{cdn_base_url}/{thumbnail_path}"
        image_data["filename"] = metadata_filename
        image_data["alt"] = f"Characters: {characters_display} | Actors: {actors_display}"
        image_data["search"] = search_attr

        # 2. Add other metadata from the CSV, preserving column order.
        # Define a set of keys that have already been processed or should be skipped.
        processed_or_skipped_keys = {
            'Relative File path', 'File name', 'episode_num', 'unit_num'
        }

        # Get the ordered list of headers from the CSV reader
        csv_headers = reader.fieldnames

        for col_header in csv_headers:
            if col_header in processed_or_skipped_keys:
                continue

            col_value = row.get(col_header)
            if pd.isna(col_value) or col_value == '':
                continue

            # Handle specific columns that need special formatting
            if col_header == 'Actors':
                actors_list = [actor.strip() for actor in actors_raw.split(',') if actor.strip()]
                image_data['actors'] = ", ".join(actors_list)
            elif col_header == 'Characters':
                characters_list = [char.strip() for char in characters_raw.split(',') if char.strip()]
                image_data['characters'] = ", ".join(characters_list)
            elif col_header == 'Dimensions':
                image_data['dimensions'] = col_value
            elif col_header == 'Season':
                if season_str and season_str.isdigit():
                    image_data['season'] = int(season_str)
            elif col_header == 'Episode':
                if episode_str and episode_str.isdigit():
                    image_data['episode'] = int(episode_str)
            else:
                key_parts = to_kebab_case(col_header).split('-')
                camel_case_key = key_parts[0] + ''.join(x.title() for x in key_parts[1:])
                image_data[camel_case_key] = col_value

        all_images_data.append(image_data)

    with open('gallery-data.json', 'w', encoding='utf-8') as f:
        json.dump(all_images_data, f, ensure_ascii=False, indent=2)
    
    print("✅ Successfully generated gallery-data.json with the specified key order.")

except FileNotFoundError:
    print(f"--> ERROR: '{csv_filename}' not found. Please run the metadata generation script first.")
except Exception as e:
    print(f"An error occurred: {e}")
