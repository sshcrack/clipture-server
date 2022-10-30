import { Flex, Text } from '@chakra-ui/react';
import { WindowInformation } from '@prisma/client';

export default function WindowInfo({ info }: { info: WindowInformation }) {
    const { title, icon } = info

    return <Flex
        p='3'
        justifyContent='center'
        alignItems='center'
        borderBottomRightRadius='md'
        gap='3'
    >
        {/*eslint-disable-next-line @next/next/no-img-element*/}
        <img
            src={`/api/clip/icon/${icon}`}
            alt='Game Image'
            style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "var(--chakra-radii-md)"
            }}
        />
        <Text>{title}</Text>
    </Flex>
}