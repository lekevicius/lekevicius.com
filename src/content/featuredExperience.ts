type FeaturedExperience = {
  period: string
  role?: string
  company?: string
  description: string
}

const featuredExperience: FeaturedExperience[] = [
  {
    period: '2025 - now',
    role: 'Co-founder',
    company: 'Silent',
    description: 'Building the safest place to talk about work that secures Europe: an end-to-end encrypted communications app.',
  },
  {
    period: '2023 - 2024',
    role: 'Co-founder',
    company: 'Orb Land',
    description:
      'Together with Eric Wall we built the first Harberger tax limited access to the leading thinkers in crypto and AI.\n\n“Oh wow this orb.land thing is actually really cool” — [Vitalik Buterin](https://farcaster.xyz/vitalik.eth/0xf119c177), founder of Ethereum',
  },
  {
    period: '2022',
    role: 'Head of Product',
    company: 'Cube3 AI',
    description:
      'Helped define a novel way to protect blockchain smart contracts against hacks.\n\nWe were granted US patent [US11902435B1](https://patents.google.com/patent/US11902435B1), my first.',
  },
  {
    period: '2019 - 2022',
    description: 'Contracting years. Helped dozens of companies launch their digital products. Also worked on a multi-year project by European Defence Agency.',
  },
  {
    period: '2015 - 2019',
    role: 'Head of Product Design',
    company: 'Treatwell',
    description: 'After Treatwell acquired Lemon Labs I led the product design team, across multiple products and 10 markets, including the largest rebrand in the company history.',
  },
  {
    period: '2015',
    description: 'Released a tiny game called [∞ Loop](/loop). It became my most successful project to date, played by over 50 million people.',
  },
  {
    period: '2011 - 2015',
    role: 'Head of Design',
    company: 'Lemon Labs',
    description: 'Co-founded and led the design in the coolest app design studio around. We built apps for companies that grew to $1B+, and were featured in Apple commercials 3 times.',
  },
  {
    period: 'pre-2011',
    description: 'After school I studied Multimedia Design in Aarhus Business Academy, Denmark, and Graphic Design in Vilnius Art Academy. I’ve built countless side-projects and apps.',
  },
]

export default featuredExperience
