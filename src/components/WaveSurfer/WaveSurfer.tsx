import { GLOBALS } from "@/globals";
import { audioContext } from "@/lib/utils/audio/context";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { Download, Pause, Play, Share2 } from "lucide-react";

function generateSrcURL(src: string) {
    return `${GLOBALS.BASE_URL}/sounds/${src}.mp3`;
}

type AudioDataType = { audioBuffer: AudioBuffer; audioBlob: Blob; arrayBuffer: ArrayBuffer };

export default function WaveSurferComponent({
    id,
    label,
    onPlay,
    onPause,
    onDownload,
    isPlaying,
    src,
}: {
    id: number;
    label: string;
    onPlay: (id: number) => void;
    onPause: (id: number) => void;
    onDownload: (audio: AudioDataType) => void;
    isPlaying: boolean;
    src: string | Blob;
}) {
    const [audio, setAudio] = useState<AudioDataType | null>(null);

    const [audioPlayer, setAudioPlayer] = useState<WaveSurfer | null>(null);
    const waveSurferContainerElemRef = useRef<HTMLSpanElement | null>(null);

    /** Fetch audio data */
    useEffect(() => {
        (async function fetchAudioData() {
            let buffer: ArrayBuffer;
            let response: Response;
            let blob: Blob;

            if (typeof src === "string") {
                response = await fetch(generateSrcURL(src));

                if (!response.ok) {
                    return;
                }

                const contentType = response.headers.get("content-type");
                const blobType = contentType ? { type: contentType } : {};
                buffer = await response.arrayBuffer();
                blob = new Blob([buffer], blobType);
            } else {
                blob = src;
                buffer = await src.arrayBuffer();
            }

            const data = await audioContext.decodeAudioData(buffer);

            const audio = {
                audioBuffer: data,
                arrayBuffer: buffer,
                audioBlob: blob,
            };

            setAudio(audio);
            console.log("setAudio:", audio);
        })();
    }, [src]);

    /** Init 'WaveSurfer' */
    useEffect(() => {
        console.log("waveSurferContainerElemRef:", waveSurferContainerElemRef);

        if (!waveSurferContainerElemRef.current) {
            return;
        }

        console.log("audioPlayer:", audioPlayer);

        if (audioPlayer) {
            console.log("Loading new audioURL (wavesurfer)...");

            if (audio) {
                audioPlayer.loadBlob(new Blob([audio.arrayBuffer]));
            }

            return;
        }

        console.log("Creating wavesurfer instance...");

        const waveSurfer = WaveSurfer.create({
            container: waveSurferContainerElemRef.current,
            height: 40,
            width: 400,
            barWidth: 2,
            barGap: 1,
            barRadius: 2,
            cursorWidth: 0,
            dragToSeek: true,
            progressColor: "#10b981",
            waveColor: "#6b7280",
            sampleRate: 3000,
        });

        if (typeof src === "string") {
            waveSurfer.load(generateSrcURL(src));
        } else {
            waveSurfer.loadBlob(src);
        }

        waveSurfer.on("error", (err) => {
            console.log("Error:", err);
        });

        waveSurfer.on("pause", () => {
            console.log("waveSurfer event: pause");
            setAudioPlayer((audioPlayer) => {
                if (audioPlayer !== null) {
                    onPause(id);
                }

                return audioPlayer;
            });
        });

        setAudioPlayer(waveSurfer);
    }, [waveSurferContainerElemRef, src, id, onPause]);

    useEffect(() => {
        if (!audioPlayer) {
            return;
        }

        console.log("isPlaying effect...", id, audioPlayer.isPlaying(), isPlaying);
        if (audioPlayer.isPlaying() !== isPlaying) {
            void (isPlaying ? audioPlayer.play() : audioPlayer.pause());
        }
    }, [audioPlayer, isPlaying, id]);

    return (
        <div className="flex relative items-center my-4 ml-8">
            <span className="text-xs absolute -top-2 left-4 bg-background text-muted-foreground px-1.5">{label}</span>
            <div className="flex gap-4 items-center w-fit border border-border rounded-lg px-4 py-1">
                <Button
                    variant="default"
                    size="icon-sm"
                    onClick={
                        isPlaying
                            ? () => audioPlayer && (audioPlayer.pause(), onPause(id))
                            : () => audioPlayer && (audioPlayer.play(), onPlay(id))
                    }
                >
                    {isPlaying ? <Pause /> : <Play />}
                </Button>

                <span id="wavesurfer-container" ref={waveSurferContainerElemRef}></span>

                <Button variant="secondary" size="icon-sm" onClick={() => audio && onDownload(audio)}>
                    <Download />
                </Button>

                <Button variant="secondary" size="icon-sm">
                    <Share2 />
                </Button>
            </div>
        </div>
    );
}

/*
function Skeleton() {
    return (
        <>
            {/* Skeleton for play button * /}
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />

            {/* Skeleton for waveform * /}
            <div className="w-[200px] h-10 bg-gray-200 rounded animate-pulse" />

            {/* Skeleton for download button * /}
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />

            {/* Skeleton for share button * /}
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        </>
    );
}

*/
