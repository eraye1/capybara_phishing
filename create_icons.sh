#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "This script requires ImageMagick. Please install it first."
    exit 1
fi

# Create icons directory if it doesn't exist
mkdir -p icons

# Colors
PRIMARY="#4A90E2"    # Blue for trust
SECONDARY="#34495E"  # Dark slate for professionalism
ACCENT="#2ECC71"     # Green for security

# Create icons of different sizes
for size in 16 48 128; do
    # Calculate dimensions
    center=$((size/2))
    shield_width=$((size*8/10))
    shield_height=$((size*9/10))
    
    # Create base image with transparent background
    convert -size ${size}x${size} xc:none \
    \( -size ${shield_width}x${shield_height} \
       -define gradient:angle=45 \
       gradient:${PRIMARY}-${SECONDARY} \
       -gravity center \
       -distort Arc '120' \
    \) -gravity center -composite \
    \( -size $((shield_width*6/10))x$((shield_height*6/10)) \
       xc:none \
       -fill ${ACCENT} \
       -draw "roundrectangle 0,0,$((shield_width*6/10)),$((shield_height*6/10)),$((size/10)),$((size/10))" \
       -draw "line $((size/10)),$((size/4)) $((shield_width*5/10)),$((shield_height*4/10))" \
       -draw "line $((shield_width*5/10)),$((shield_height*4/10)) $((shield_width*5/10-size/10)),$((size/4))" \
    \) -gravity center -composite \
    "icons/icon${size}.png"
done

echo "Icons created successfully in icons/ directory"
