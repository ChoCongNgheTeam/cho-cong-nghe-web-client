interface Highlight {
   key?: string;
   name: string;
   icon: string;
   value: string;
}

interface ProductHighlightsProps {
   highlights: Highlight[];
}

const getIconComponent = (iconName: string) => {
   const icons: { [key: string]: string } = {
      cpu: "🔲",
      "cpu-fill": "🔲",
      gpu: "🎮",
      storage: "💾",
      glass: "🛡️",
      sun: "☀️",
      camera: "📷",
      "camera-user": "🤳",
      battery: "🔋",
      screen: "📱",
   };

   return icons[iconName] || "•";
};

export default function ProductHighlights({
   highlights,
}: ProductHighlightsProps) {
   return (
      <div className="space-y-1.5">
         {highlights.map((highlight, index) => (
            <div
               key={index}
               className="flex items-center gap-2 text-xs text-gray-600"
            >
               <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  {getIconComponent(highlight.icon)}
               </span>
               <span className="flex-1 line-clamp-1">
                  <span className="font-medium">{highlight.name}:</span>{" "}
                  <span>{highlight.value}</span>
               </span>
            </div>
         ))}
      </div>
   );
}
