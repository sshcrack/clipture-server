import { Flex, Text } from '@chakra-ui/react';

export default function Footer() {
    return <a style={{ textDecoration: "underline" }} href='https://sshcrack.me' target='_blank' rel='noreferrer'>
        <Flex
            w='100%'
            flex='0'
            justifyContent='center'
            alignItems='center'
        >
            <Text mr='3'>Made by</Text>
            <img style={{width: "32px", height: "32px"}} src='/api/user/image?id=cl92zsdb60010opm8uvqe0nrw' alt='sshcrack icon' />
            <Text ml='1'>sshcrack</Text>
        </Flex>
    </a>
}