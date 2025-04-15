// src/components/ObjectDetection.jsx
import React, { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { Box, Button, Flex, Spinner, Text, VStack, HStack} from "@chakra-ui/react";

const ObjectDetection = ({ image, onDetectionComplete }) => {
  const [loading, setLoading] = useState(true);
  const [detections, setDetections] = useState([]);

  const imageRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    if (!image?.url || !imageRef.current) return;

    const loadImageAsBlob = async () => {
      try {
        const response = await fetch(image.url, { method: "GET", mode: "cors" });
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
  
        const img = imageRef.current;
        img.src = objectURL;
  
        img.onload = () => {
          // Only run detection if it's NOT a result image
          if (!image.res_url) {
            runObjectDetection();
          } else {
            // If it's a result image, draw it on canvas without detecting again
            drawImageOnly();
          }
        };
      } catch (err) {
        console.error("❌ Failed to fetch image:", err);
      }
    };

    loadImageAsBlob();
  }, [image]);

  const drawImageOnly = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    ctx.drawImage(imageRef.current, 0, 0);
    setLoading(false); // skip spinner
  };

  const runObjectDetection = async () => {
    setLoading(true);
    const model = await cocoSsd.load();
    const predictions = await model.detect(imageRef.current);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    ctx.drawImage(imageRef.current, 0, 0);

    predictions.forEach((pred) => {
      const [x, y, width, height] = pred.bbox;
      const color = "#00BFFF";
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      ctx.font = "18px Arial";
      ctx.fillStyle = color;
      ctx.fillText(`${pred.class} (${(pred.score * 100).toFixed(1)}%)`, x, y > 10 ? y - 5 : y + 20);
    });

    setDetections(predictions);
    setLoading(false);

    if (onDetectionComplete) {
      onDetectionComplete({ canvas, count: predictions.length }); 
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${image.name}_detected.png`;
    link.click();
  };

  return (
    <Box display={"flex"} flexDirection="column" alignItems="center" justifyContent="center">
      {loading && (
        <Flex justify="center" align="center" mt={4}>
          <Spinner size="lg" color="teal.500" />
          {/* <Text ml={3}>Detecting objects...</Text> */}
        </Flex>
      )}
      <HStack flexDirection="column" alignItems="center" justifyContent="center" mt={1}>
      <canvas ref={canvasRef} style={{ display: loading ? "none" : "block", maxHeight: "25%", maxWidth: "45%" }} />
      <img
        ref={imageRef}
        alt="Object Detection"
        style={{ display: "none", height: "20px"}}
        crossOrigin="anonymous"
      />

      {!loading && (
        <HStack mt={4} spacing={4}>
          <Text fontWeight="bold">
            Detected: {image.res_url ? (image.res_count ?? 0) : detections.length} object(s)
        </Text>
          <Button onClick={downloadImage} colorScheme="teal">
            Download Result Image
          </Button>
        </HStack>
      )}
      </HStack>
    </Box>
  );
};

export default ObjectDetection;
