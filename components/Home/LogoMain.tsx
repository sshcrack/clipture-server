import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import ScaleText from "react-scale-text";
import Clipture from "../../public/img/logo-var.svg";

export default function LogoMain({ children }: React.PropsWithChildren<{}>) {
    return <>
        <Flex
            w='100%'
            h='30%'
            justifyContent='center'
            alignItems='center'
        >
            <Flex
                w='30%'
                h='100%'
            >
                <Clipture style={{ width: "100%", height: "100%" }} />
            </Flex>
            <Flex
                justifyContent='center'
                alignItems='center'
                flexDir='column'
                w='50%'
                h='100%'
            >
                <Flex
                    w='100%'
                    flex='1'
                    justifyContent='center'
                    alignItems='center'
                    className='scale-text-center'
                >
                    <ScaleText><span>Clipture</span></ScaleText>
                </Flex>
                <Text flex='.25' fontSize='3em'>A clip platform reimagined.</Text>
                {children}
            </Flex>
        </Flex>
    </>
}