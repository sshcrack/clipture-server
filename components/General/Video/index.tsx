import { Flex, Grid, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Spinner } from '@chakra-ui/react';
import { FaPlay, FaPause } from "react-icons/fa"
import { BsFullscreen } from "react-icons/bs"
import { HiSpeakerXMark, HiSpeakerWave } from "react-icons/hi2"
import { MediaHTMLAttributes, useEffect, useRef, useState } from 'react';
import styles from "../../../styles/General/Video/index.module.scss"
import { scaleKeepRatioSpecific } from '../../../util/math';

const getElWidth = (elm: HTMLElement) => Math.max(elm.scrollWidth, elm.offsetWidth, elm.clientWidth)
const getElHeight = (elm: HTMLElement) => Math.max(elm.scrollHeight, elm.offsetHeight, elm.clientHeight)

export default function Video({ children, ...props }: MediaHTMLAttributes<HTMLVideoElement>) {
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
        if (!gridRef.current || !vidRef.current)
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

                    setWidth(width + "px")
                    setHeight(height + "px")
                    locked = false
                    curr.classList.remove("invisible-children")
                })
            }, 10)
        }

        handle()

        window.addEventListener("resize", handle)
        return () => window.removeEventListener("resize", handle)
    }, [gridRef, vidRef, loading, fetched])

    useEffect(() => {
        const curr = vidRef.current
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

    const vid = vidRef.current
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
                    {vid.muted ?
                        <HiSpeakerXMark style={{ height: "2em", width: "2em" }}/> :
                        <HiSpeakerWave  style={{ height: "2em", width: "2em" }}/>
                    }
                    <Slider
                        max={1}
                        value={isNaN(vid.volume) ? 0 : vid.volume}
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
            style={{ width: width, height: height, zIndex: -1 }}
        />
        {loading ? <Spinner /> : controls}
    </Grid>
}
