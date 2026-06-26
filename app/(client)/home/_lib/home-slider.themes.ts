type AnimTheme = {
  imgAnim: string;
  imgDuration: number;
  textAnims: {
    keyframe: string;
    delay: number;
    duration: number;
  }[];
};

export const THEMES: AnimTheme[] = [
  {
    imgAnim: "hsImgZoomIn",
    imgDuration: 750,
    textAnims: [
      { keyframe: "hsClipDown", delay: 550, duration: 500 },
      { keyframe: "hsClipDown", delay: 700, duration: 500 },
      { keyframe: "hsClipDown", delay: 840, duration: 480 },
      { keyframe: "hsSlideUp", delay: 980, duration: 480 },
    ],
  },
  {
    imgAnim: "hsImgSlideRight",
    imgDuration: 700,
    textAnims: [
      { keyframe: "hsFadeScale", delay: 520, duration: 520 },
      { keyframe: "hsFadeScale", delay: 680, duration: 520 },
      { keyframe: "hsFadeScale", delay: 820, duration: 500 },
      { keyframe: "hsSlideUp", delay: 960, duration: 480 },
    ],
  },
  {
    imgAnim: "hsImgDropBounce",
    imgDuration: 800,
    textAnims: [
      { keyframe: "hsBlurIn", delay: 580, duration: 550 },
      { keyframe: "hsBlurIn", delay: 730, duration: 550 },
      { keyframe: "hsBlurIn", delay: 880, duration: 530 },
      { keyframe: "hsSlideUp", delay: 1020, duration: 480 },
    ],
  },
  {
    imgAnim: "hsImgZoomIn",
    imgDuration: 750,
    textAnims: [
      { keyframe: "hsSlideDown", delay: 540, duration: 500 },
      { keyframe: "hsSlideDown", delay: 690, duration: 500 },
      { keyframe: "hsSlideDown", delay: 830, duration: 480 },
      { keyframe: "hsSlideUp", delay: 970, duration: 480 },
    ],
  },
];
