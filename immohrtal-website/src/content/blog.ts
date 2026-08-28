/**
 * BLOG — one post: the come up, in Dillon's words.
 *
 * To add or replace posts, edit the `posts` array. The structure
 * stays the same (lede line, sections of paragraphs) and the site
 * picks everything up automatically, including the generated
 * blog/<slug>.html permalink pages and the sitemap.
 */

export interface BlogSection {
  heading: string
  paragraphs: string[]
}

export interface BlogPost {
  slug: string
  title: string
  date: string // display only
  tag: string
  /** the lede: shows on the index teaser and opens the post */
  answer: string
  sections: BlogSection[]
}

export const posts: BlogPost[] = [
  {
    slug: 'the-come-up',
    title: 'The Come Up: Why This Music Waited',
    date: 'July 2026',
    tag: 'The come up',
    answer:
      'I was drawing before I was rapping. I always had a pen in my hand, and I always wanted things to come to life. The music you\'re hearing now waited years for me to be ready to stand behind it. This is the story of the wait.',
    sections: [
      {
        heading: 'It always started with a pen',
        paragraphs: [
          'I was always creating. Drawing, writing, building little worlds out of whatever was in front of me. I always felt like making something brought value to everything around it, and I never grew out of that feeling. The pen just changed jobs over the years.',
          'By sixteen I finally understood cadence and delivery for real, and that changed everything. Rap stopped being something I loved from a distance and became something I could actually do. From that point on I was always making music, even when nobody was supposed to hear it.',
        ],
      },
      {
        heading: 'The permission problem',
        paragraphs: [
          'That passion festered for years, because let\'s be honest: nobody\'s out here asking for a white rapper. I never wanted to patronize the culture or take anything away from what rap actually is. This culture wasn\'t started by white people and it isn\'t owned by them, and I wasn\'t going to touch it carelessly. So I sat on it.',
          'Then there was Mac. Gods like Mac Miller made me believe there was a way to do this if you did it with respect: stay true to what hip hop actually is, keep the sport of it alive, and earn your place line by line instead of assuming you\'re owed one. That\'s the lane I\'m in, and I want to leave my blueprint on this game.',
        ],
      },
      {
        heading: 'Always evolving',
        paragraphs: [
          'I remember when iTunes was still a big deal and Mac dropped a preview track that sounded unlike anything he\'d ever created before. Me and my best friend just sat with it, respecting how hard he was pushing himself to level up. He kept evolving like that until the day he passed.',
          'I carried that into my own life. You should always be evolving. You should have motivations, figures, dreams. You should feel every single emotion the human brain is supposed to feel. That\'s exactly what his music was, and that\'s exactly what it did for me. I don\'t think I\'d be here if it wasn\'t for his music.',
        ],
      },
      {
        heading: 'The detour and the return',
        paragraphs: [
          'After my undergrad I got launched into marketing management roles, and that blossomed into becoming a CHIEF MARKETING OFFICER. That should be all caps, by the way. I worked so hard to get where I\'m at that the music never got the priority I always meant to give it.',
          'The songs you\'re hearing now were recorded in 2023. I\'ve remastered them, remixed them, and lived with them long enough to know they hold up. I moved to Pittsburgh that same year, and this city\'s been home ever since. I feel a deep tie to it, and to the artists who put it on the map.',
          'Now I\'m finally in the right headspace to do what I set out to do: leave a legacy, leave a stamp on Pittsburgh the way Mac has, the way the other greats from this city have. This music needed to see the light of day. So here it is.',
        ],
      },
    ],
  },
]
