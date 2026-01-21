import { CET6Article } from './cet6_reading';

const CATEGORIES = ['Science', 'Culture', 'Technology', 'Environment', 'Economy'] as const;
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

const TITLES_PREFIX = [
  'The Future of', 'Understanding', 'The Impact of', 'A Deep Dive into', 
  'Why We Should Care About', 'The History of', 'Innovations in', 'Challenges of', 
  'The Rise of', 'The Fall of', 'Exploring', 'Debating'
];

const TOPICS = [
  'Artificial Intelligence', 'Climate Change', 'Global Economics', 'Modern Art', 
  'Quantum Computing', 'Sustainable Energy', 'Social Psychology', 'Digital Privacy', 
  'Space Exploration', 'Genetic Engineering', 'Urban Planning', 'Remote Work',
  'Cryptocurrency', 'Mental Health', 'Ocean Conservation', 'Renewable Resources',
  'Education Reform', 'Cultural Heritage', 'Biodiversity', 'Cybersecurity'
];

const IMAGES = [
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800', // Tech/Robot
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800', // Nature/Eco
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800', // Social/Phone
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800', // Space
  'https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800', // Economy/Graph
  'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800', // Science/Microscope
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800', // Tech/Circuit
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800', // Nature/Landscape
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800', // Code
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800', // Cyberpunk
  'https://images.unsplash.com/photo-1526304640152-d4619684e484?auto=format&fit=crop&q=80&w=800', // Money
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800', // Medical
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800', // Chemistry
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800', // Education
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800'  // Teamwork
];

const CONTENT_TEMPLATES = [
  "In recent years, {topic} has become a subject of intense debate. Experts argue that its implications are far-reaching, affecting everything from our daily routines to the global economy. However, skeptics remain cautious, pointing out potential risks that have yet to be fully understood.",
  "The rapid advancement of {topic} is transforming the way we live and work. While the benefits are undeniable, such as increased efficiency and connectivity, there are also significant challenges. Privacy concerns, ethical dilemmas, and the potential for inequality are just a few of the issues that need to be addressed.",
  "Understanding {topic} is crucial for navigating the modern world. It is not just a technical or academic subject; it is a fundamental part of our society. By examining its history and current trends, we can better prepare for the future and make informed decisions.",
  "What does the future hold for {topic}? Many predict a revolution that will redefine industries and social norms. Others foresee a more gradual evolution. regardless of the pace, one thing is certain: change is inevitable, and adaptation is key.",
  "At the heart of {topic} lies a simple question: how do we balance progress with responsibility? As we push the boundaries of what is possible, we must also consider the ethical and environmental costs. Sustainable development is not just a buzzword; it is a necessity."
];

function generateRandomArticle(index: number): CET6Article {
  const prefix = TITLES_PREFIX[Math.floor(Math.random() * TITLES_PREFIX.length)];
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const title = `${prefix} ${topic}`;
  
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const difficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];
  const imageUrl = IMAGES[Math.floor(Math.random() * IMAGES.length)];
  
  const contentTemplate = CONTENT_TEMPLATES[Math.floor(Math.random() * CONTENT_TEMPLATES.length)];
  const content = contentTemplate.replace(/{topic}/g, topic) + "\n\n" + 
                  contentTemplate.replace(/{topic}/g, "this field") + "\n\n" + 
                  "In conclusion, the journey of understanding is continuous. We must remain vigilant and open-minded as new discoveries are made.";

  return {
    id: `generated-${index}`,
    title: title,
    summary: content.substring(0, 100) + '...',
    content: content,
    imageUrl: imageUrl,
    difficulty: difficulty,
    category: category,
    duration: Math.floor(Math.random() * 10) + 2 // 2-12 mins
  };
}

export const generateLargeLibrary = (count: number = 1000): CET6Article[] => {
  return Array.from({ length: count }, (_, i) => generateRandomArticle(i));
};
