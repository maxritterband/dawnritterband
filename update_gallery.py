#!/usr/bin/env python3
"""
update_gallery.py
-----------------
Run this script whenever you add new photos to the /photos folder.
It will automatically update the gallery section in index.html.

Usage:
    python3 update_gallery.py
"""

import os
import re

# Supported image extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}

# Path to your photos folder (same directory as this script)
PHOTOS_DIR = os.path.join(os.path.dirname(__file__), 'photos')
INDEX_HTML  = os.path.join(os.path.dirname(__file__), 'index.html')


def get_photos():
    """Return sorted list of photo filenames from the photos/ folder."""
    if not os.path.isdir(PHOTOS_DIR):
        print("❌  No 'photos' folder found. Create one and add your photos first.")
        return []
    photos = [
        f for f in sorted(os.listdir(PHOTOS_DIR))
        if os.path.splitext(f)[1].lower() in IMAGE_EXTENSIONS
    ]
    return photos


def build_gallery_html(photos):
    """Build the gallery grid HTML from a list of photo filenames."""
    if not photos:
        return '        <div class="gallery-placeholder"><span>No photos yet — add some to the photos/ folder</span></div>'

    lines = []
    for filename in photos:
        # Use the filename (without extension) as a basic alt text,
        # replacing underscores/hyphens with spaces and capitalizing
        name = os.path.splitext(filename)[0]
        alt  = name.replace('_', ' ').replace('-', ' ').title()
        lines.append(f'        <img src="photos/{filename}" alt="{alt}" />')

    return '\n'.join(lines)


def update_index(photos):
    """Replace the gallery grid contents in index.html."""
    with open(INDEX_HTML, 'r', encoding='utf-8') as f:
        content = f.read()

    new_grid_contents = build_gallery_html(photos)

    # Match everything between the gallery-grid opening and closing div tags
    pattern = r'(<div class="gallery-grid reveal">)(.*?)(</div>)'
    replacement = rf'\1\n{new_grid_contents}\n      \3'

    new_content, count = re.subn(pattern, replacement, content, count=1, flags=re.DOTALL)

    if count == 0:
        print("❌  Could not find the gallery section in index.html. Has the file been modified?")
        return False

    with open(INDEX_HTML, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True


def main():
    print("\n🌸  Dawn Ritterband Memorial — Gallery Updater\n")

    photos = get_photos()

    if not photos:
        print("No photos found in the photos/ folder. Add some images and run again.")
        return

    print(f"Found {len(photos)} photo(s) in photos/:")
    for p in photos:
        print(f"   • {p}")

    success = update_index(photos)

    if success:
        print(f"\n✅  index.html updated with {len(photos)} photo(s).")
        print("    Next steps:")
        print("    1. Open GitHub Desktop (or run: git add . && git commit -m 'Update gallery' && git push)")
        print("    2. Your site will update in about 1 minute.\n")
    else:
        print("\n❌  Something went wrong. No changes were made.\n")


if __name__ == '__main__':
    main()
