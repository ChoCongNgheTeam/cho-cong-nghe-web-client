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

export const KEYFRAMES = `
  @keyframes hsImgZoomIn {
    from { opacity: 0; transform: scale(0.82); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes hsImgSlideRight {
    from { opacity: 0; transform: translateX(60px) rotate(3deg); }
    60%  { transform: translateX(-6px) rotate(-0.5deg); }
    to   { opacity: 1; transform: translateX(0) rotate(0deg); }
  }
  @keyframes hsImgDropBounce {
    0%   { opacity: 0; transform: translateY(-48px) scale(0.92); }
    65%  { transform: translateY(10px) scale(1.02); }
    82%  { transform: translateY(-5px) scale(0.99); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes hsClipDown {
    from { opacity: 0; clip-path: inset(0 0 100% 0); transform: translateY(-10px); }
    to   { opacity: 1; clip-path: inset(0 0 0% 0);   transform: translateY(0); }
  }
  @keyframes hsFadeScale {
    from { opacity: 0; transform: scale(0.88) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes hsBlurIn {
    from { opacity: 0; filter: blur(10px); transform: translateY(12px); }
    to   { opacity: 1; filter: blur(0px);  transform: translateY(0); }
  }
  @keyframes hsSlideDown {
    from { opacity: 0; transform: translateY(-24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hsSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hsProgress {
    from { width: 0% }
    to   { width: 100% }
  }
  @keyframes hsFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    30%       { transform: translateY(-10px) rotate(0.4deg); }
    60%       { transform: translateY(-6px) rotate(-0.3deg); }
  }
  @keyframes hsGlowPulse {
    0%, 100% { opacity: 0.7;  transform: translate(-50%, -50%) scale(1); }
    50%       { opacity: 1;    transform: translate(-50%, -50%) scale(1.18); }
  }
  @keyframes hsRingRotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes hsRingRotateReverse {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(-360deg); }
  }
  @keyframes hsPerspGridScroll {
    from { background-position: 50% 0%; }
    to   { background-position: 50% 100%; }
  }
  @keyframes hsDotBlink {
    0%, 90%, 100% { opacity: 0; }
    45%            { opacity: 1; }
  }
`;
