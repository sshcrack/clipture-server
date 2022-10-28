import { Flex, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { BsArrowDown } from "react-icons/bs";
import styles from "../../styles/General/DownloadButton.module.scss"

export default function DownloadButtons() {
    return <Link href='/api/download'>
        <a>
            <Flex
                className={styles.buttonOuter}
            >
                <Text
                    className={styles.buttonText}
                >Download</Text>
                <Flex
                    className={styles.buttonDownload}
                >
                    <BsArrowDown style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "1.5em",
                        minWidth: "1.5em"
                    }} />
                </Flex>
            </Flex>
        </a>
    </Link>
}