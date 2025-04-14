import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar,
    Box, Button, 
    Container, 
    Flex, FormControl,
    Heading,
    Input, InputGroup, InputRightElement,
    Link,
    Stack, 
    Text,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    VStack,
    useDisclosure, useToast,
    HStack} from '@chakra-ui/react'

import bg_image from '../assets/RADAR.png';
import {FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { GrUserNew } from "react-icons/gr";
import { loginUser, registerUser } from "../services/authService";

function Login() {

    const navigate = useNavigate();

    useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
        navigate("/app", { replace: true });
    }
    }, []);
    // -----purely frontend functionalities------
        // scrolling to about section from the about function
        const scrollToAbout = () => {
            document.getElementById('about-section').scrollIntoView({behavior: 'smooth'});
        };

        // usetoast for displaying alerts
        const toast = useToast();

        // modal open/close states
        const {isOpen, onOpen, onClose} = useDisclosure();

        const {
            isOpen: isInfoOpen,
            onOpen: onInfoOpen,
            onClose: onInfoClose
          } = useDisclosure();
        
        // showing/hiding password functionalities
        const [showPassword1, setShowPassword1] = useState(false);
        const handleShowClick1 = () => setShowPassword1(!showPassword1);

        const [showPassword2, setShowPassword2] = useState(false);
        const handleShowClick2 = () => setShowPassword2(!showPassword2);

        const [showPassword3, setShowPassword3] = useState(false);
        const handleShowClick3 = () => setShowPassword3(!showPassword3);
    
    // -----backend functionalities-----
    // form states for logging in
    const [loginIdentifier, setloginIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');


    const handleLogin = async (e) => {
        e.preventDefault();
        const { success, token, user, message } = await loginUser({identifier: loginIdentifier, password: loginPassword});
        console.log(success, token);

        
        if (!success) {
          toast({
            title: 'Login failed',
            description: message || 'Invalid credentials',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top',
          });
          return;
        }
      
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
      
        toast({
          title: 'Login successful',
          description: `Welcome back, ${user.username}!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      
        navigate('/app', { replace: true });
    };
    
    const [registerData, setRegisterData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

    const handleRegister = async (e) => {
        e.preventDefault();
      
        const { success, token, user, message } = await registerUser(registerData);
      
        if (!success) {
          toast({
            title: "Registration failed",
            description: message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          return;
        }
      
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      
        toast({
          title: "Welcome!",
          description: `Account created for ${user.username} You can now login!`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        onClose();
      
    }

    return (
    <>
    
    <Container  
                fontFamily={'Montserrat, sans-serif'}
                h={"100vh"}
                minW={'100%'}
                style={{
                    backgroundImage: `url(${bg_image})`}}
                bgSize="cover"
                bgRepeat="no-repeat"
                justifyContent={'center'}
                >
        
        {/* Radar text and about button */}
        <Flex   
                justifyContent={"space-between"} 
                >
            <Box 
                 color={"white"} 
                 fontSize={'3em'}
                 >
                RADAR
            </Box>
            
            <Box 
                mt={"0.2em"}     
                fontSize={"2em"}
                cursor={"pointer"}
                _hover={{transform: "translateY(5px)", shadow:"m"}}
                transition={"all 0.3s"}
                onClick={scrollToAbout}
                >
                About
            </Box>

        </Flex>

        {/* signin box */}
        {!isOpen && (<Flex   
                height="85vh" 
                align="center"
                justify="center"
                transition={"all 0.3s"}
                zIndex={1000}
                >
            
            <Stack  
                alignItems="center"
                backgroundColor={'lightgrey'}
                borderRadius={'20px'}
                p={8}
                _hover={{transform: "translateY(-5px)", shadow:"xl"}}
                transition={"all 0.3s"}
                shadow={"lg"}
                >
                
                <Avatar icon={<FaUserCircle fontSize='3.5rem' color="black"/>} />
                <Heading color={"black"}> Welcome </Heading>
                
                <Box 

                    borderRadius={'20px'} 
                    >
                    <form onSubmit={handleLogin}>
                        <Stack
                            color={"black"}  
                            spacing={8}
                            p={"1em"}
                            boxShadow={"2%"}
                            >
                        
                        <FormControl>    
                            <Input 
                                bg="white"
                                border={'2px solid black'}
                                type="text" 
                                placeholder="email or username" 
                                _placeholder={{ color: "gray.600" }}
                                value={loginIdentifier}
                                onChange={(e) => setloginIdentifier(e.target.value)}
                                />
                        </FormControl>

                        <FormControl>
                            <InputGroup>
                                <Input  
                                        bg="white"
                                        border={'2px solid black'}
                                        type={showPassword1 ? "text" : "password"}
                                        placeholder="Password"
                                        _placeholder={{ color: "gray.600" }}
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}/>
                                <InputRightElement 
                                                    width="2.5rem"  
                                                    cursor={"pointer"} 
                                                    onClick={handleShowClick1}>
                                    {showPassword1 ? <FaEyeSlash size={'50%'}/> : <FaEye size={'50%'} />}
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>

                            <Button 
                                    border={'2px solid black'}
                                    type="submit"
                                    borderRadius={"5px"}
                                    colorScheme={"blue"}
                                    size={"lg"}
                                    >
                                Login
                            </Button>
                        </Stack>
                    </form>    
                </Box>
                <Box 
                        color={'black'}
                    >
                    New to us?{" "}
                    <Link onClick = { onOpen } cursor={"pointer"}>
                        Sign Up
                    </Link>
                </Box>    
            </Stack>
        </Flex>)}
        
        {/* Sign up box (popup modal)  */}
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
                            >
                <ModalCloseButton 
                        color={'black'}
                        size={'md'}
                                    
                                    />
                <ModalHeader>
                    <VStack mt={4}>
                        <GrUserNew color={'black'} 
                                    size={'15%'}
                                />
                        <Text 
                            fontWeight={'bold'} 
                            fontSize={'1.2em'}
                            color={'black'}
                            > 
                            Sign up with us </Text>
                    </VStack>
                </ModalHeader>
                

                <ModalBody >
                    <VStack >
                        <form onSubmit={handleRegister}>
                            <Stack  
                                    spacing={4}
                                    p={"1rem"}
                                    boxShadow={"2%"}
                                    mb={8}
                                    >
                                
                                <FormControl>
                                        <Input 
                                            color={'black'}
                                            bg="white"
                                            type="text" 
                                            placeholder="username" 
                                            _placeholder={{ color: "gray.600" }} 
                                            border={'2px solid black'}
                                            onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                                            />
                                </FormControl>

                                <FormControl>
                                        <Input 
                                            color={'black'}
                                            bg="white"
                                            type="email" 
                                            placeholder="email address" 
                                            _placeholder={{ color: "gray.600" }} 
                                            border={'2px solid black'}
                                            onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                            />
                                </FormControl>
                                
                                <FormControl>
                                    <InputGroup>
                                        <Input  
                                                color={'black'}
                                                bg="white"
                                                border={'2px solid black'}
                                                type={showPassword2 ? "text" : "password"}
                                                placeholder="Password"
                                                _placeholder={{ color: "gray.600" }}
                                                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                                />
                                        <InputRightElement 
                                                            color={"black"}
                                                            width="2.5rem" 
                                                            cursor={"pointer"} 
                                                            onClick={handleShowClick2}>
                                            {showPassword2 ? <FaEyeSlash size={'50%'}/> : <FaEye size={'50%'} />}
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>

                                <FormControl>
                                    <InputGroup>
                                        <Input  
                                                color={'black'}
                                                bg="white"
                                                border={'2px solid black'}
                                                type={showPassword3 ? "text" : "password"}
                                                placeholder="Confirm Password"
                                                _placeholder={{ color: "gray.600" }}
                                                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                                            />
                                        <InputRightElement  
                                                            color={"black"}
                                                            width="2.5rem" 
                                                            cursor={"pointer"} 
                                                            onClick={handleShowClick3}>
                                            {showPassword3 ? <FaEyeSlash size={'50%'}/> : <FaEye size={'50%'} />}
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>
                                
                                <Button 
                                        border={'2px solid black'}
                                        color={'black'} 
                                        type="submit"
                                        borderRadius={"5px"}
                                        >
                                    Sign Up
                                </Button>
                            </Stack>
                        </form>
                    </VStack>
                </ModalBody >

            </ModalContent>

        </Modal>
        <Modal 
                isOpen = {isInfoOpen} 
                onClose={onInfoClose} 
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
                            Information about this website
                        </Text>
                </ModalHeader>
                

                <ModalBody >
                    
                </ModalBody >

            </ModalContent>

        </Modal>
        <Flex   
                
                justifyContent={"flex-end"}
                mt={'1em'}
        >
            <Text    
                position={'absolute'}
                color={'white'}
            >
                powered by dcmdatalabs
            </Text>
        </Flex>
                                 
    </Container>
        
    <div id="about-section"
         style={{
         
         padding: '35px',
         backgroundColor: 'lightgrey',
         fontFamily: 'Montserrat, sans-serif',
         textAlign: 'justify',
         color: 'black'}} >
        
        <h1 
            style={{
                fontSize:'2em'
            }}>
                About RADAR
        </h1>
            <br/>
        <p>
            Though AI concepts and theory date back to nearly 70 years, the true fillip came only in recent years.
            The main reason is the use of multi-layer perceptron and deep learning technology advancement along
            with associated hardware with powerful GPU. 
        </p>
            <br/>
        <p>
            The Automatic Defect Recognition System (ADRS) utilizes deep learning paradigm of A.I. technology on
            NDT Digitized X-Ray Film images (‘NDTDXFI’) data set for abnormality studies.
        </p>
            <br/>
        <p>
            ADRS has been designed and developed by dcmdatalabs, a company focused on using AI Deep Learning
            paradigm in solutions to enterprise business and healthcare. The idea is to address “fundamental
            disconnect brought about by the rapid pace of change in intelligent technology” and quickly exploit
            capabilities of technology before changes happen.
        </p>
            <br/>
        <p>
            The pilot phase of the system is designed to identify defects in Welds and Joints from RT X-Ray films.
            The system is able to classify the Weld / Joint as Normal, Acceptable or Defective.
        </p>
    </div>
</>
    

);
}

export default Login;

