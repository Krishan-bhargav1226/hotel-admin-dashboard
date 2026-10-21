/**
 * Compresses an image client-side to a maximum dimension of ~1600px before uploading.
 * PDFs and small images are returned untouched.
 */
export async function compressImageIfNeeded(file: File, maxDimension = 1600, quality = 0.85): Promise<File> {
  // If not an image (e.g. PDF), don't touch it
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  // If already under 800 KB, no heavy compression needed
  if (file.size <= 800 * 1024) {
    return file;
  }

  return new Promise<File>((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width <= maxDimension && height <= maxDimension) {
        // Dimensions already within bounds
        resolve(file);
        return;
      }

      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const targetType = file.type === "image/png" ? "image/jpeg" : file.type;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedName = file.name.replace(/\.[^.]+$/, ".jpg");
          const compressedFile = new File([blob], compressedName, {
            type: targetType,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        targetType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
