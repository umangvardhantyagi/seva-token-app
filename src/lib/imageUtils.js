export async function compressImageFile(
  file,
  {
    maxWidth = 900,
    maxHeight = 900,
    quality = 0.72,
    maxSizeKB = 500,
  } = {}
) {
  if (!file) return null;

  if (!file.type?.startsWith("image/")) {
    throw new Error("Please upload a valid image file");
  }

  const imageBitmap = await createImageBitmap(file);

  let { width, height } = imageBitmap;

  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Image compression failed");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(imageBitmap, 0, 0, width, height);

  let finalQuality = quality;
  let blob = await canvasToBlob(canvas, finalQuality);

  while (blob.size / 1024 > maxSizeKB && finalQuality > 0.42) {
    finalQuality = Number((finalQuality - 0.08).toFixed(2));
    blob = await canvasToBlob(canvas, finalQuality);
  }

  const cleanName = file.name
    ? file.name.replace(/\.[^/.]+$/, "")
    : "sadhak-photo";

  return new File([blob], `${cleanName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image compression failed"));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}