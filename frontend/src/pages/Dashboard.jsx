import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ChevronDownIcon } from "@chakra-ui/icons";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { HiUpload } from "react-icons/hi";

import {    Avatar, 
            Box, Button, 
            Flex, FormControl, FormLabel, 
            HStack, 
            Input, 
            Menu, MenuButton, MenuList, MenuItem, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalHeader, ModalBody, 
            SimpleGrid,
            Text, 
            useToast, useDisclosure,
            VStack } from "@chakra-ui/react";

import { logoutUser, uploadUserImage, getUserImages } from "../services/authService.js";
import ImageCard from "../components/ImageCard.jsx";

function Dashboard() {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const username = storedUser?.username || "User";
    
    const navigate = useNavigate();
    const toast = useToast();
    const [userImages, setUserImages] = useState([]);

    // modal open/close states
    const {isOpen, onOpen, onClose} = useDisclosure();

    const fetchImages = async () => {
        const token = sessionStorage.getItem("token");
        const res = await getUserImages(token);
        // console.log("🧠 Images returned from backend:", res);
      
        if (res.success && Array.isArray(res.images)) {
          setUserImages(res.images);
        } else {
          setUserImages([]);
          console.warn("⚠️ Images not set: Either fetch failed or response was invalid");
        }
      };
        
    useEffect(() => {
        fetchImages();
    }, []);

    // console.log("User images:", userImages);

    const handleLogout = () => {
        logoutUser();
        navigate("/", { replace: true });

        toast({
            title: "Logged out",
            status: "success",
            duration: 1000,
            isClosable: true,
        });
    };

    const fileInputRef = useRef(); // this is the connection to the hidden input
    const [selectedFile, setSelectedFile] = useState(null);
      
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        // console.log("Selected file:", e.target.files[0]);
    };
    const [imageName, setImageName] = useState("");
    const handleNameChange = (e) => setImageName(e.target.value);

    const handleUpload = async () => {
        const token = sessionStorage.getItem("token");
      
        if (!selectedFile) {
            toast({
                title: "No file selected",
                description: "Please choose an image file to upload.",
                status: "warning",
                duration: 4000,
                isClosable: true,
                position: "top",
            });
            return;
        }
      
        if (!imageName.trim()) {
            toast({
                title: "Image name required",
                description: "Please provide a name for the image.",
                status: "warning",
                duration: 4000,
                isClosable: true,
                position: "top",
            });
            return;
        }
      
        try {
            await uploadUserImage(selectedFile, imageName, token);
            toast({
                title: "Upload successful",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        
            setSelectedFile(null);
            setImageName("");
            await fetchImages(); // ✅ REFRESH dashboard images
            onClose();
        } 
        catch (error) {
            toast({
                title: "Upload failed",
                description: error.message,
                status: "error",
                duration: 20000,
                isClosable: true,
            });
        }
    };

    return (
        <Flex
            direction="column"
            minH="100vh"
            fontFamily="Montserrat, sans-serif"
            bgImage="./assets/RADAR.png"
            bgSize="cover"
            bgRepeat="no-repeat"
            px={0}
            py={0}
            >
            {/* Top Bar */}
            <Flex
                borderBottom="1px solid white"
                alignItems="center"
                bg="grey"
                justifyContent="space-between"
                px={4}
                py={2}
                >
                <Box color="white" fontSize="3em" onClick={() => navigate('/app')} cursor={"pointer"}>
                    RADAR
                </Box>
                
                <Menu
                    color={"white"}
                    >
                    <MenuButton
                        as={Button}
                        variant="ghost"
                        _hover={{ bg: "gray.500" }}
                        px={2}
                        py={1}
                        borderRadius="md"
                        >
                        <HStack 
                            spacing={2}
                            >
                            <Avatar size="sm" name={username} />
                            <Text color="white">{username}</Text>
                            <ChevronDownIcon color="white" />
                        </HStack>
                    </MenuButton>

                    <MenuList 
                        minW="unset"
                        bg={"gray"}
                        color={"white"}
                        >
                        <MenuItem
                            bg={"gray"}
                            _hover={{ bg: "gray.500" }}
                            icon={<FiSettings />}
                            onClick={() => navigate("/settings")}
                            color={"white"}
                            >
                            Account Settings
                        </MenuItem>
                        <MenuItem
                            bg={"gray"}
                            _hover={{ bg: "gray.500" }}
                            icon={<FiLogOut />}
                            onClick={handleLogout}
                            color={"white"}
                            >
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Flex>

            {/* upload image form */}
            <Modal 
                isOpen = {isOpen} 
                onClose={onClose} 
                blockScrollOnMount= {false}
                transition={"all 0.5s"}
                isCentered
                >
                <ModalOverlay   
                    backdropFilter="blur(10px)"
                            
                />
                        
                <ModalContent   
                    maxW= {'fit-content'}
                    alignItems={'center'} 
                    bg={"lightgrey"} 
                    borderRadius={'20px'}
                    fontFamily={'Montserrat, sans-serif'}
                    px={8}
                    py={4}
                    as="form"
                    onSubmit={handleUpload}
                    >
                    <ModalCloseButton 
                        color={'black'}
                        size={'md'}                                    
                    />
                    <ModalHeader>
                        <Text 
                            fontWeight={'bold'} 
                            fontSize={'1.2em'}
                            color={'black'}
                            > 
                            Upload an Image
                        </Text>
                    </ModalHeader>
        
                    <ModalBody >
                        <VStack justifyContent="center" spacing={8}>
                            <FormControl mt={4}>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    display="none"
                                />

                                {/* styled button that triggers the hidden input */}
                                <Button
                                    width={"full"}
                                    leftIcon={<HiUpload />}
                                    colorScheme={selectedFile ? "green" : "teal"} // ✅ Changes to green if file is selected
                                    color="black"
                                    // variant={selectedFile ? "solid" : "outline"}
                                    onClick={() => fileInputRef.current?.click()}
                                    >
                                    {selectedFile ? "Image Selected ✅" : "Choose Image"}
                                </Button>

                            </FormControl>
                            <FormControl>
                                <FormLabel color={'black'} fontSize={'1em'}>No need to provide file extension</FormLabel>
                                <Input 
                                    type="text"
                                    bg={"white"}
                                    color={"black"}
                                    border={"2px solid gray"}
                                    value={imageName} 
                                    onChange={handleNameChange} 
                                    placeholder="Image name" 
                                    _placeholder={{ color: "gray.600" }}
                                />
                                            
                            </FormControl>
                            <Button
                                border={"2px solid black"} 
                                bg='lightgray'
                                color='black' 
                                mt={4} 
                                type="submit"
                                >
                                Upload Image
                            </Button>
                        </VStack>
                    </ModalBody >
                </ModalContent>
            </Modal>

            {/* Main Content */}
            <Flex
                flex="1"
                justifyContent="center"
                px={6}
                py={4}
                bg="white"
                >
                <Box
                    display="flex"
                    flex="1"
                    color="black"
                    p={6}
                    borderRadius="lg"
                    shadow="md"
                    direction="row"
                    // bg={'yellow'}
                    justifyContent={'center'}
                    >
                    <VStack>
                        <SimpleGrid
                            transition={"all 0.5s"}
                            columns={{ base: 1, md:3, lg:4 }}
                            spacing={10}
                            w={"full"}
                            >
                            <Box
                                shadow={"lg"}
                                rounded={'lg'}
                                overflow={"hidden"}
                                transition={"all 0.3s"}
                                _hover={{transform: "translateY(-5px)", shadow:"xl"}}
                                >
                                <Button minHeight={'100%'}
                                        width={"full"}
                                        color="black" 
                                        colorScheme='teal' 
                                        onClick={onOpen}
                                    >
                                        Upload image
                                </Button>
                            </Box>  

                            {userImages.length === 0 ? (
                            <Text>No images uploaded yet</Text>
                            ) : (
                            userImages.map((img) => (
                                <ImageCard key={img.name} image={img} refreshImages={fetchImages} />
                            ))
                            )}                            

                        </SimpleGrid>
                    </VStack>
                    {/* <ObjectDetection /> */}
                </Box>
            </Flex>

            {/* Footer */}
            <Flex
                bg={'white'}
                justifyContent={"flex-end"}
                px={1}
                >
                <Text 
                    color="black"> powered by dcmdatalabs 
                </Text>
            </Flex>

        </Flex>
    );
}

export default Dashboard
