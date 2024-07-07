import { useState } from "react";
import { AbsoluteCenter, Box, Button, Flex, Heading, Text, InputGroup, InputLeftElement, Input } from "@chakra-ui/react";
import { BiSolidAddToQueue, BiSolidKeyboard } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import REACT_APP_BACKEND_URL from "../backend";

const Homepage = () => {

    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState('');
    const [cookies] = useCookies();

    const joinBtnHandler = async () => {
        if (!meetingCode) {
            toast.error('Please enter a valid meeting code');
            return;
        }

        try {
            const url = REACT_APP_BACKEND_URL;

            const response = await fetch(url + 'meeting/is-valid-meeting-code', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${cookies?.access_token}`
                },
                body: JSON.stringify({ meetingCode })
            });
            const resData = await response.json();

            if (!resData.success) {
                throw Error(resData.message);
            }
            navigate('/join-meeting', { state: { meetingCode: meetingCode } });
        }
        catch (err) {
            toast.error(err.message);
        }
    }

    return (
        <Box width="100vw" height="80vh" position="relative">
            <AbsoluteCenter width={{ base: "95%", md: "500px" }}>
                <Box textAlign="left">
                    <Heading marginBottom="10px" size={{ base: 'lg', md: 'lg', lg: 'xl' }}>Start your video meeting journey with us today!</Heading>
                    <Text fontSize={{sm: "sm", md: "xl"}}>Wherever you are, whoever you're meeting with, we're here to bring you together seamlessly</Text>

                    <Flex width="100%" marginTop="30px"
                        flexDirection={{ base: "column", md: "row" }}>
                        <Button onClick={() => navigate('/home/new-meeting')} marginRight={{ md: "5px" }} marginBottom={{ base: "5px" }} leftIcon={<BiSolidAddToQueue />} color="white" backgroundColor="#3167ff" variant='solid'>New meeting</Button>

                        <InputGroup width={{ base: "100%", md: "60%" }} marginRight={{ md: "5px" }} marginBottom={{ base: "5px" }}>
                            <InputLeftElement pointerEvents='none'>
                                <BiSolidKeyboard color='gray.300' />
                            </InputLeftElement>
                            <Input value={meetingCode} onChange={(e) => setMeetingCode(e.target.value)} type='text' placeholder='Join with a meeting code' />
                        </InputGroup>
                        <Button marginBottom={{ base: "5px" }} color="#3167ff" variant='ghost' onClick={joinBtnHandler}>Join</Button>
                    </Flex>
                </Box>
            </AbsoluteCenter>
        </Box>
    )
}

export default Homepage;
