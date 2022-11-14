import { Flex } from '@chakra-ui/react'
import React from 'react'

export default function CardHeader({ children }: React.PropsWithChildren<{}>) {
    return <Flex w='100%' justifyContent='center' alignItems='center' gap='3'>
        {children}
    </Flex>
}