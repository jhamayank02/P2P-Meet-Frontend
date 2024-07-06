import { Text, Box } from '@chakra-ui/react';
import { BiSolidHeart } from "react-icons/bi";

const Footer = () => {
  return (
    <Box position="absolute" bottom="0" width="100%" paddingY="10px">
        <Text color="#898888" display="flex" justifyContent="center">Made with&nbsp;<BiSolidHeart color="red" size="22px" />&nbsp;by Mayank Jha</Text>
    </Box>
  )
}

export default Footer;
