import { useEffect, useRef, useState } from "react";
import { GLOBALS } from "./globals";

import "./App.css";
import { Pause, Play } from "lucide-react";

type PlayingType =
    | {
          status: true;
          id: number;
      }
    | { status: false };

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

    const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement>(() => {
        return new Audio(srcURL);
    });

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(-1);

    const isFirstRender = useRef(true);

    console.log("Sound...", src);

    useEffect(() => {
        console.log("useEffect... (audioPlayer)");

        if (isFirstRender.current) {
            (async function () {
                setAudioPlayer((audioPlayer) => {
                    audioPlayer.addEventListener("loadedmetadata", () => {
                        setDuration(audioPlayer.duration);
                    });

                    audioPlayer.addEventListener("pause", () => {
                        onPause();
                    });

                    audioPlayer.addEventListener("timeupdate", () => {
                        setCurrentTime(audioPlayer.currentTime);
                    });

                    return audioPlayer;
                });
            })();

            console.log("isFirstRender:", isFirstRender.current);
            isFirstRender.current = false;
            return;
        }

        (async function () {
            setAudioPlayer((audioPlayer) => {
                audioPlayer.src = srcURL;
                audioPlayer.load();

                return audioPlayer;
            });
        })();
    }, [srcURL, audioPlayer]);

    useEffect(() => {
        console.log("isPlaying:", isPlaying, "src:", src);
        if (!isPlaying) {
            (async function () {
                setAudioPlayer((audioPlayer) => {
                    audioPlayer.pause();
                    return audioPlayer;
                });
            })();
        }
    }, [isPlaying]);

    const formatSrc = (src: string) => {
        src = src.replaceAll(/([a-z])([A-Z])/g, "$1 $2");
        src = src.toLowerCase();
        src = src[0].toUpperCase() + src.slice(1);

        return src;
    };

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

    function formatTime(time: number): string {
        return `${formatNumber(Math.floor(time / 60), 2)}:${formatNumber(Math.floor(time % 60), 2)}:${formatNumber(Math.floor((time * 1000) % 1000), 3)}`;
    }

    return (
        <div className="flex items-center my-4 ml-8">
            {isPlaying ? (
                <button
                    onClick={() => {
                        onPause();
                        setAudioPlayer((audioPlayer) => {
                            audioPlayer.pause();
                            return audioPlayer;
                        });
                    }}
                >
                    <Pause />
                </button>
            ) : (
                <button
                    onClick={() => {
                        onPlay();
                        setAudioPlayer((audioPlayer) => {
                            audioPlayer.play();
                            return audioPlayer;
                        });
                    }}
                >
                    <Play />
                </button>
            )}
            <span className="m-4">
                {formatTime(currentTime)} / {duration === -1 ? "??:??:???" : formatTime(duration)}
            </span>
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
    console.log("Playing...", playing);

    console.log("App...");
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
