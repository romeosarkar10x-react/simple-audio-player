import "./App.css";

function Sound({ src }: { src: string }) {
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
            <audio src={src} controls></audio>
            <span className="ml-4">{formatSrc(src)}</span>
        </div>
    );
}

function App() {
    const srcs = ["/sounds/clashRoyaleSoundtrack.mp3", "/sounds/goblins.mp3", "/sounds/mortar.mp3"];

    return (
        <>
            {srcs.map((src) => (
                <Sound {...{ src }} />
            ))}
        </>
    );
}

export default App;
