import { Avatar, Flex, FlexProps, Text } from '@chakra-ui/react';

type SmallUser = {
    name: string | null,
    id: string | null
}

export default function ClipUser({ user, ...props }: { user: SmallUser } & Omit<FlexProps, "children">) {
    const { id, name } = user
    return <Flex
        gap='5'
        justifyContent='center'
        alignItems='center'
        pr='5'
        {...props}
    >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Avatar size='sm' src={`/api/user/image?id=${id}`} name={name ?? "Unknown User"} />
        <Text>{name}</Text>
    </Flex>
}