#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "This script requires ImageMagick. Please install it first."
    exit 1
fi

# Create icons directory if it doesn't exist
mkdir -p icons

# Create icons of different sizes
for size in 16 48 128; do
    convert -size ${size}x${size} xc:gray -fill white -draw "circle $((size/2)),$((size/2)) $((size/2)),1" "icons/icon${size}.png"
done
