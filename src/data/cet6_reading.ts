export interface CET6Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Science' | 'Culture' | 'Technology' | 'Environment' | 'Economy';
  duration: number; // in minutes
}

export const CET6_READING_SAMPLE: CET6Article[] = [
  {
    id: 'cet6-001',
    title: 'The Impact of Artificial Intelligence on Future Jobs',
    summary: 'Explore how AI is reshaping the workforce and what skills will be essential in the coming decades.',
    content: `Artificial Intelligence (AI) is no longer a futuristic concept; it is weaving itself into the fabric of our daily lives and industries. From automated customer service chatbots to sophisticated data analysis algorithms, AI is transforming how businesses operate.

One of the most significant impacts of AI is automation. Routine and repetitive tasks are increasingly being handled by machines, leading to fears of job displacement. However, history shows that technology often creates more jobs than it destroys. The key lies in adaptation.

As AI takes over mundane tasks, the demand for "soft skills" such as critical thinking, creativity, and emotional intelligence is skyrocketing. These are areas where human intuition still far surpasses machine capability. Future jobs will likely involve a collaboration between human and machine intelligence, rather than a competition.

Moreover, new industries are emerging. We will need AI ethicists, data privacy managers, and robotics maintenance technicians—roles that didn't exist a decade ago. Education systems must evolve to prepare the next generation for this dynamic landscape, emphasizing lifelong learning and adaptability.`,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    difficulty: 'Medium',
    category: 'Technology',
    duration: 5
  },
  {
    id: 'cet6-002',
    title: 'Sustainable Living: A Necessity, Not a Choice',
    summary: 'Why adopting eco-friendly habits is crucial for the survival of our planet and future generations.',
    content: `Climate change is the defining crisis of our time, and the shift towards sustainable living has never been more urgent. Sustainability is not just about recycling plastic bottles; it encompasses a holistic approach to how we consume resources, travel, and eat.

The concept of a "circular economy" is gaining traction. Unlike the traditional linear economy (make, use, dispose), a circular economy aims to minimize waste and make the most of resources. This involves reusing, repairing, refurbishing, and recycling existing materials and products as long as possible.

Individual actions also play a massive role. Reducing meat consumption, opting for public transportation, and supporting brands with ethical supply chains are powerful ways to contribute. The transition to renewable energy sources like solar and wind power is accelerating, offering a glimmer of hope.

However, the clock is ticking. Governments, corporations, and individuals must act in unison. Sustainable living is no longer a lifestyle choice for the few; it is a necessity for the many if we wish to preserve the Earth's biodiversity and habitable climate.`,
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    difficulty: 'Easy',
    category: 'Environment',
    duration: 4
  },
  {
    id: 'cet6-003',
    title: 'The Psychology of Social Media Addiction',
    summary: 'Understanding the mechanisms behind why we scroll and how it affects our mental well-being.',
    content: `Social media platforms are designed to be addictive. They exploit the brain's reward system by releasing dopamine—a "feel-good" chemical—every time we receive a like, comment, or notification. This variable reward schedule keeps users coming back for more, much like a slot machine.

The consequences of this addiction are profound. Studies have linked excessive social media use to increased rates of anxiety, depression, and loneliness. The constant comparison with others' curated "highlight reels" can lead to feelings of inadequacy and low self-esteem.

Furthermore, the "attention economy" means that platforms are constantly vying for our focus, often prioritizing sensational or polarizing content to keep us engaged. This can create echo chambers and spread misinformation rapidly.

Breaking free requires conscious effort. Digital detoxes, setting screen time limits, and curating one's feed to include positive and educational content are practical steps. Understanding the psychology behind the screen is the first step towards reclaiming our time and mental health.`,
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
    difficulty: 'Hard',
    category: 'Culture',
    duration: 6
  },
  {
    id: 'cet6-004',
    title: 'The Renaissance of Space Exploration',
    summary: 'With private companies joining the race, humanity is looking towards Mars and beyond with renewed vigor.',
    content: `We are witnessing a new golden age of space exploration. Unlike the Space Race of the 20th century, which was driven by geopolitical rivalry between superpowers, today's exploration is characterized by international cooperation and the entry of private enterprises.

Companies like SpaceX and Blue Origin have drastically reduced the cost of launching payloads into orbit through reusable rocket technology. This democratization of space access opens up possibilities for space tourism, satellite internet constellations, and even asteroid mining.

The ultimate goal for many is Mars. Establishing a permanent human settlement on the Red Planet presents immense engineering and biological challenges, from radiation protection to sustainable food production. Yet, the scientific rewards would be immeasurable, potentially answering the age-old question: Are we alone in the universe?

This renaissance is not just about survival; it's about inspiration. It pushes the boundaries of human ingenuity and reminds us that our potential is limitless when we look up at the stars.`,
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
    difficulty: 'Medium',
    category: 'Science',
    duration: 5
  },
  {
    id: 'cet6-005',
    title: 'Global Economic Shifts in a Post-Pandemic World',
    summary: 'Analyzing how recent global events have disrupted supply chains and accelerated digital currencies.',
    content: `The global economy is undergoing a seismic shift. The pandemic exposed the fragility of global supply chains, prompting nations to rethink their reliance on just-in-time manufacturing and single-source dependencies. "Resilience" has replaced "efficiency" as the new buzzword in logistics.

Inflationary pressures have returned to many advanced economies, challenging central banks to balance growth with price stability. Simultaneously, the rise of remote work has altered real estate markets and urban planning, with 'digital nomads' reshaping local economies worldwide.

Another frontier is the digitalization of finance. Central Bank Digital Currencies (CBDCs) are being piloted by major economies to improve payment efficiency and financial inclusion. While cryptocurrencies remain volatile, the underlying blockchain technology promises to revolutionize contract law and secure transactions.

Navigating this complex landscape requires agility. Businesses and governments must collaborate to build an economic framework that is robust, inclusive, and prepared for future shocks.`,
    imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800',
    difficulty: 'Hard',
    category: 'Economy',
    duration: 7
  }
];
