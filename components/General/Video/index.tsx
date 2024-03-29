import { Flex, Grid, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Spinner } from '@chakra-ui/react';
import { FaPlay, FaPause } from "react-icons/fa"
import { BsFullscreen } from "react-icons/bs"
import { HiSpeakerXMark, HiSpeakerWave } from "react-icons/hi2"
import { MediaHTMLAttributes, useEffect, useRef, useState } from 'react';
import styles from "../../../styles/General/Video/index.module.scss"
import { scaleKeepRatioSpecific } from '../../../util/math';
import { ReactSetState } from '../../../util/validators/interface';

const getElWidth = (elm: HTMLElement) => Math.max(elm.scrollWidth, elm.offsetWidth, elm.clientWidth)
const getElHeight = (elm: HTMLElement) => Math.max(elm.scrollHeight, elm.offsetHeight, elm.clientHeight)

export type Props = {
    setHeight?: ReactSetState<string>,
    setWidth?: ReactSetState<string>
}

export default function Video({ children, setWidth: sW, setHeight: sH, ...props }: MediaHTMLAttributes<HTMLVideoElement> & Props) {
    const vidRef = useRef<HTMLVideoElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(true)
    const [fetched, setFetched] = useState(false)

    const [height, setHeight] = useState("100%")
    const [width, setWidth] = useState("100%")
    const [, setUpdate] = useState(0)

    const [hovered, setHovered] = useState(false)
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const listener = ({ key }: KeyboardEvent) => {
            if (key === "f")
                document.fullscreenElement ? document.exitFullscreen() : vidRef.current?.requestFullscreen()
        }

        window.addEventListener("keypress", listener)
        return () => window.removeEventListener("keypress", listener)
    }, [vidRef])

    useEffect(() => {
        if (!gridRef?.current || !vidRef?.current)
            return

        const curr = gridRef.current
        const currVid = vidRef.current


        let t = null as NodeJS.Timeout | null
        let locked = false
        const handle = () => {
            if (locked)
                return

            if (t)
                clearInterval(t)

            t = setTimeout(() => {
                t = null
                locked = true

                console.log("Handle")
                curr.classList.add("invisible-children")
                requestAnimationFrame(() => {
                    const vidHeight = currVid.videoHeight
                    const vidWidth = currVid.videoWidth

                    const newHeight = getElHeight(curr)
                    const newWidth = getElWidth(curr)

                    const [width, height] = scaleKeepRatioSpecific(vidWidth, vidHeight, { width: newWidth, height: newHeight }, true)
                    const wPx = width + "px"
                    const hPx = height + "px"

                    setWidth(wPx)
                    setHeight(hPx)

                    sW && sW(wPx)
                    sH && sH(hPx)
                    locked = false
                    curr.classList.remove("invisible-children")
                })
            }, 10)
        }

        handle()

        const observer = new ResizeObserver(() => {
            handle()
            console.log("Resize observer")
        })
        observer.observe(curr)

        window.addEventListener("resize", handle)
        return () => {
            window.removeEventListener("resize", handle)
            observer.disconnect()
        }
    }, [gridRef, vidRef, loading, fetched, sH, sW])

    useEffect(() => {
        const curr = vidRef?.current
        if (!curr)
            return

        setLoading(false)
        const listener = () => setFetched(true)
        const onFullscreen = () => {
            if (!document.fullscreenElement)
                return curr.controls = false

            if (curr !== document.fullscreenElement)
                return
            curr.controls = true
        }

        curr.addEventListener("fullscreenchange", onFullscreen)
        curr.addEventListener("loadeddata", listener)
        const id = setInterval(() => setUpdate(Math.random()))
        return () => {
            curr?.removeEventListener("loadeddata", listener)
            curr.removeEventListener("fullscreenchange", onFullscreen)
            clearInterval(id)
        }
    }, [vidRef])

    const vid = vidRef?.current
    let controls = <></>;
    const transition = 'all .2s ease-in-out'
    if (vid) {
        const toggleVid = () => {
            vid.paused ? vid.play() : vid.pause()
            setUpdate(Math.random())
        }

        controls = <Flex
            style={{ width: width, height: height }}
            flexDir='column'
            rounded='2xl'
            overflow='hidden'
            bg={vid.paused ? "rgba(0,0,0,.4)" : ""}
        >
            <Flex
                opacity={hovered || vid.paused ? 1 : 0}
                justifyContent='center'
                alignItems='center'
                transition={transition}
                bg='linear-gradient(to bottom,#000, #000 30%, rgba(0,0,0,0))'
                pb='4'
            >
                {children}
            </Flex>
            <Flex
                w='100%'
                h='100%'
                justifyContent='center'
                alignItems='center'
                borderBottomRadius='0'
                cursor="pointer"
                transition={transition}
                onClick={toggleVid}
                onMouseEnter={() => {
                    setHovered(true)
                    if (!timeoutId)
                        return

                    clearTimeout(timeoutId)
                    setTimeoutId(null)
                }}
                onMouseLeave={() => setTimeoutId(setTimeout(() => setHovered(false), 2000))}
            >
                {vid.paused && <FaPlay />}
            </Flex>
            <Flex
                w='100%'
                gap='7'
                p='2'
                pr='3'
                borderTopRadius='0'
                bg="rgba(0,0,0,.6)"
                transition={transition}
                transform={hovered || vid.paused ? "" : "translate(0, 110%)"}
            >
                <Flex
                    flex='0'
                    p='2'
                    onClick={toggleVid}
                    cursor='pointer'
                >
                    {vid.paused ? <FaPlay /> : <FaPause />}
                </Flex>
                <Slider
                    max={vid.duration}
                    value={isNaN(vid.currentTime) ? 0 : vid.currentTime}
                    onChange={e => vid.currentTime = e}
                    step={.01}
                >
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                </Slider>
                <Flex
                    w='6.5rem'
                    justifyContent='center'
                    alignItems='center'
                    gap='5'
                >
                    <Flex
                        cursor='pointer'
                        onClick={() => {
                            vid.muted = !vid.muted
                            setUpdate(Math.random())
                        }}
                    >
                        {vid.muted ?
                            <HiSpeakerXMark style={{ height: "2em", width: "1.25rem" }} /> :
                            <HiSpeakerWave style={{ height: "2em", width: "1.25rem" }} />
                        }
                    </Flex>
                    <Slider
                        max={1}
                        value={isNaN(vid.volume) ? 0 : (vid.muted ? 0 : vid.volume)}
                        onChange={e => {
                            vid.volume = e
                            vid.muted = e === 0
                        }}
                        step={.01}
                    >
                        <SliderTrack>
                            <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                    </Slider>
                </Flex>
                <Flex
                    alignItems='center'
                    p='2'
                    cursor='pointer'
                    onClick={() => vid.requestFullscreen({ navigationUI: "show" })}
                >
                    <BsFullscreen />
                </Flex>
            </Flex>
        </Flex>
    }

    return <Grid
        w='100%'
        h='100%'
        className={styles.videoWrapper}
        ref={gridRef}
    >
        <video {...props}
            ref={vidRef}
            autoPlay
            style={{ width: width, height: height, zIndex: -1 }}
        />
        {loading ? <Spinner /> : controls}
    </Grid>
}
