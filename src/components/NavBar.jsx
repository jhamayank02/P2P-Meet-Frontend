import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Box, Flex, HStack, Icon, Image, Text, Button, Menu, MenuButton, MenuList, MenuItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import moment from 'moment';
import { MdDelete } from "react-icons/md";
import logo from "../assets/images/logo.png";
import { toast } from 'react-toastify';
import { userNotExists } from "../redux/reducers/auth";
import { useCookies } from 'react-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaCopy } from "react-icons/fa6";
import REACT_APP_BACKEND_URL from '../backend';

const NavBar = () => {

    const auth = useSelector(state => state.auth);
    const [cookies, removeCookies] = useCookies();
    const [meetings, setMeetings] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const logoutHandler = () => {
        if (cookies?.access_token) {
            removeCookies('access_token');
            toast.success('Logged out successfully');
            dispatch(userNotExists());
            navigate('/');
        }
    }
    
    const myMeetingsHandler = async () => {
        try {
            const url = REACT_APP_BACKEND_URL + 'meeting/my-meetings';
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    authorization: `Bearer ${cookies?.access_token}`
                }
            });
            const resData = await response.json();
            
            if (!resData.success) {
                throw Error(resData.message);
            }
            setMeetings(resData.meetings);
            onOpen();
        }
        catch (err) {
            toast.error(err.message);
        }
    }
    
    const deleteMeetingHandler = async (meetingId) => {
        try {
            const url = process.env.REACT_APP_BACKEND_URL + 'meeting/delete-meeting';
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    authorization: `Bearer ${cookies?.access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "meetingId": meetingId
                })
            })
            const resData = await response.json();
            
            if (!resData.success) {
                throw Error(resData.message);
            }
            
            toast.success(resData.message);
            myMeetingsHandler();
        }
        catch (err) {
            toast.error(err.message);
        }
    }
    
    const copyBtnHandler = (meetingCode) => {
        navigator.clipboard.writeText(meetingCode);
        toast.success('Copied to clipboard!')
    }

    useEffect(() => {
        if (!auth.email) {
            navigate('/');
        }
    }, []);

    return (
        <Box>
            <HStack paddingX="40px" paddingY="8px" alignItems="center" justifyContent="space-between">
                <Link to="/home">
                    <Flex cursor="pointer" alignItems="center">
                        <Image h="20px" w="30px" src={logo} marginRight="10px" />
                        <Text fontWeight="300" fontSize="2xl">P2P Meet</Text>
                    </Flex>
                </Link>

                <Menu>
                    <MenuButton><Avatar cursor="pointer" size="sm" name={auth?.name} /></MenuButton>
                    <MenuList>
                        <MenuItem as='span' onClick={myMeetingsHandler}>
                            My Meetings
                        </MenuItem>
                        <MenuItem as='span' onClick={logoutHandler}>
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </HStack>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Meetings Scheduled By You</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {meetings.length === 0 && <Text textAlign="center">You have not scheduled any meeting.</Text>}
                        {meetings.map(meeting => <Flex alignItems="center" justifyContent="space-between" borderBottom="1px #e3dfdf solid" paddingY="4px" paddingX="4px" key={meeting._id}>
                            <Text fontWeight="600" fontSize="18px">{meeting.meetingTopic}</Text>
                            <Text fontSize="18px">{moment(new Date(meeting.meetingDateAndTime)).format("DD/MM/YYYY hh:mm A")}</Text>
                            <Flex alignItems="center" columnGap="5px">
                                <FaCopy onClick={() => copyBtnHandler(meeting.meetingCode)} color="#cbcccd" size='20px' />
                                <MdDelete onClick={() => deleteMeetingHandler(meeting._id)} color='#ef1212ab' size='20px' />
                            </Flex>

                        </Flex>)}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='red' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    )
}

export default NavBar;
