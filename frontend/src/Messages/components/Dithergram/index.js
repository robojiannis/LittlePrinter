import React, { useState, useRef } from "react";
import styles from "./styles.module.css";
import Preview from "../PosterFont/Preview";
import MessageInput from "../MessageInput";
import domtoimage from "dom-to-image";

const Dithergram = ({ onSend }) => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef();
  const previewRef = useRef();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const ditheredImage = await ditherImage(file);
      setImage(ditheredImage);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!image) return;
    
    // Generate a single image containing both the dithered image and caption
    const combinedImage = await generateImageFromPreview(previewRef);
    if (!combinedImage) {
      console.error("Failed to generate combined image");
      return;
    }
    
    // Create payload with the combined image
    const payload = {
      image: combinedImage,
      type: "dithergram"
    };
    
    onSend(payload);
    setImage(null);
    setCaption("");
  };

  const generateImageFromPreview = async (ref) => {
    if (ref.current) {
      try {
        return await domtoimage.toBlob(ref.current);
      } catch (err) {
        console.error("Error generating image", err);
      }
    }
  };

  const ditherImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create a canvas for resizing
          const resizeCanvas = document.createElement("canvas");
          const resizeCtx = resizeCanvas.getContext("2d");
          
          // Calculate new dimensions while maintaining aspect ratio
          const MAX_WIDTH = 384;
          const MAX_HEIGHT = 384;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          // Resize the image
          resizeCanvas.width = width;
          resizeCanvas.height = height;
          resizeCtx.drawImage(img, 0, 0, width, height);
          
          // Create a canvas for dithering
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = width;
          canvas.height = height;
          
          // Draw the resized image
          ctx.drawImage(resizeCanvas, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          
          // Apply Atkinson dithering
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const idx = (y * width + x) * 4;
              
              // Convert to grayscale
              const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
              
              // Apply threshold
              const newColor = gray < 128 ? 0 : 255;
              
              // Calculate error
              const error = Math.floor((gray - newColor) / 8);
              
              // Set new color
              data[idx] = data[idx + 1] = data[idx + 2] = newColor;
              
              // Distribute error according to Atkinson algorithm
              // Current pixel and right pixel
              if (x + 1 < width) {
                data[idx + 4] += error;
                data[idx + 5] += error;
                data[idx + 6] += error;
              }
              if (x + 2 < width) {
                data[idx + 8] += error;
                data[idx + 9] += error;
                data[idx + 10] += error;
              }
              
              // Next row
              if (y + 1 < height) {
                if (x > 0) {
                  data[idx + width * 4 - 4] += error;
                  data[idx + width * 4 - 3] += error;
                  data[idx + width * 4 - 2] += error;
                }
                data[idx + width * 4] += error;
                data[idx + width * 4 + 1] += error;
                data[idx + width * 4 + 2] += error;
                if (x + 1 < width) {
                  data[idx + width * 4 + 4] += error;
                  data[idx + width * 4 + 5] += error;
                  data[idx + width * 4 + 6] += error;
                }
              }
              
              // Two rows down
              if (y + 2 < height) {
                data[idx + width * 8] += error;
                data[idx + width * 8 + 1] += error;
                data[idx + width * 8 + 2] += error;
              }
            }
          }
          
          // Put the dithered image back
          ctx.putImageData(imageData, 0, 0);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: "image/png" }));
          }, "image/png");
        };
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploadSection}>
        <input
          type="file"
          ref={fileInputRef}
          className={styles.fileInput}
          accept="image/*"
          onChange={handleFileChange}
        />
        <button
          className={styles.uploadButton}
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? "Change Image" : "Upload Image"}
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Processing image...</div>
      ) : image ? (
        <div className={styles.previewSection}>
          <div className={styles.previewContainer}>
            <Preview 
              ref={previewRef}
              header={<img src={URL.createObjectURL(image)} className={styles.preview} alt="Dithered preview" />}
              text={caption}
            />
          </div>
          <div className={styles.captionSection}>
            <MessageInput
              message={caption}
              onChange={setCaption}
              onSend={handleSend}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dithergram; 