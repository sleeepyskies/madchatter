/**
 * Language and voice setting component.
 */

// Voice Model selections
const VOICE_MODELS = [
  { id: "de_DE-eva_k-x_low", label: "Eva (Female)", lang: "de" },
  { id: "en_US-amy-low.onnx", label: "Amy (Female)", lang: "en" },
  { id: "hans_clear", label: "Hans (Male)", lang: "de" },
];

interface VoiceSettingProps {
  currentLang: string;
  currentModel: string;
  onChange: (lang: string, model: string) => void;
}

export function VoiceSetting({
  currentLang,
  currentModel,
  onChange,
}: VoiceSettingProps) {
  const handleLangChange = (lang: string) => {
    // set the first model of the current languagefor default model
    const firstModel = VOICE_MODELS.find((m) => m.lang === lang)?.id || "";
    onChange(lang, firstModel);
  };

  return (
    <div className="space-y-6">
      {/* Language selections */}
      <div className="space-y-2">
        <div className="text-sm font-semibold">LANGUAGUE</div>
        <div className="flex gap-2">
          {["en", "de"].map((lang) => (
            <button
              key={lang}
              onClick={() => handleLangChange(lang)}
              className={`px-4 py-1.5 cursor-pointer text-sm font-medium rounded-md transition-all ${
                currentLang === lang
                  ? "bg-black text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Model List */}
      <div className="space-y-2">
        <div className="text-sm font-semibold">VOICE MODEL</div>
        <div className="space-y-1">
          {VOICE_MODELS.filter((m) => m.lang === currentLang).map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between py-1"
            >
              <span className="text-sm text-gray-700">{model.label}</span>
              <button
                onClick={() => onChange(currentLang, model.id)}
                className={`text-sm cursor-pointer px-3 py-1 rounded-full transition-all ${
                  currentModel === model.id
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-primary hover:bg-gray-100"
                }`}
              >
                {currentModel === model.id ? "Selected" : "Select"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
