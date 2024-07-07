import { useState } from "react";
import { Stack, InputGroup, InputLeftElement, Input, InputRightElement, Box, AbsoluteCenter, Button, Heading, Text, FormControl } from "@chakra-ui/react";
import { EmailIcon, PhoneIcon } from '@chakra-ui/icons';
import { FaUnlock, FaCircleUser } from "react-icons/fa6";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import REACT_APP_BACKEND_URL from "../backend";

const Register = () => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (name.length === 0 || email.length === 0 || password.length === 0) {
            toast.error('Please fill all the fields correctly')
            return;
        }

        const url = REACT_APP_BACKEND_URL + 'auth/register';
        setIsRegistering(true);

        const data = {
            "name": name,
            "email": email,
            "password": password
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            const resData = await response.json();

            if (!resData.success) {
                throw Error(resData.message);
            }

            setIsRegistering(false);
            toast.success(resData.message);
            return navigate('/');
        } catch (err) {
            setIsRegistering(false);
            toast.error(err.message);
        }
    }

    return (
        <Box position={"relative"} h={"100vh"} w={"100vw"}>
            <AbsoluteCenter w={{ base: "95%", md: "40%" }} paddingX="15px" paddingY="40px" borderWidth="1px" borderStyle="solid" borderColor="#ecf0f5" borderRadius="6px">
                <Heading textAlign={"left"} size="2xl" marginBottom="5px">Register Page</Heading>
                <Text marginBottom={"40px"} textAlign={"left"} fontSize="2xl">Welcome, create an account to continue</Text>

                {/* <FormControl> */}
                <Stack spacing={3} width={"100%"} >
                    <InputGroup>
                        <InputLeftElement pointerEvents='none' color='gray.300' fontSize='1.2em'>
                            <FaCircleUser />
                        </InputLeftElement>
                        <Input required value={name} onChange={(e) => setName(e.target.value)} type='text' placeholder='Full Name' />
                    </InputGroup>

                    <InputGroup>
                        <InputLeftElement pointerEvents='none' color='gray.300' fontSize='1.2em'>
                            <EmailIcon />
                        </InputLeftElement>
                        <Input required value={email} onChange={(e) => setEmail(e.target.value)} type='email' placeholder='Email Id' />
                    </InputGroup>

                    <InputGroup>
                        <InputLeftElement pointerEvents='none' color='gray.300' fontSize='1.2em'>
                            <FaUnlock />
                        </InputLeftElement>
                        <Input required value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder='Password' />
                        <InputRightElement>
                        </InputRightElement>
                    </InputGroup>
                    <Button isLoading={isRegistering} onClick={handleRegister} color="white" backgroundColor='black' variant='solid'>Register</Button>
                </Stack>
                <Box marginTop="4px" color="#03A9F4">
                    <Link to="/">Already have an account?</Link>
                </Box>
            </AbsoluteCenter>
        </Box>
    )
}

export default Register;
