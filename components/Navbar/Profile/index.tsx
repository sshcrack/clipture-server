/* eslint-disable @next/next/no-img-element */
import { useSession } from 'next-auth/react';
import { AiOutlineDown } from 'react-icons/ai';
import styles from "../../../styles/Navbar/Profile/index.module.scss";
import { getPageURL } from '../../../util/url';
import { MenuItem, MenuRoot, MenuTrigger, MenuContent, MenuItemText } from '../../ui/menu';
import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import { Avatar } from '../../ui/avatar';

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
        <MenuRoot onSelect={({ value }) => {
            if (value === "view-profile")
                location.href = getPageURL("/profile", "")
            if (value === "sign-out")
                location.href = getPageURL("/redirects/logout", "?redirectHome=true")
        }}>
            <MenuTrigger asChild>
                <Button
                    variant="subtle"
                    p='7 !important'
                    mt='2'
                    className={styles.mainButton}
                >
                    <Avatar src={"/api/user/image"} name={name ?? undefined} />
                    <Text>{name}</Text>
                    <AiOutlineDown />
                </Button>
            </MenuTrigger>
            <MenuContent p='0'>
                <MenuItem value="view-profile">Profile</MenuItem>
                <MenuItem value="sign-out" bg="red.500">Sign Out</MenuItem>
            </MenuContent>
        </MenuRoot>
    </Flex>
}