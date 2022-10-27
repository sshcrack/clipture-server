import { Button, Flex } from '@chakra-ui/react';

export default function DownloadButtons() {
    return <Flex
        mt='10'
        w='100%'
        justifyContent='center'
        alignItems='center'
    >
        <Button w='15em' h='5em' colorScheme='green' onClick={() => location.pathname = '/api/download'}>Download</Button>
    </Flex>
}