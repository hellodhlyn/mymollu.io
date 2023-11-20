import { useState } from "react";
import YouTube from "react-youtube";
import { SubTitle } from "~/components/atoms/typography";
import { sanitizeClassName } from "~/prophandlers";

type EventVideosProps = {
  videos: {
    title: string;
    youtube: string;
  }[];
};

export default function EventVideos({ videos }: EventVideosProps) {
  const [videoId, setVideoId] = useState(videos[0].youtube);

  return (
    <div className="my-8">
      <SubTitle text="이벤트 영상" />
      <div className="w-full flex flex-col-reverse md:flex-row border border-neutral-300 rounded-xl">
        <div className="w-full md:w-56 md:border-r md:flex-none flex flex-row md:flex-col overflow-auto">
          {videos.map((video) => (
            <div
              key={`video-${video.youtube}`}
              className={sanitizeClassName(`
                m-1 p-3 md:w-54 text-sm md:text-base hover:bg-neutral-100 cursor-pointer transition rounded-xl
                ${video.youtube === videoId ? "bg-gray-100 font-bold" : ""}
              `)}
              onClick={() => setVideoId(video.youtube)}
            >
              <p className="whitespace-nowrap">{video.title}</p>
            </div>
          ))}
        </div>
        <div className="flex-auto">
          <YouTube
            videoId={videoId}
            className="w-full aspect-video"
            iframeClassName="w-full h-full rounded-t-xl md:rounded-tl-none md:rounded-r-xl"
            opts={{ playerVars: { rel: 0 } }}
          />
        </div>
      </div>
    </div>
  );
}
