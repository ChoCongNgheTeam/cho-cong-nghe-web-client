// CSS animation/utility class dùng chung giữa ChatButton, MessageBubble, ProductCards.
// Giữ nguyên cơ chế inject bằng thẻ <style> runtime (không dùng Next.js global CSS import)
// vì các class này (chat-msg-enter, chat-bubble, prose-chat, chat-img, chat-link...)
// được tham chiếu chéo giữa nhiều file component khác nhau — CSS Modules sẽ hash tên class
// riêng theo từng file nên không dùng chung được.
export const chatButtonStyles = `
  @keyframes chatSlideIn {
    from { opacity: 0; transform: scale(0.92) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes chatSlideUp {
    from { opacity: 0; transform: translateY(100%); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes chatMsgIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes chatPulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.25); }
  }
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0); }
    40%           { transform: translateY(-5px); }
  }
  @keyframes mascotFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-3px); }
  }
  .chat-panel-enter-desktop { animation: chatSlideIn 0.24s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .chat-panel-enter-mobile  { animation: chatSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .chat-msg-enter   { animation: chatMsgIn 0.22s ease-out forwards; }
  .chat-bubble      { transition: box-shadow 0.15s ease; }
  .chat-bubble:hover{ box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
  .dot-1 { animation: dotBounce 1.2s ease-in-out infinite 0ms; }
  .dot-2 { animation: dotBounce 1.2s ease-in-out infinite 150ms; }
  .dot-3 { animation: dotBounce 1.2s ease-in-out infinite 300ms; }
  .unread-pulse { animation: chatPulse 1.8s ease-in-out infinite; }
  .mascot-float { animation: mascotFloat 3s ease-in-out infinite; }
  .prose-chat p  { margin: 0 0 0.25em; }
  .prose-chat p:last-child { margin-bottom: 0; }
  .prose-chat ul { margin: 0.2em 0; padding-left: 1.1em; list-style: disc; }
  .prose-chat ul + ul { margin-top: 0; }
  .prose-chat li { margin: 0; line-height: 1.5; }
  .prose-chat strong { font-weight: 600; }
  .prose-chat em { font-style: italic; }
  .prose-chat code { font-family: monospace; background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 3px; font-size: 11px; }
  .chat-link { color: var(--color-accent,#2563eb); text-decoration: underline; text-underline-offset: 2px; }
  .chat-link:hover { opacity: 0.75; }

  .chat-img {
    max-width: min(100%, 160px);
    max-height: 110px;
    border-radius: 8px;
    object-fit: contain;
    display: block;
    margin: 4px 0;
    background: #f5f5f5;
  }

  .chat-mobile-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 9998;
    backdrop-filter: blur(2px);
  }

  .wc-btn {
    width: 12px; height: 12px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: filter 0.15s, transform 0.1s;
    cursor: pointer; border: none; padding: 0;
    flex-shrink: 0;
  }
  .wc-btn:hover { filter: brightness(0.82); transform: scale(1.12); }
  .wc-btn svg { opacity: 0; transition: opacity 0.15s; width: 7px; height: 7px; }
  .wc-group:hover .wc-btn svg { opacity: 1; }
  .wc-close  { background: #ff5f57; }
  .wc-min    { background: #febc2e; }
  .wc-max    { background: #28c840; }

  .chat-textarea-ios {
    font-size: 16px !important;
    transform-origin: left top;
  }
  @supports not (-webkit-touch-callout: none) {
    .chat-textarea-ios {
      font-size: 14px !important;
      transform: none;
    }
  }

  .chat-newline-btn {
    height: 36px;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid rgba(0,0,0,0.12);
    background: rgba(0,0,0,0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, transform 0.1s;
    cursor: pointer;
    color: #666;
    flex-shrink: 0;
  }
  .chat-newline-btn:active { background: rgba(0,0,0,0.1); transform: scale(0.94); }
`;
