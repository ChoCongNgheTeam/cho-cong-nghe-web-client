"use client";
import Image from "next/image";
import Slide from "./Slide";
import Slidezy from "./Slidezy";
export default function VideoSlider() {
   const videos = [
      { id: 1, title: "Tutorial 1", url: "https://youtube.com/embed/..." },
      { id: 2, title: "Tutorial 2", url: "https://youtube.com/embed/..." },
      { id: 3, title: "Tutorial 3", url: "https://youtube.com/embed/..." },
   ];

   return (
      <Slidezy items={1} autoplay={false}>
         {videos.map((video) => (
            <div key={video.id} className="aspect-video">
               <iframe
                  src={video.url}
                  title={video.title}
                  className="w-full h-full rounded-xl"
                  allowFullScreen
               />
            </div>
         ))}
      </Slidezy>
   );
}
