import { CET6Article } from './cet6_reading';

const CATEGORIES = ['Science', 'Culture', 'Technology', 'Environment', 'Economy', 'Health', 'Education', 'Art', 'History', 'Psychology'] as const;
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

const TITLES_PREFIX = [
  'The Future of', 'Understanding', 'The Impact of', 'A Deep Dive into', 
  'Why We Should Care About', 'The History of', 'Innovations in', 'Challenges of', 
  'The Rise of', 'The Fall of', 'Exploring', 'Debating', 'The Truth About',
  'Unlocking the Secrets of', 'Navigating', 'The Evolution of', 'Rethinking'
];

const TOPICS = [
  'Artificial Intelligence', 'Climate Change', 'Global Economics', 'Modern Art', 
  'Quantum Computing', 'Sustainable Energy', 'Social Psychology', 'Digital Privacy', 
  'Space Exploration', 'Genetic Engineering', 'Urban Planning', 'Remote Work',
  'Cryptocurrency', 'Mental Health', 'Ocean Conservation', 'Renewable Resources',
  'Education Reform', 'Cultural Heritage', 'Biodiversity', 'Cybersecurity',
  'Virtual Reality', 'Blockchain', 'Cognitive Science', 'Nanotechnology',
  'Globalization', 'Smart Cities', 'Biohacking', 'Astrophysics', 'Philosophy',
  'Linguistics', 'Anthropology', 'Marine Biology', 'Robotics'
];

const CONTENT_TEMPLATES = [
  "In recent years, {topic} has become a subject of intense debate. Experts argue that its implications are far-reaching, affecting everything from our daily routines to the global economy. However, skeptics remain cautious, pointing out potential risks that have yet to be fully understood.",
  "The rapid advancement of {topic} is transforming the way we live and work. While the benefits are undeniable, such as increased efficiency and connectivity, there are also significant challenges. Privacy concerns, ethical dilemmas, and the potential for inequality are just a few of the issues that need to be addressed.",
  "Understanding {topic} is crucial for navigating the modern world. It is not just a technical or academic subject; it is a fundamental part of our society. By examining its history and current trends, we can better prepare for the future and make informed decisions.",
  "What does the future hold for {topic}? Many predict a revolution that will redefine industries and social norms. Others foresee a more gradual evolution. regardless of the pace, one thing is certain: change is inevitable, and adaptation is key.",
  "At the heart of {topic} lies a simple question: how do we balance progress with responsibility? As we push the boundaries of what is possible, we must also consider the ethical and environmental costs. Sustainable development is not just a buzzword; it is a necessity.",
  "The intersection of {topic} and daily life is becoming increasingly visible. From the way we communicate to how we consume information, the influence is undeniable. This shift requires a new level of literacy and critical thinking from all of us.",
  "History teaches us that {topic} is not a new phenomenon, but its current velocity is unprecedented. By looking back at similar patterns in the past, we might find clues on how to manage the transition we are currently experiencing."
];

function generateRandomArticle(index: number): CET6Article {
  const prefix = TITLES_PREFIX[Math.floor(Math.random() * TITLES_PREFIX.length)];
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const title = `${prefix} ${topic}`;
  
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const difficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];
  
  // Use LoremFlickr with a lock/random param to ensure unique image per index but persistent for that index
  // Keywords match the category for relevance
  const imageUrl = `https://loremflickr.com/800/600/${category.toLowerCase()}?lock=${index}`;
  
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
    category: category as any,
    duration: Math.floor(Math.random() * 10) + 2 // 2-12 mins
  };
}

export const generateLargeLibrary = (count: number = 2000): CET6Article[] => {
  return Array.from({ length: count }, (_, i) => generateRandomArticle(i));
};
