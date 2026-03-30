from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def convert_pngs(root: Path, keep_png: bool, quality: int) -> int:
    converted_count = 0
    for png_path in sorted(root.rglob("*.png")):
        webp_path = png_path.with_suffix(".webp")

        with Image.open(png_path) as image:
            image.save(webp_path, format="WEBP", quality=quality, method=6)

        if not keep_png:
            png_path.unlink()

        converted_count += 1

    return converted_count


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert PNG images to WebP")
    parser.add_argument(
        "--root",
        default="public",
        help="Directory to scan recursively for PNG files",
    )
    parser.add_argument(
        "--keep-png",
        action="store_true",
        help="Keep original PNG files after conversion",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=90,
        help="WebP quality between 1 and 100",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Invalid root directory: {root}")

    quality = max(1, min(100, args.quality))
    converted = convert_pngs(root=root, keep_png=args.keep_png, quality=quality)
    print(f"Converted {converted} PNG file(s) in {root}")


if __name__ == "__main__":
    main()
