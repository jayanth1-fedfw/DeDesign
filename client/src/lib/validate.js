const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Please upload a JPG, PNG, or WEBP image.';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'Image must be smaller than 5MB.';
  }
  return null;
}
