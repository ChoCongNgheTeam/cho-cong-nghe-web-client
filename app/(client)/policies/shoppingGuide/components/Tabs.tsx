type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const tabs = [
  { id: "steps", label: "Quy trình mua hàng" },
  { id: "payment", label: "Thanh toán" },
  { id: "faq", label: "Câu hỏi thường gặp" },
];

export default function Tabs({ activeTab, setActiveTab }: Props) {
  return (
    <div className="sticky top-0 z-10 bg-neutral-light border-b border-neutral shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-accent"
                  : "text-neutral-dark hover:text-primary"
              }`}
            >
              {tab.label}

              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
