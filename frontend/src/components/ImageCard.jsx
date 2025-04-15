import {
  Box, Button, FormControl, FormLabel, Heading, HStack, IconButton, Image,
  Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
  ModalHeader, ModalOverlay, Text, Tooltip, useDisclosure, useToast, VStack
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { HiUpload } from "react-icons/hi";
import obj_logo from "../assets/obj_detect_logo.png";
import { deleteImage, updateImageName, updateImageFile } from "../services/authService.js";
import ObjectDetection from "./ObjectDetection.jsx";
import { uploadDetectionResult } from "../services/imageService.js";

const ImageCard = ({ image, refreshImages }) => {
  const token = sessionStorage.getItem("token");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDetectOpen,
    onOpen: onDetectOpen,
    onClose: onDetectClose
  } = useDisclosure();

  const toast = useToast();
  const [currentImage, setCurrentImage] = useState(image);
  useEffect(() => {
    if (isDetectOpen) {
      // find updated image from parent
      setCurrentImage(prev => {
        return refreshImages
          ? refreshImages().then(() => {
              const updated = JSON.parse(sessionStorage.getItem("userImages"))?.find(img => img.name === image.name);
              return updated || image;
            })
          : image;
      });
    }
  }, [isDetectOpen]);
  const [object_detection, setObjectDetection] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const handleDetectionComplete = async ({ canvas, count }) => {
    try {
      setDetecting(true);

      if (!image.name) {
        toast({
          title: "Invalid Image",
          description: "Image name is missing",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      const filename = `${image.name}_result.png`;
      const file = new File([blob], filename, { type: "image/png" });

      const formData = new FormData();
      formData.append("result", file);
      formData.append("imageName", image.name);
      formData.append("count", count);

      const res = await uploadDetectionResult(formData, token);

      if (res.success) {
        toast({
          title: "Detection Saved",
          description: `${count} object(s) detected.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        refreshImages();
        // setObjectDetection(false);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      toast({
        title: "Detection Upload Failed",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setDetecting(false);
    }
  };

  const [updatedName, setUpdatedName] = useState(image.name);
  const [newFile, setNewFile] = useState(null);
  const fileInputRef = useRef();

  const handleDelete = async () => {
    const res = await deleteImage(image.name, token);
    toast({
      title: res.success ? "Deleted" : "Error",
      description: res.message,
      status: res.success ? "success" : "error",
      duration: 3000,
      isClosable: true
    });
    refreshImages();
  };

  const handleUpdate = async () => {
    if (!updatedName.trim()) {
      toast({
        title: "Image name required",
        description: "Please enter a valid name.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (updatedName === image.name && !newFile) {
      toast({
        title: "No changes made",
        status: "info",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      if (updatedName !== image.name) {
        const res = await updateImageName(image.name, updatedName, token);
        if (!res.success) {
          toast({
            title: "Update failed",
            description: res.message,
            status: "error",
            duration: 3000,
            isClosable: true
          });
          return;
        }
      }

      if (newFile) {
        await updateImageFile(updatedName, newFile, token);
      }

      toast({
        title: "Image updated",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      refreshImages();
      onClose();
      setNewFile(null);
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Box shadow="lg" rounded="lg" overflow="hidden" transition="all 0.3s" _hover={{ transform: "translateY(-5px)", shadow: "xl" }} bg="lightgrey">
      <Image src={image.url} alt={image.name} h="48" w="full" objectFit="cover" cursor="pointer" onClick={onDetectOpen}/>
      <Box p={4}>
        <Heading as="h3" size="md" mb={2}>
          {image.name}
        </Heading>
        <HStack spacing={2}>
          <Tooltip label="Object Detection" hasArrow placement="top">
            <IconButton icon={<Image src={obj_logo} boxSize="2.25rem" objectFit="contain" />} onClick={onDetectOpen} colorScheme="blue" color="black" />
          </Tooltip>
          <Tooltip label="Update Image" hasArrow placement="top">
            <IconButton icon={<FiEdit />} onClick={onOpen} colorScheme="teal" />
          </Tooltip>
          <Tooltip label="Delete Image" hasArrow placement="top">
            <IconButton icon={<RiDeleteBinLine />} onClick={handleDelete} colorScheme="red" />
          </Tooltip>
        </HStack>
      </Box>

      {/* Update Modal */}
      <Modal isOpen={isOpen} onClose={() => { onClose(); setUpdatedName(image.name); setNewFile(null); }} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent maxW="fit-content" alignItems="center" bg="lightgrey" borderRadius="20px" fontFamily="Montserrat, sans-serif" px={8} py={4} color="black">
          <ModalCloseButton color="black" size="md" />
          <ModalHeader>
            <Text fontWeight="bold" fontSize="1.2em" color="black">Update Image</Text>
          </ModalHeader>
          <ModalBody>
            <VStack justifyContent="center" spacing={8}>
              <FormControl mt={4}>
                <Input type="file" accept="image/*" onChange={(e) => setNewFile(e.target.files[0])} ref={fileInputRef} display="none" />
                <Button width="full" leftIcon={<HiUpload />} colorScheme={newFile ? "green" : "teal"} color="black" onClick={() => fileInputRef.current?.click()}>
                  {newFile ? "Image Selected ✅" : "Choose New Image"}
                </Button>
                {newFile && <Text fontSize="sm" color="gray.600">Selected: {newFile.name}</Text>}
              </FormControl>
              <FormControl>
                <FormLabel color="black" fontSize="1em">Rename (no need to add extension)</FormLabel>
                <Input type="text" bg="white" color="black" border="2px solid gray" value={updatedName} onChange={(e) => setUpdatedName(e.target.value)} placeholder="New image name" _placeholder={{ color: "gray.600" }} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpdate} isDisabled={updatedName === image.name && !newFile}>Update</Button>
            <Button variant="ghost" color="black" _hover={{ bg: "gray.200" }} onClick={() => { onClose(); setUpdatedName(image.name); setNewFile(null); }}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Object Detection Modal */}
        <Modal isOpen={isDetectOpen} onClose={onDetectClose} isCentered>
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent
                maxW="fit-content"
                alignItems="center"
                bg="lightgrey"
                borderRadius="20px"
                fontFamily="Montserrat, sans-serif"
                px={4}
                py={4}
                color="black"
                >
                <ModalCloseButton color="black" size="md" />
                <ModalHeader>
                    <Text fontWeight="bold" fontSize="1.2em" color="black">Object Detection</Text>
                </ModalHeader>
                <ModalBody>
                    <HStack justifyContent="center" spacing={4}>
                        <Box
                            border="4px solid black"
                            h="25rem"
                            w="45rem"
                            justifyContent="center"
                            alignItems="center"
                            display="flex"
                            >
                            <Image src={image.url} alt={image.name} h="24rem" objectFit="scaledown" />
                        </Box>

                        <Box
                            border="4px solid black"
                            h="25rem"
                            w="45rem"
                            justifyContent="center"
                            alignItems="center"
                            display="flex"
                            >
                            {image.res_url ? (
                                <ObjectDetection image={{ ...image, url: image.res_url }} />
                            ) : !object_detection ? (
                                <Button
                                colorScheme="teal"
                                onClick={() => setObjectDetection(true)}
                                isLoading={detecting}
                                >
                                Perform Object Detection
                                </Button>
                            ) : (
                                <ObjectDetection
                                image={image}
                                onDetectionComplete={async (result) => {
                                    await handleDetectionComplete(result);
                                    setObjectDetection(false);        // close detection view
                                }}
                                />
                            )}
                        </Box>
                    </HStack>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="ghost"
                        color="black"
                        _hover={{ bg: "gray.200" }}
                        onClick={() => {
                        onDetectClose();
                        setObjectDetection(false);             // reset detection view
                        }}
                        >
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </Box>
  );
};

export default ImageCard;
