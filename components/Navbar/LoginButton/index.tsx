import { Button, Flex, FlexProps } from '@chakra-ui/react';
import { getPageURL } from '../../../util/url';

export default function LoginButton(props: FlexProps) {
    return <Flex
        {...props}
    >
        <Button onClick={() => {
            location.href = getPageURL("/redirects/login", "?redirectHome=true")
        }}>Login</Button>
    </Flex>

}