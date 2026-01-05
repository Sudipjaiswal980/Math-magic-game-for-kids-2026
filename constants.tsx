
export const OPERATIONS = [
  { id: 'addition', label: 'Addition', icon: 'fa-plus', color: 'bg-green-400', hover: 'hover:bg-green-500' },
  { id: 'subtraction', label: 'Subtraction', icon: 'fa-minus', color: 'bg-blue-400', hover: 'hover:bg-blue-500' },
  { id: 'multiplication', label: 'Multiplication', icon: 'fa-times', color: 'bg-yellow-400', hover: 'hover:bg-yellow-500' },
  { id: 'division', label: 'Division', icon: 'fa-divide', color: 'bg-purple-400', hover: 'hover:bg-purple-500' },
];

export const DIFFICULTIES = [
  { 
    id: 'easy', 
    label: 'Easy', 
    range: 10, 
    maxLevel: 100,
    prompt: 'A friendly 3D smiling green star badge, Pixar style, high quality render, solid white background.' 
  },
  { 
    id: 'medium', 
    label: 'Medium', 
    range: 30, 
    maxLevel: 80,
    prompt: 'A magnificent 3D blue glowing magical orb with swirling silver rings, Pixar style, 3D render, high quality, solid white background.' 
  },
  { 
    id: 'hard', 
    label: 'Hard', 
    range: 100, 
    maxLevel: 40,
    prompt: 'A magnificent 3D golden crown with purple jewels, Pixar style, shiny metal, high quality render, solid white background.' 
  },
];

export const MISSION_CHARACTERS = [
  "Spiderman", "Doraemon", "Hulk", "Elsa", "Pikachu", 
  "Iron Man", "Mickey Mouse", "Batman", "Sonic", "Super Mario",
  "Bluey", "Chase from Paw Patrol", "Wonder Woman", "Black Panther"
];

// Base rewards that we will scale
export const REWARD_TYPES = ["Dollars", "Roblox Credit", "Gift Card", "Treasure Chest", "Gold Coins"];

// Added to fix "Module '../constants' has no exported member 'REWARD_ANIMALS'"
export const REWARD_ANIMALS = [
  "Magic Unicorn", "Golden Dragon", "Rainbow Phoenix", "Space Puppy", 
  "Crystal Kitten", "Neon Bunny", "Galactic Turtle", "Sparkle Elephant"
];
