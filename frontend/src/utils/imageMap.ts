// Map kemonomimi types to available images in gallery/portraits
const imageMap: Record<string, string[]> = {
  Nekomimi: [
    "nekomimi_girl_1_1024x1024_20250630-233150.png",
    "nekomimi_girl_2_1024x1024_20250630-233156.png",
    "nekomimi_girl_3_1024x1024_20250630-233201.png",
  ],
  Inumimi: [
    "inumimi_girl_1_1024x1024_20250630-233206.png",
    "inumimi_girl_2_1024x1024_20250630-233212.png",
    "inumimi_girl_3_1024x1024_20250630-233217.png",
    "inumimi_girl_4_1024x1024_20250630-234115.png",
  ],
  Kitsunemimi: [
    "kitsunemimi_girl_1_1024x1024_20250630-233222.png",
    "kitsunemimi_girl_2_1024x1024_20250630-233228.png",
    "kitsunemimi_girl_3_1024x1024_20250630-233233.png",
    "kitsunemimi_girl_4_1024x1024_20250630-234109.png",
  ],
  Usagimimi: [
    "usagimimi_girl_1_1024x1024_20250630-233239.png",
    "usagimimi_girl_2_1024x1024_20250630-233244.png",
    "usagimimi_girl_3_1024x1024_20250630-233250.png",
  ],
  Ookami: [
    "ookami_girl_1_1024x1024_20250630-233255.png",
    "ookami_girl_2_1024x1024_20250630-233300.png",
    "ookami_girl_3_1024x1024_20250630-233306.png",
  ],
  Nezumimi: [
    "nezumimi_girl_1_1024x1024_20250630-233311.png",
    "nezumimi_girl_2_1024x1024_20250630-232827.png",
    "nezumimi_girl_3_1024x1024_20250630-233317.png",
  ],
};

const defaultImage = "nekomimi_girl_1_1024x1024_20250630-233150.png";

export function getKemonoImage(type: string, index = 0): string {
  const images = imageMap[type];
  if (!images || images.length === 0)
    return `/gallery/portraits/${defaultImage}`;
  // Use round-robin if index is out of range
  return `/gallery/portraits/${images[index % images.length]}`;
}
