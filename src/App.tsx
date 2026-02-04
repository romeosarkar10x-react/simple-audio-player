import { useEffect, useRef, useState } from "react";
import { GLOBALS } from "./globals";
import WaveSurfer from "wavesurfer.js";

import "./App.css";
import { Download, Pause, Play, Share2 } from "lucide-react";

type PlayingType =
    | {
          status: true;
          id: number;
      }
    | { status: false };

function formatSrc(src: string) {
    src = src.replaceAll(/([a-z])([A-Z])/g, "$1 $2");
    src = src.toLowerCase();
    src = src[0].toUpperCase() + src.slice(1);

    return src;
}

function formatNumber(n: number, fillWidth: number, fill: string = "0") {
    let s = n.toString();

    if (fill.length !== 1) {
        throw new Error("'fill' should be a character");
    }

    if (s.length < fillWidth) {
        s = fill.repeat(fillWidth - s.length) + s;
    }

    return s;
}

function Sound({
    onPlay,
    onPause,
    isPlaying,
    src,
}: {
    onPlay: () => void;
    onPause: () => void;
    isPlaying: boolean;
    src: string;
}) {
    const srcURL = `${GLOBALS.BASE_URL}/sounds/${src}.mp3`;

    const [audioPlayer, setAudioPlayer] = useState<WaveSurfer | null>(null);
    const waveSurferContainerElemRef = useRef<HTMLSpanElement | null>(null);

    const [duration, setDuration] = useState(-1);
    const durationRef = useRef(duration);

    const [currentTime, setCurrentTime] = useState(0);

    function formatTime(time: number): string {
        return `${formatNumber(Math.floor(time / 60), 2)}:${formatNumber(Math.floor(time % 60), 2)}:${formatNumber(Math.floor((time * 1000) % 1000), 3)}`;
    }

    function handlePause() {
        if (audioPlayer !== null) {
            audioPlayer.pause();
            onPause();
        }
    }

    function handlePlay() {
        if (audioPlayer !== null) {
            audioPlayer.play();

            onPlay();
        }
    }

    useEffect(() => {
        durationRef.current = duration;
    }, [duration]);

    useEffect(() => {
        console.log("waveSurferContainerElemRef:", waveSurferContainerElemRef);

        if (waveSurferContainerElemRef.current !== null && audioPlayer === null) {
            console.log("Creating wavesurfer...");

            const waveSurfer = WaveSurfer.create({
                container: waveSurferContainerElemRef.current,
                height: 40,
                width: 200,
                url: srcURL,
                barWidth: 2,
                barGap: 1,
                barRadius: 2,
                cursorWidth: 0,
                dragToSeek: true,
                progressColor: "orange",
            });

            waveSurfer.on("pause", () => {
                // console.log("waveSurfer event: pause");
                setAudioPlayer((audioPlayer) => {
                    if (audioPlayer !== null) {
                        onPause();
                    }

                    return audioPlayer;
                });
            });

            waveSurfer.on("timeupdate", (currentTime) => {
                // console.log("timeUpdate:", currentTime);

                setCurrentTime((prevTime) => {
                    if (currentTime < prevTime) {
                        return currentTime;
                    }

                    if (currentTime - prevTime >= 0.05) {
                        return currentTime;
                    }

                    return prevTime;
                });
            });

            waveSurfer.on("seeking", (currentTime) => {
                // console.log("Seeking...", currentTime);
                setCurrentTime(currentTime);
            });

            waveSurfer.on("drag", (x) => {
                // console.log("x:", x, durationRef.current * x);
                setCurrentTime((prevTime) => {
                    const currentTime = durationRef.current * x;

                    if (Math.abs(prevTime - currentTime) >= 0.05) {
                        return currentTime;
                    }

                    return prevTime;
                });
            });

            waveSurfer.on("decode", (duration) => {
                setDuration(duration);
            });

            setAudioPlayer(waveSurfer);
        }
    }, [waveSurferContainerElemRef]);

    return (
        <div className="flex items-center my-4 ml-8">
            <div className="flex gap-4 items-center w-fit border-2 border-gray-400 rounded-lg px-4 py-1">
                <button className="p-2" onClick={isPlaying ? handlePause : handlePlay}>
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <span ref={waveSurferContainerElemRef}></span>
                <Download size={16} />
                <Share2 size={16} />
            </div>
            <span className="ml-4">$: {formatSrc(src)}</span>
        </div>
    );
}

function App() {
    const srcs = [
        "arrow",
        "booHooHooHew",
        "clashRoyaleSoundtrack",
        "fireSpirits",
        "goblins",
        "kingLaugh",
        "miniPekka",
        "mortar",
        "rocket",
        "spearGoblins",
    ];

    const [playing, setPlaying] = useState<PlayingType>({ status: false });
    // console.log("Playing...", playing);

    // console.log("App...");
    return (
        <>
            {srcs.map((src, index) => (
                <Sound
                    onPlay={() => {
                        setPlaying({ status: true, id: index });
                        console.log("onPlay... [" + index + "]");
                    }}
                    onPause={() => {
                        setPlaying((playing) => {
                            if (playing.status && playing.id === index) {
                                return { status: false };
                            }
                            return playing;
                        });
                        console.log("onPause... [" + index + "]");
                    }}
                    isPlaying={playing.status && playing.id === index}
                    key={src}
                    {...{ src }}
                />
            ))}
        </>
    );
}

export default App;

/*
            <span className="m-4">
                {formatTime(currentTime)} / {duration === -1 ? "??:??:???" : formatTime(duration)}
            </span>

*/
