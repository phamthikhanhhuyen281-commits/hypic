export interface WordDefinition {
  word: string;
  meaning: string;
  definition: string;
  ipa: string;
  stress: string;
  example: string;
  collocations: string[];
  synonyms: string[];
}

export const commonIELTSWords: WordDefinition[] = [
  {
    word: "Mitigate",
    meaning: "Giảm nhẹ, làm dịu bớt",
    definition: "To make something less severe, serious, or painful.",
    ipa: "/ˈmɪtɪɡeɪt/",
    stress: "MIT-i-gate",
    example: "The new laws are designed to mitigate the effects of environmental pollution.",
    collocations: ["mitigate problems", "mitigate risks", "mitigate the impact"],
    synonyms: ["alleviate", "reduce", "lessen"]
  },
  {
    word: "Proliferate",
    meaning: "Nảy nở, tăng nhanh",
    definition: "Increase rapidly in number; multiply.",
    ipa: "/prəˈlɪfəreɪt/",
    stress: "pro-LIF-er-ate",
    example: "Social media platforms have proliferated over the last decade.",
    collocations: ["proliferate rapidly", "cell proliferation"],
    synonyms: ["multiply", "mushroom", "burgeon"]
  },
  {
    word: "Ubiquitous",
    meaning: "Phổ biến, ở đâu cũng có",
    definition: "Present, appearing, or found everywhere.",
    ipa: "/juːˈbɪkwɪtəs/",
    stress: "u-BIQU-i-tous",
    example: "Smartphones are now ubiquitous in modern society.",
    collocations: ["ubiquitous presence", "ubiquitous usage"],
    synonyms: ["omnipresent", "pervasive", "widespread"]
  }
];
