import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { Stack, InputGroup, InputLeftElement, Input, InputRightElement, Box, AbsoluteCenter, Button, Heading, Text, textDecoration } from "@chakra-ui/react";
import { EmailIcon } from '@chakra-ui/icons';
import { FaUnlock } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { userExists } from "../redux/reducers/auth";
import { useDispatch } from "react-redux";
import REACT_APP_BACKEND_URL from "../backend";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [cookies, setCookie] = useCookies();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async () => {

        if (email.length === 0 || password.length === 0) {
            toast.error('Please enter a valid Email Id and Password');
            return;
        }

        setIsLoggingIn(true);
        const url = REACT_APP_BACKEND_URL + 'auth/login';

        const data = {
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

            setIsLoggingIn(false);
            setCookie('access_token', resData.access_token);
            dispatch(userExists({ email: resData.email, id: resData.id, name: resData.name }));
            toast.success(resData.message);
            return navigate('/home');
        }
        catch (err) {
            setIsLoggingIn(false);
            toast.error(err.message);
        }
    }

    const handleLoginWithCookie = async () => {
        if (cookies.access_token) {
            const url = REACT_APP_BACKEND_URL + 'auth/check-is-logged-in';

            try {
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "authorization": `Bearer ${cookies.access_token}`
                    }
                })
                const resData = await response.json();
                if (!resData.success) {
                    throw Error(resData.message);
                }

                setCookie('access_token', resData.access_token);
                // TODO -> Handle Email
                dispatch(userExists({ email: resData.email, id: resData.id, name: resData.name }));
                setIsLoggingIn(false);
                toast.success(resData.message);
                return navigate('/home');
            }
            catch (err) {
                setIsLoggingIn(false);
                toast.error(err.message);
            }
        }

        return;
    }

    useEffect(() => {
        if(cookies?.access_token !== 'undefined'){
            handleLoginWithCookie();
        }
    }, []);

    return (
        <Box overflowX="hidden" position={"relative"} h={"100dvh"} w={"100dvw"}>
            <AbsoluteCenter w={{ base: "95%", md: "40%" }} paddingX="15px" paddingY="40px" borderWidth="1px" borderStyle="solid" borderColor="#ecf0f5" borderRadius="6px">
                <Heading textAlign={"left"} size="2xl" marginBottom="5px">Login Page</Heading>
                <Text marginBottom={"40px"} textAlign={"left"} fontSize={{sm: "xl", md: "2xl"}}>Welcome back, login to continue</Text>

                <Stack spacing={3} width={"100%"} >
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
                        <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' />
                        <InputRightElement>
                        </InputRightElement>
                    </InputGroup>
                    <Button isLoading={isLoggingIn} onClick={handleLogin} color="white" backgroundColor='black' variant='solid'>Login</Button>
                </Stack>

                <Box marginTop="4px" color="#03A9F4">
                    <Link to="/register">Don't have an account?</Link>
                </Box>
            </AbsoluteCenter>
        </Box>
    )
}

export default Login;
