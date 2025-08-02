import os
import glob
import subprocess

def create_thumbnails():
    # Configuration
    source_dir = 'house-of-the-dragon-gallery'
    output_dir = 'images/house-of-the-dragon-thumbnail'
    thumbnail_size = (680, 680)
    
    # Check if ImageMagick is installed
    try:
        subprocess.run(['magick', '-version'], check=True, capture_output=True)
    except FileNotFoundError:
        print("Error: ImageMagick is not installed or not found in PATH.")
        print("Please install ImageMagick. On macOS, you can use Homebrew: brew install imagemagick")
        print("On Debian/Ubuntu: sudo apt-get install imagemagick")
        print("On Windows, download from: https://imagemagick.org/script/download.php")
        return

    # Ensure the output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created directory: {output_dir}")

    # Find all image files in the source directory and its subdirectories
    image_paths = glob.glob(os.path.join(source_dir, '**', '*'), recursive=True)
    
    processed_count = 0
    for img_path in image_paths:
        # Check if the file is an image (ImageMagick handles many formats, so a broad check is fine)
        if not img_path.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp')):
            continue

        try:
            # Create a corresponding subdirectory structure in the output directory
            relative_path = os.path.relpath(os.path.dirname(img_path), source_dir)
            thumbnail_subdir = os.path.join(output_dir, relative_path)
            if not os.path.exists(thumbnail_subdir):
                os.makedirs(thumbnail_subdir)

            # Define the output path for the thumbnail, changing the extension to .webp
            filename = os.path.basename(img_path)
            filename_without_ext = os.path.splitext(filename)[0]
            thumbnail_path = os.path.join(thumbnail_subdir, f"{filename_without_ext}.webp")

            # Use ImageMagick to resize and save the thumbnail
            # The -resize option scales the image to fit within the given dimensions
            # preserving aspect ratio. It also handles format conversion automatically.
            command = [
                'magick',
                'convert',
                img_path,
                '-resize',
                f'{thumbnail_size[0]}x{thumbnail_size[1]}',
                thumbnail_path
            ]
            subprocess.run(command, check=True, capture_output=True)
            
            processed_count += 1
            print(f"Created thumbnail for: {os.path.basename(thumbnail_path)}")

        except subprocess.CalledProcessError as e:
            print(f"Error processing {img_path}: {e.stderr.decode()}")
        except Exception as e:
            print(f"Could not process {img_path}: {e}")

    print(f"\nThumbnail generation complete. Processed {processed_count} images.")

if __name__ == '__main__':
    create_thumbnails()
