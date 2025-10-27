const now = () => new Date().toISOString();
let nextId = 1000;
const generateId = () => nextId++;

const store = {
  tasks: [
    {
      id: generateId(),
      title: 'Plan brand moodboard',
      description: 'Collect typography and palette ideas.',
      status: 'in_progress',
      due_date: now(),
    },
    {
      id: generateId(),
      title: 'Call the print studio',
      description: 'Confirm risograph slot for Friday.',
      status: 'todo',
      due_date: now(),
    },
  ],
  notes: [
    {
      id: generateId(),
      title: 'Workshop questions',
      body: 'What is the ideal handoff format? How do we document rituals?',
      tags: 'workshop,ux',
    },
  ],
  music: [
    {
      id: generateId(),
      title: 'Aurora Echoes',
      url: 'https://example.com/aurora',
      platform: 'bandcamp',
    },
  ],
  photos: [
    {
      id: generateId(),
      filename: 'sample.jpg',
      url: '/uploads/photos/sample.jpg',
      caption: 'Gradient reflections',
    },
  ],
  learn: [
    {
      id: generateId(),
      title: 'Accessible combobox patterns',
      url: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/',
      category: 'guide',
    },
  ],
  places: [
    {
      id: generateId(),
      name: 'Studio Atlas',
      address: '41 Mercer St, NYC',
      lat: 40.721,
      lng: -74.002,
      notes: 'Sunlit corner, great coffee nearby.',
    },
  ],
  inspired_prompts: [
    'Sketch an interface using only circles',
    'Write down a question you cannot answer yet',
    'Plan a micro-adventure for next weekend',
    'List three sounds that calm you',
    'Capture a photo of light and shadow',
  ],
};

module.exports = { store, generateId };
