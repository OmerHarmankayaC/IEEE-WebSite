from PIL import Image
import numpy as np

# Open the image
img = Image.open('Initial-elements/IEEE_TEDU_WIE-Symbol.jpeg').convert('RGB')
data = np.array(img)

# We want to swap:
# The background is currently purple, text is white.
# Let's find the dominant purple color roughly.
# White is near [255, 255, 255].
# If we simply invert the lightness?
# A better way: convert to grayscale to find the text mask.
gray = img.convert('L')
gray_data = np.array(gray)

# Assuming white text on purple background.
# Threshold to find white text. White text will be > 200.
mask_text = gray_data > 200

# The background is everything else.
# Let's find the median color of the background.
bg_pixels = data[~mask_text]
if len(bg_pixels) > 0:
    median_purple = np.median(bg_pixels, axis=0)
else:
    median_purple = np.array([128, 0, 128])

# New image data
new_data = np.zeros_like(data)

# Set the background to white [255,255,255]
new_data[~mask_text] = [255, 255, 255]

# Set the text to the median purple
new_data[mask_text] = median_purple

# Save the new image
new_img = Image.fromarray(new_data)
new_img.save('Initial-elements/IEEE_TEDU_WIE-Symbol-Swapped.jpeg')
print("Saved swapped image.")
