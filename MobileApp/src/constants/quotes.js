const QUOTES = {
  joy: [
    { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
    { text: "Joy is the simplest form of gratitude.", author: "Karl Barth" },
    { text: "The most wasted of all days is one without laughter.", author: "E.E. Cummings" },
    { text: "Enjoy the little things, for one day you may look back and realize they were the big things.", author: "Robert Brault" },
    { text: "Happiness is a direction, not a place.", author: "Sydney J. Harris" },
  ],
  sadness: [
    { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
    { text: "You are allowed to be both a masterpiece and a work in progress.", author: "Sophia Bush" },
    { text: "It's okay not to be okay — just don't give up.", author: "Unknown" },
    { text: "Tears water the seeds of your future growth.", author: "Unknown" },
    { text: "After every storm, the sun will smile; for every problem there is a solution.", author: "William R. Alger" },
    { text: "The wound is the place where the light enters you.", author: "Rumi" },
  ],
  anger: [
    { text: "For every minute you remain angry, you give up sixty seconds of peace of mind.", author: "Ralph Waldo Emerson" },
    { text: "The best fighter is never angry.", author: "Lao Tzu" },
    { text: "Peace begins with a smile.", author: "Mother Teresa" },
    { text: "Speak when you are angry and you will make the best speech you will ever regret.", author: "Ambrose Bierce" },
    { text: "When angry, count to ten before you speak. If very angry, a hundred.", author: "Thomas Jefferson" },
  ],
  fear: [
    { text: "You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face.", author: "Eleanor Roosevelt" },
    { text: "Courage is not the absence of fear — it is taking action in spite of it.", author: "Mark Twain" },
    { text: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell" },
    { text: "Fear is only as deep as the mind allows.", author: "Japanese Proverb" },
    { text: "Everything you want is on the other side of fear.", author: "Jack Canfield" },
  ],
  disgust: [
    { text: "Every adversity carries with it the seed of an equivalent benefit.", author: "Napoleon Hill" },
    { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
    { text: "What you resist persists. What you accept transforms.", author: "Carl Jung" },
    { text: "You don't have to like everything. But you can always choose your response.", author: "Unknown" },
    { text: "Out of difficulties grow miracles.", author: "Jean de la Bruyère" },
  ],
  surprise: [
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "Embrace uncertainty — some of the most beautiful chapters have titles you never expected.", author: "Unknown" },
    { text: "The secret of life is to fall seven times and get up eight.", author: "Paulo Coelho" },
    { text: "Change is the only constant in life. Those who look only to the past are certain to miss the future.", author: "Heraclitus" },
    { text: "Adventure is worthwhile in itself.", author: "Amelia Earhart" },
  ],
  neutral: [
    { text: "Take a deep breath. You are exactly where you need to be.", author: "Unknown" },
    { text: "Small progress is still progress.", author: "Unknown" },
    { text: "You don't have to be perfect to be worthy. You just have to show up.", author: "Unknown" },
    { text: "Be present in all things and thankful for all things.", author: "Maya Angelou" },
    { text: "Stillness is where creativity and solutions to problems are found.", author: "Eckhart Tolle" },
  ],
};

export function getRandomQuote(emotion) {
  const list = QUOTES[emotion] || QUOTES.neutral;
  return list[Math.floor(Math.random() * list.length)];
}

export default QUOTES;
