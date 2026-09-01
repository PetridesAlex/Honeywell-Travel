// Blog posts data structure
// Add new blog posts by adding objects to the blogPostsRaw array

const attachBlogPostI18n = (post) => ({
  ...post,
  i18n: post.i18n || {
    en: {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
    },
    el: post.i18nEl || {
      title: post.titleEl || post.title,
      excerpt: post.excerptEl || post.excerpt,
      content: post.contentEl || post.content,
      category: post.categoryEl || post.category,
    },
  },
})

const blogPostsRaw = [
  {
    id: 1,
    title: 'Rome in 4 Days : Must-See Attractions of the Eternal City',
    slug: 'rome-in-4-days-must-see-attractions',
    date: '2024-03-01',
    formattedDate: 'March 1, 2024',
    excerpt: 'Emma, 22, shares her first-person journey through Rome—a 4-day city break made possible by her internship at Honeywell Travel. Colosseum, Vatican, gelato, and local tips included.',
    content: `Last autumn, I had the chance to spend four unforgettable days in Rome. I'm Emma, I'm 22, I'm French, and in September 2023 I joined Honeywell Travel for a six-month internship. One of the best parts of this experience was being encouraged to travel and discover new places. So when the opportunity to explore the Eternal City came up, I didn't think twice—and I'm so glad I didn't. Here's my Rome in 4 days: a personal, day-by-day guide that I hope will inspire you for your own city break.

---

**Day 1: Ancient Rome — Colosseum, Forum & Palatine Hill**

I started my first morning in Rome exactly where you'd expect: at the Colosseum. Seeing it in real life, after so many photos and history lessons, really does take your breath away. I highly recommend booking your tickets online in advance to skip the longest queues; you can often get a combined ticket for the Colosseum, the Roman Forum, and Palatine Hill, which saves both time and money.

After the Colosseum, I walked over to the Roman Forum. Walking among the ruins of temples, basilicas, and the old Senate made ancient Rome feel incredibly close. From there, I climbed up to Palatine Hill—one of the seven hills of Rome and, according to legend, where the city was founded. The views over the Forum and the city are stunning, and it's a bit quieter than the Colosseum, so you can really take your time.

**Did you know?** The Colosseum could hold an estimated 50,000 to 80,000 spectators. It was used for gladiatorial contests, animal hunts, and even mock sea battles when the arena was flooded.

**Food tip:** For lunch, I avoided the restaurants right next to the Colosseum and walked a few streets away. I had a simple *cacio e pepe* and a *supplì* (fried rice ball with mozzarella)—simple, Roman, and delicious. Don't skip trying *supplì* at least once while you're in Rome.

---

**Day 2: Vatican City — St. Peter's, Museums & Sistine Chapel**

Day two was dedicated to Vatican City. I started early at St. Peter's Basilica. Entry to the basilica itself is free, but I paid a little extra to climb the dome. The climb is steep in places, but the view over St. Peter's Square and Rome is absolutely worth it.

Then I spent several hours in the Vatican Museums. The collection is enormous—you could spend days there—so I focused on the main route that leads to the Sistine Chapel. Seeing Michelangelo's ceiling in person is something I'll never forget. Remember to dress modestly (shoulders and knees covered) or you may not be allowed in.

**Did you know?** The Sistine Chapel ceiling took Michelangelo about four years to paint (1508–1512). He reportedly painted much of it standing up, not lying on his back as many people imagine.

**Food tip:** I had a late lunch in the Borgo area, just outside the Vatican walls. I tried *carbonara* the Roman way—no cream, just eggs, pecorino, guanciale, and black pepper. If a menu says "cream" in the carbonara, it's not the traditional Roman version.

---

**Day 3: Baroque Rome — Trevi Fountain, Spanish Steps & Piazza Navona**

On day three I embraced Baroque Rome. I went to the Trevi Fountain early in the morning to enjoy it with fewer crowds. According to tradition, throwing a coin with your right hand over your left shoulder into the fountain is supposed to ensure your return to Rome. I threw mine—and I already want to go back.

From there I walked to the Spanish Steps (Piazza di Spagna). Sitting on the steps is now restricted in some areas to protect them, but you can still admire the view and the elegant square. I then wandered through the narrow streets of the historic centre until I reached Piazza Navona, with its beautiful fountains and lively atmosphere. It's a great place to sit with a coffee or a gelato and watch the world go by.

**Did you know?** The coins thrown into the Trevi Fountain are collected regularly and donated to charity. So your wish might also do a little good.

**Food tip:** For gelato, I asked locals for recommendations and was told to look for places that use natural colours (no bright neon green or blue) and where the pistachio isn't bright green. My favourite was a small *gelateria* near Piazza Navona—creamy, flavourful, and not too sweet.

---

**Day 4: Trastevere & Local Life**

On my last full day, I crossed the Tiber to Trastevere. This neighbourhood quickly became my favourite. Its narrow, cobbled streets, colourful buildings, and mix of locals and travellers give it a special charm. I spent the morning just wandering, popping into small churches and little shops, and taking far too many photos.

In the afternoon I visited the Orange Garden (Giardino degli Aranci) on the Aventine Hill for a peaceful view over Rome, and then peeked through the famous keyhole of the Knights of Malta for that picture-perfect view of St. Peter's Dome. In the evening I went back to Trastevere for dinner—a proper Roman *amatriciana* and a glass of wine. The area is full of trattorias; the best advice I got was to choose somewhere busy with locals and avoid menus that are only in English with huge photos of the dishes.

**Did you know?** Trastevere means "across the Tiber" in Latin. For a long time it was a working-class neighbourhood, and it has kept a more local, less polished character than some parts of the historic centre.

**Personal tip:** Leave time to get a bit lost. Some of my best moments in Rome were in streets I hadn't planned to walk down—a tiny piazza, a hidden courtyard, or a small bakery that wasn't in any guide. Rome rewards curiosity.

---

**A few practical notes**

- **Getting around:** I walked most of the time. Rome's centre is dense and walkable, and you see so much more on foot. I used public transport only a couple of times.
- **When to go:** I was there in autumn and the weather was ideal—warm but not too hot, and fewer tourists than in summer. Spring is also a beautiful time to visit.
- **Honeywell Travel:** This trip was part of my internship experience. Being in a travel agency that values actually travelling and discovering destinations made this city break possible, and I'm grateful for that. If you're dreaming of Rome—or any city break—it's worth talking to people who love travel and can help you plan it.

Rome in 4 days is intense but doable. You won't see everything, and that's okay. The Eternal City will be there for your next visit—especially if you throw that coin in the Trevi Fountain. 🇮🇹`,
    category: 'City Guides',
    categoryEl: 'Οδηγοί Πόλεων',
    titleEl: 'Ρώμη σε 4 Μέρες: Τα Αξιοθέατα της Αιώνιας Πόλης',
    excerptEl: 'Η Emma, 22 ετών, μοιράζεται το ταξίδι της στη Ρώμη — city break 4 ημερών μέσα από την πρακτική της στην Honeywell Travel.',
    author: 'Emma',
    image: '/images/blog/rome.webp',
    featured: true,
    tags: ['Rome', 'Italy', 'City Break', 'History', 'Culture', 'Internship', '4 Days']
  },
  {
    id: 2,
    title: 'TRAVELING SOLO : TIPS AND DESTINATIONS',
    slug: 'traveling-solo-tips-and-destinations',
    date: '2023-12-15',
    formattedDate: 'December 15, 2023',
    excerpt: 'Everything you need to know about solo travel, from safety tips to the best destinations for solo travelers seeking adventure and independence.',
    content: `Solo travel is one of the most rewarding experiences you can have. It allows you to discover yourself while exploring the world at your own pace.

**Safety Tips for Solo Travelers:**
- Research your destination thoroughly before departure
- Stay in well-reviewed accommodations
- Keep copies of important documents
- Stay connected with family and friends
- Trust your instincts

**Best Destinations for Solo Travel:**
1. **Japan** - Safe, clean, and incredibly welcoming
2. **Iceland** - Stunning natural beauty and friendly locals
3. **New Zealand** - Perfect for adventure seekers
4. **Portugal** - Affordable and beautiful
5. **Singapore** - Modern, safe, and easy to navigate

Solo travel teaches you independence, confidence, and the joy of meeting new people from different cultures.`,
    category: 'Travel Tips',
    categoryEl: 'Συμβουλές Ταξιδιού',
    titleEl: 'ΤΑΞΙΔΙ ΜΟΝΟΣ/ΜΟΝΗ: ΣΥΜΒΟΥΛΕΣ ΚΑΙ ΠΡΟΟΡΙΣΜΟΙ',
    excerptEl: 'Όλα όσα χρειάζεστε για ταξίδια solo — από συμβουλές ασφαλείας έως τους καλύτερους προορισμούς για ανεξάρτητες εξερευνήσεις.',
    author: 'Honeywell Travel Team',
    image: '/images/blog/solo-travel.webp',
    featured: true,
    tags: ['Solo Travel', 'Travel Tips', 'Adventure', 'Safety']
  },
  {
    id: 3,
    title: 'DISCOVER THE WORLD THROUGH GASTRONOMY',
    slug: 'discover-world-through-gastronomy',
    date: '2023-12-06',
    formattedDate: 'December 6, 2023',
    excerpt: 'Explore different cultures through their unique culinary traditions, from street food to fine dining experiences around the globe.',
    content: `Food is one of the most authentic ways to experience a culture. Every dish tells a story, every recipe carries tradition, and every meal brings people together.

**Culinary Destinations to Explore:**

**Italy** - From pasta in Rome to pizza in Naples, Italian cuisine is a celebration of fresh ingredients and simple perfection.

**Japan** - Experience the art of sushi, the comfort of ramen, and the elegance of kaiseki dining.

**Thailand** - Discover the perfect balance of sweet, sour, salty, and spicy in Thai street food.

**France** - Indulge in world-class pastries, cheeses, and wines in the culinary capital of the world.

**Mexico** - Explore the vibrant flavors of tacos, mole, and authentic Mexican cuisine.

Traveling for food allows you to connect with locals, understand traditions, and create unforgettable memories through taste.`,
    category: 'Food & Culture',
    categoryEl: 'Φαγητό & Πολιτισμός',
    titleEl: 'ΑΝΑΚΑΛΥΨΤΕ ΤΟΝ ΚΟΣΜΟ ΜΕΣΩ ΤΗΣ ΓΑΣΤΡΟΝΟΜΙΑΣ',
    excerptEl: 'Εξερευνήστε διαφορετικούς πολιτισμούς μέσα από μοναδικές γαστρονομικές παραδόσεις — από street food έως fine dining.',
    author: 'Honeywell Travel Team',
    image: '/images/blog/gastronomy.webp',
    featured: false,
    tags: ['Food', 'Culture', 'Culinary', 'Dining', 'Local Experience']
  }
]

export const blogPosts = blogPostsRaw.map(attachBlogPostI18n)

// Helper function to get blog post by slug
export const getBlogPostBySlug = (slug) => {
  return blogPosts.find(post => post.slug === slug)
}

// Helper function to get featured blog posts
export const getFeaturedPosts = () => {
  return blogPosts.filter(post => post.featured)
}

// Helper function to get posts by category
export const getPostsByCategory = (category) => {
  return blogPosts.filter(post => post.category === category)
}

// Get all unique categories
export const getCategories = () => {
  const categories = [...new Set(blogPosts.map(post => post.category))]
  return categories.sort()
}
