import { Flex, Link, Text } from '@chakra-ui/react';
import styles from "../../styles/General/GlowingButton.module.scss"

export type GlowingButtonProps = {
    label: string,
    href: string,
    icon: JSX.Element,
    downloadAnim?: boolean,
    onClick?:() => void
}

export default function GlowingButton({ label, href, icon, onClick }: GlowingButtonProps) {
    return <Link href={href} onClick={() => onClick && onClick()}>
        <Flex className={styles.glowBox}>
            <Flex
                className={styles.buttonOuter}
            >
                <Text
                    className={styles.buttonText}
                >{label}</Text>
                <Flex
                    pr='5'
                    className={styles.buttonDownload}
                >
                    {icon}
                </Flex>
            </Flex>
        </Flex>
    </Link>
}