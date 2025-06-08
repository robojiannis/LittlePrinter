import React, { useRef, useState, useEffect } from "react";
import styles from "./styles.module.css";
import domtoimage from "dom-to-image";
import { FaPencilAlt } from "react-icons/fa";
import { MdOutlineCleaningServices } from "react-icons/md";

const QuickDraw = ({ onSend }) => {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pencil"); // "pencil" or "eraser"
  const [context, setContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Set canvas size
    canvas.width = 384;
    canvas.height = 384;
    
    // Set initial canvas style
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    
    setContext(ctx);
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === "eraser") {
      context.strokeStyle = "white";
      context.lineWidth = 20; // Wider stroke for eraser
    } else {
      context.strokeStyle = "black";
      context.lineWidth = 2; // Normal stroke for pencil
    }
    
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSend = async () => {
    // Generate a single image containing the drawing
    const combinedImage = await generateImageFromPreview(previewRef);
    if (!combinedImage) {
      console.error("Failed to generate combined image");
      return;
    }
    
    // Create payload with the combined image
    const payload = {
      image: combinedImage,
      type: "quick-draw"
    };
    
    onSend(payload);
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

  return (
    <div className={styles.container}>
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
      </div>
      
      <div className={styles.tools}>
        <button
          className={`${styles.toolButton} ${tool === "pencil" ? styles.active : ""}`}
          onClick={() => setTool("pencil")}
        >
          <FaPencilAlt size={20} />
        </button>
        <button
          className={`${styles.toolButton} ${tool === "eraser" ? styles.active : ""}`}
          onClick={() => setTool("eraser")}
        >
          <MdOutlineCleaningServices size={24} />
        </button>
        <button className={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default QuickDraw; 