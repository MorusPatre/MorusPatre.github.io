import os
import subprocess
import sys
import unicodedata
import plistlib

def get_user_tags_from_plist(filepath):
    """Gets kMDItemUserTags for a file using mdls and plistlib."""
    try:
        command = ['mdls', '-name', 'kMDItemUserTags', '-plist', '-']
        process = subprocess.run(
            command + [filepath],
            capture_output=True,
            check=True,
            text=True,
            encoding='utf-8'
        )
        plist_data = plistlib.loads(process.stdout.encode('utf-8'))
        tags = plist_data.get('kMDItemUserTags')
        
        if isinstance(tags, list):
            return tags
        return []
    except (subprocess.CalledProcessError, FileNotFoundError, plistlib.InvalidFileException):
        return []

def find_images_and_get_unique_tags(root_folder):
    """Recursively finds images and returns a set of unique, normalized user tags."""
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.heic', '.webp'}
    unique_tags = set()

    print(f"Scanning for images in: {os.path.abspath(root_folder)}...")

    all_files = []
    for foldername, _, filenames in os.walk(root_folder):
        for filename in filenames:
            if os.path.splitext(filename)[1].lower() in image_extensions:
                all_files.append(os.path.join(foldername, filename))

    total_files = len(all_files)
    if total_files == 0:
        print("No image files found.")
        return []

    print(f"Found {total_files} potential image files. Reading tags...")

    for i, filepath in enumerate(all_files):
        print(f"Processing file {i + 1}/{total_files}: {os.path.basename(filepath)}...\r", end="", flush=True)

        tags = get_user_tags_from_plist(filepath)
        for tag in tags:
            normalized_tag = unicodedata.normalize('NFC', tag)
            unique_tags.add(normalized_tag)
    
    print("\n")
    return sorted(list(unique_tags))

def write_tags_to_file(tags, output_path):
    """Writes a list of tags to a text file."""
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            for tag in tags:
                f.write(f"{tag}\n")
        print(f"\n--- Unique User Tags Saved ---")
        print(f"Successfully saved {len(tags)} unique tags to: {os.path.abspath(output_path)}")
        print("------------------------------")
    except IOError as e:
        print(f"\nError: Could not write to file at '{output_path}'. Reason: {e}")

if __name__ == "__main__":
    # Scan the current working directory, save output to a fixed path
    target_folder = os.getcwd()
    output_file = "/Users/mo/Downloads/unique_tags.txt"

    if not os.path.isdir(target_folder):
        print(f"Error: Hardcoded directory not found at '{target_folder}'")
        sys.exit(1)

    tags = find_images_and_get_unique_tags(target_folder)

    if tags:
        write_tags_to_file(tags, output_file)
    else:
        print("\nNo user tags found in the scanned images.")
    
    print("\nScan complete.")
