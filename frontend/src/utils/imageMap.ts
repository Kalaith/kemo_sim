// Map kemonomimi types to available images copied from food_frenzy assets.
const imageMap: Record<string, string[]> = {
  Nekomimi: ['cat.png'],
  Inumimi: ['pig.png'],
  Kitsunemimi: ['fox.png'],
  Usagimimi: ['rabbit.png'],
  Ookami: ['bear.png'],
  Nezumimi: ['fish.png'],
};

const fallbackImage = 'cat.png';

export function getKemonoImage(type: string, index = 0): string {
  const images = imageMap[type];
  if (!images || images.length === 0)
    return `${import.meta.env.BASE_URL}assets/${fallbackImage}`;
  // Use round-robin if index is out of range
  return `${import.meta.env.BASE_URL}assets/${images[index % images.length]}`;
}
