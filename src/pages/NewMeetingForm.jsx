import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { Stack, InputGroup, InputLeftElement, Input, InputRightElement, Box, AbsoluteCenter, Button, Heading, Text, Checkbox, Flex, Toast } from "@chakra-ui/react";
import { EmailIcon } from '@chakra-ui/icons';
import { FaAlignCenter, FaClock, FaCopy } from "react-icons/fa6";

const NewMeetingForm = () => {

    const [meetingTopic, setMeetingTopic] = useState('');
    const [meetingDateAndTime, setMeetingDateAndTime] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [meetingCode, setMeetingCode] = useState('');
    const [cookies] = useCookies();
    const navigate = useNavigate();

    const copyBtnHandler = () => {
        navigator.clipboard.writeText(meetingCode);
        toast.success('Copied to clipboard!')
    }

    const handleNewMeeting = async () => {
        if (meetingTopic.length === 0 || meetingDateAndTime.length === 0) {
            toast.error("Please fill all the fields");
            return;
        }

        const url = process.env.REACT_APP_BACKEND_URL + 'meeting/new-meeting';
        setIsGenerating(true);

        const data = {
            "meetingTopic": meetingTopic,
            "meetingDateAndTime": meetingDateAndTime,
            "isPrivate": isPrivate
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${cookies?.access_token}`
                },
                body: JSON.stringify(data)
            })

            const resData = await response.json();

            if (resData.status !== 200) {
                throw Error(resData.message);
            }

            setIsGenerating(false);
            setMeetingCode(resData.meetingCode);
        }
        catch (err) {
            setIsGenerating(false);
            toast.error(err.message);
        }
    }

    return (
        <Box position={"relative"} h={"80vh"} w={"100vw"}>
            <AbsoluteCenter w={{ base: "95%", md: "40%" }} paddingX="15px" paddingY="40px" borderWidth="1px" borderStyle="solid" borderColor="#ecf0f5" borderRadius="6px">

                <Box>
                    <Heading textAlign={"left"} size="lg" marginBottom="30px">Start a new meeting</Heading>

                    <Stack spacing={3} width={"100%"} >
                        <InputGroup>
                            <InputLeftElement pointerEvents='none' color='gray.300' fontSize='1.2em'>
                                <FaAlignCenter />
                            </InputLeftElement>
                            <Input required value={meetingTopic} onChange={(e) => setMeetingTopic(e.target.value)} type='text' placeholder='Meeting topic' />
                        </InputGroup>

                        <InputGroup>
                            <InputLeftElement pointerEvents='none' color='gray.300' fontSize='1.2em'>
                                <FaClock />
                            </InputLeftElement>
                            <Input required value={meetingDateAndTime} onChange={(e) => setMeetingDateAndTime(e.target.value)} placeholder='Select Date and Time' size='md' type='datetime-local' />
                        </InputGroup>

                        {/* <Checkbox>Private meeting</Checkbox> */}

                        {!meetingCode && <Button marginTop="8px" onClick={handleNewMeeting} color="white" backgroundColor='black' variant='solid'>Generate a meeting code</Button>}
                        {meetingCode && <Flex alignItems="center">
                            <Text>Meeting code:&nbsp;</Text>
                            <Text color="#00aaf1" marginRight="10px">{meetingCode}</Text>
                            <FaCopy onClick={copyBtnHandler} color="#cbcccd" />
                        </Flex>}
                        <Button onClick={() => navigate(-1)} color="black" borderColor='black' variant='outline'>Return to home</Button>
                    </Stack>
                </Box>
            </AbsoluteCenter>
        </Box>
    )
}

export default NewMeetingForm;
