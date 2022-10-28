import { Flex } from '@chakra-ui/react';
import React from 'react';
import styles from "../../../styles/General/Card/index.module.scss"

export default function Card({ children }: React.PropsWithChildren<{}>) {
    return <Flex
        w='30em'
        h='20em'
        boxShadow='0 1px 3px rgba(255,255,255,0.12), 0 1px 2px rgba(255,255,255,0.24);'
        rounded='md'
        className={styles.card}
        justifyContent='center'
        alignItems='center'
    >
        <span className={styles.cardBg} />
        <Flex
            w='calc(100% - 10px)'
            h='calc(100% - 10px)'
            gap='10'
            flexDir='column'
            alignItems='center'
            p='5'
            textAlign='center'
            className={styles.cardInner}
        >
            {children}
        </Flex>

    </Flex >
}