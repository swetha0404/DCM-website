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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      w="100%"
    >
      {loading && (
        <Flex justify="center" align="center" mt={4}>
          <Spinner size="lg" color="teal.500" />
        </Flex>
      )}
  
      <VStack spacing={4} mt={loading ? 4 : 0} width="100%">
        {/* Result canvas */}
        <canvas
          ref={canvasRef}
          style={{
            display: loading ? "none" : "block",
            maxWidth: "100%",
            width: "100%",
            height: "auto",
            border: "1px solid #ccc",
            borderRadius: "10px",
          }}
        />
  
        {/* Hidden image used by TensorFlow */}
        <img
          ref={imageRef}
          alt="Object Detection"
          style={{ display: "none" }}
          crossOrigin="anonymous"
        />
  
        {!loading && (
          <Flex
            justify="center"
            align="center"
            wrap="wrap"
            gap={4}
            mt={2}
            direction={{ base: "column", sm: "row" }}
          >
            <Text fontWeight="bold" fontSize="md" textAlign="center">
              Detected:{" "}
              {image.res_url ? (image.res_count ?? 0) : detections.length} object(s)
            </Text>
  
            <Button onClick={downloadImage} colorScheme="teal" size="sm">
              <Text fontSize="sm">Download Result Image</Text>
            </Button>
          </Flex>
        )}
      </VStack>
    </Box>
  );
  
};

export default ObjectDetection;
