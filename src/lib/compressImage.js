export function compressImage(file, maxSize = 800, quality = 0.68) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No photo selected"));
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select a valid image"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Photo compression failed"));
              return;
            }

            const compressedFile = new File([blob], "seva-photo.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("Invalid photo"));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error("Unable to read photo"));
    reader.readAsDataURL(file);
  });
}