import { useCallback, useState } from "react";
import WaveSurfer from "./components/WaveSurfer";

import "./App.css";
import { pcmFloat32ToWAV } from "./lib/utils/audio/pcmFloat32ToWAV";

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

function App() {
    const srcs = ["clashRoyale", "heIsAPirate", "mirageTheme", "valhallaTheme", "auroraWinterlands"];
    const [playing, setPlaying] = useState<PlayingType>({ status: false });

    const handlePause = useCallback((index: number) => {
        setPlaying((playing) => {
            if (playing.status && playing.id === index) {
                return { status: false };
            }
            return playing;
        });
        console.log("onPause... [" + index + "]");
    }, []);

    const handlePlay = useCallback((index: number) => {
        setPlaying({ status: true, id: index });
        console.log("onPlay... [" + index + "]");
    }, []);

    return (
        <>
            {srcs.map((src, index) => (
                <WaveSurfer
                    id={index}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    isPlaying={playing.status && playing.id === index}
                    label={formatSrc(src)}
                    key={src}
                    src={src}
                    onDownload={(audioData) => {
                        if (audioData === null) {
                            return;
                        }

                        console.log("Sample rate:", audioData.audioBuffer.sampleRate);
                        console.log("Number of channels:", audioData.audioBuffer.numberOfChannels);

                        const wav = pcmFloat32ToWAV(audioData.audioBuffer);
                        const blob = new Blob([wav], { type: "audio/wav" });
                        const url = URL.createObjectURL(blob);

                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${src}.wav`;
                        a.click();
                    }}
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

// const [currentTime, setCurrentTime] = useState(0);
// const [duration, setDuration] = useState(-1);
// const durationRef = useRef(duration);

/*
    function formatTime(time: number): string {
        return `${formatNumber(Math.floor(time / 60), 2)}:${formatNumber(Math.floor(time % 60), 2)}:${formatNumber(Math.floor((time * 1000) % 1000), 3)}`;
    }
        */
/*
    useEffect(() => {
        durationRef.current = duration;
    }, [duration]);
    */

/*
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
            */

/*
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
    */
