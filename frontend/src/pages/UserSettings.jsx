import { Avatar, Box, Button, Flex, FormControl, FormLabel, HStack, Input, Menu, MenuButton, MenuItem, MenuList, Text, VStack, useToast } from '@chakra-ui/react';
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import { FiLogOut} from 'react-icons/fi';
import { updateAccountSettings, logoutUser } from '../services/authService.js';

function UserSettings() {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const username = storedUser?.username || "User";
    const [loading, setLoading] = useState(false);
    
    const toast = useToast();
    const navigate = useNavigate();
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

    const [form, setForm] = useState({
        currentPassword: "",
        email: "",
        username: "",
        newPassword: "",
        confirmPassword: "",
      });
      
    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
      
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const token = sessionStorage.getItem("token");
        const { success, message } = await updateAccountSettings(form, token);

        toast({
            title: success ? "Success" : "Error",
            description: message,
            status: success ? "success" : "error",
            duration: 5000,
            isClosable: true,
            position: "top",
        });

        if (success) {
            setForm({
            currentPassword: "",
            email: "",
            username: "",
            newPassword: "",
            confirmPassword: "",
            });
        }

        setLoading(false);
    };

    return (
        <Flex 
            direction="column"
            minH="100vh"
            minW="99vw"
            fontFamily="Montserrat, sans-serif"
            bgImage="url(https://dcm-datalabs.s3.us-east-2.amazonaws.com/images/RADAR.png)"
            bgSize="cover"
            bgRepeat="no-repeat"
            px={0}
            py={0}
            >
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

                <Menu>
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
                            <Text color="white">{username}</Text> {/* You can replace this with actual username */}
                            <ChevronDownIcon color="white" />
                        </HStack>
                    </MenuButton>
    
                    <MenuList
                        minW="165px"
                        bg={"gray"}
                        >
                        <MenuItem
                            bg={"gray"}
                            _hover={{ bg: "gray.500" }}
                            icon={<ChevronLeftIcon />}
                            onClick={() => navigate('/app')}
                            >
                            Dashboard
                        </MenuItem>
                        <MenuItem
                            bg={"gray"}
                            _hover={{ bg: "gray.500" }}
                            icon={<FiLogOut />}
                            onClick={handleLogout}
                            >
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Flex>

            <Flex
                flex="1"
                justifyContent="center"
                alignItems="center"
                px={6}
                py={4}
                bg="white"
                >
                <Box
                    display="flex"
                    flex="1"
                    color="black"
                    justifyContent="center"
                    p={6}
                    borderRadius="lg"
                    // boxShadow='dark-lg'
                    >
                    <form 
                        onSubmit={handleUpdate}
                        
                        >
                        <VStack 
                            boxShadow='dark-lg'
                            px={12}
                            py={6}
                            borderRadius={'10px'}
                            spacing={4} 
                            width="100%"
                            >
                            <FormControl isRequired>
                            <FormLabel>Current Password</FormLabel>
                            <Input 
                                type="password" 
                                name="currentPassword" 
                                value={form.currentPassword} 
                                onChange={handleChange} 
                                border={"1px solid"}
                                _hover={{ borderColor: "gray.400" }}
                                _focus={{ borderColor: "gray.400", boxShadow: "0 0 0 1px black" }}
                                />
                            </FormControl>

                            <FormControl>
                            <FormLabel>New Username</FormLabel>
                            <Input 
                                name="username" 
                                value={form.username} 
                                onChange={handleChange} 
                                border={"1px solid"}
                                _hover={{ borderColor: "gray.400" }}
                                _focus={{ borderColor: "gray.400", boxShadow: "0 0 0 1px black" }}
                                />
                            </FormControl>

                            <FormControl>
                            <FormLabel>New Email</FormLabel>
                            <Input 
                                type="email" 
                                name="email" 
                                value={form.email} 
                                onChange={handleChange} 
                                border={"1px solid"}
                                _hover={{ borderColor: "gray.400" }}
                                _focus={{ borderColor: "gray.400", boxShadow: "0 0 0 1px black" }}
                                />
                            </FormControl>

                            <FormControl>
                            <FormLabel>New Password</FormLabel>
                            <Input 
                                type="password" 
                                name="newPassword" 
                                value={form.newPassword} 
                                onChange={handleChange} 
                                border={"1px solid"}
                                _hover={{ borderColor: "gray.400" }}
                                _focus={{ borderColor: "gray.400", boxShadow: "0 0 0 1px black" }}
                                />
                            </FormControl>

                            <FormControl>
                            <FormLabel>Confirm Password</FormLabel>
                            <Input 
                                type="password" 
                                name="confirmPassword" 
                                value={form.confirmPassword} 
                                onChange={handleChange} 
                                border={"1px solid"}
                                _hover={{ borderColor: "gray.400" }}
                                _focus={{ borderColor: "gray.400", boxShadow: "0 0 0 1px black" }}
                                />
                            </FormControl>

                            <Button 
                                type="submit"  
                                variant={"solid"}
                                shadow={"md"}
                                bg={'grey'}
                                color={"white"}
                                _hover={{ bg: "gray.500" }}
                                isLoading={loading}
                                
                                >
                                Update Account
                            </Button>
                        </VStack>
                    </form>
                </Box>
            </Flex>

           {/* Footer */}
            <Flex
                bg={'white'}
                justifyContent={"flex-end"}
                px={2}
                w={'99vw'}
                >
                <Text 
                    color="black"> powered by dcmdatalabs 
                </Text>
            </Flex>

        </Flex>
    );
}

export default UserSettings;