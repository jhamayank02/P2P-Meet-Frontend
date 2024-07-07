import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  Button,
  Flex,
  Box,
  Text,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { BiSolidSend } from "react-icons/bi";

const MessageDrawer = ({ isMessageDrawerOpen, onMessageDrawerClose, remoteUserName, dataChannel, peerConnection }) => {

  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);


  const sendMessageHandler = () => {
    if (message.trim() === '') {
      return;
    }
    if (connected) {
      dataChannel.send(message);
      setMessages(prev => [...prev, { message, sender: "You" }]);
    }
    setMessage('');
  }

  useEffect(() => {
    if (peerConnection) {
      peerConnection.ondatachannel = (event) => {
        const receiveChannel = event.channel;

        receiveChannel.onmessage = (event) => {
          setMessages(prev => [...prev, { message: event.data, sender: remoteUserName }]);
        }
      }
    }
  }, [peerConnection, remoteUserName])

  // Listen for data channel events
  useEffect(() => {
    if (dataChannel) {
      // Send channel
      dataChannel.onopen = () => {
        setConnected(true);
      }

      dataChannel.onclose = () => {
        setConnected(false);
      }
    }
  }, [dataChannel])

  return (
    <>
      <Drawer
        isOpen={isMessageDrawerOpen}
        placement='right'
        onClose={onMessageDrawerClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader padding="10px 7px">Send Messages</DrawerHeader>

          <DrawerBody position="relative" display="flex" flexDirection="column" justifyContent="space-between" padding="0 4px">
            <Flex padding="0 7px" flex="1" flexDirection="column" overflowY="scroll" overflowX="hidden">
              {messages.map((message, ind) => <Box key={ind} border="1px solid #f1e9e9" maxWidth="70%" padding="1px 8px" marginRight={message.sender === "You" ? "0" : "auto"} marginLeft={message.sender === "You" ? "auto" : "0"} borderRadius="9px" backgroundColor="#f1f1f1" marginBottom="5px">
                <Text fontWeight="500" color={message.sender === "You" ? "#4a88d5" : "#e34949"}>{message.sender}</Text>
                <Text color="#444847">{message.message}</Text>
              </Box>)}
            </Flex>

            <InputGroup marginTop="3px">
              <Input disabled={!connected} onChange={(e) => setMessage(e.target.value)} value={message} placeholder='Type something...' />
              {connected && <InputRightElement>
                <BiSolidSend size="26px" color='#3167ff' onClick={sendMessageHandler} />
              </InputRightElement>}
            </InputGroup>
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onMessageDrawerClose}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default MessageDrawer;
