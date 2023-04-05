import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

const ReactPlayerWrapper: React.FC<{
  isPlaying: boolean;
  url: string;
}> = ({
  isPlaying,
  url
}) => {
  const [hasWindow, setHasWindow] = useState(false);
  useEffect(() => {
    if (typeof window != "undefined") {
      setHasWindow(true);
    }
  }, []);

  return (
    <>
      {hasWindow && (
        <ReactPlayer
          controls={false}
          url={url}
          playing={isPlaying}
          height="0"
          width="0"
        />
      )}
    </>
  );
}

export default ReactPlayerWrapper