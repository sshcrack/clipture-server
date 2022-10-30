/* eslint-disable @next/next/no-img-element */
import { Avatar, Button, Flex, FlexProps, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { AiOutlineDown } from 'react-icons/ai';
import styles from "../../../styles/Navbar/Profile/index.module.scss";
import { getPageURL } from '../../../util/url';

export default function Profile(props: FlexProps) {
    const { data } = useSession()

    if (!data || !data.user)
        return <Text>Not authenticated.</Text>

    const { name } = data.user
    return <Flex
        flex='0'
        justifyContent='center'
        alignItems='center'
        {...props}
    >
        <Menu>
            <MenuButton
                as={Button}
                p='7 !important'
                mt='2'
                rightIcon={<AiOutlineDown />}
                className={styles.mainButton}
            >
                <Avatar src={"/api/user/image"} name={name ?? undefined} />
                <Text>{name}</Text>
            </MenuButton>
            <MenuList pb='0'>
                <MenuItem
                    onClick={() => location.href = getPageURL("/profile", "")}
                >Profile</MenuItem>
                <MenuItem
                    pb='1'
                    roundedBottom='md'
                    bgColor='red.500'
                    onClick={() => location.href = getPageURL("/redirects/logout", "?redirectHome=true")}
                >Sign Out</MenuItem>
            </MenuList>
        </Menu>
    </Flex>
}