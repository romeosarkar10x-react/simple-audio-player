import { forwardRef, useRef, type AudioHTMLAttributes, type PropsWithoutRef } from "react";
import { GLOBALS } from "./globals";

import "./App.css";

const Sound = forwardRef<HTMLAudioElement, PropsWithoutRef<AudioHTMLAttributes<HTMLAudioElement>> & { src: string }>(
    ({ src, ...props }, ref) => {
        const formatSrc = (src: string) => {
            if (src.startsWith("/sounds/")) {
                src = src.slice(8);
            }

            src = src.replaceAll(/([a-z])([A-Z])/g, "$1 $2");
            src = src.toLowerCase();
            src = src[0].toUpperCase() + src.slice(1);

            return src;
        };

        return (
            <div className="flex items-center my-4 ml-8">
                <audio ref={ref} {...props} src={`${GLOBALS.BASE_URL}${src}`} controls></audio>
                <span className="ml-4">{formatSrc(src)}</span>
            </div>
        );
    },
);

function App() {
    const srcs = ["/sounds/clashRoyaleSoundtrack.mp3", "/sounds/goblins.mp3", "/sounds/mortar.mp3"];
    const audioRefs = useRef<(HTMLAudioElement | null)[]>(Array.from({ length: srcs.length }).map(() => null));

    const handlePlayCurry = (index: number) => () => {
        console.log("handlePlay...");
        audioRefs.current.forEach((audio, i) => {
            if (audio !== null) {
                if (i !== index) {
                    console.log(`Pausing ${i}...`);
                    audio.pause();
                }
            }
        });
    };

    return (
        <>
            {srcs.map((src, index) => (
                <Sound
                    ref={(elem) => void (audioRefs.current[index] = elem)}
                    onPlay={handlePlayCurry(index)}
                    key={src}
                    {...{ src }}
                />
            ))}
        </>
    );
}

export default App;
