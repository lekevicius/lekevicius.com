type FeaturedItem = {
  url: string
  title: string
  description: string
  tag?: string
  note?: string
}

const featuredItems: FeaturedItem[] = [
  {
    url: '/loop/',
    title: 'Infinite Loop',
    description: 'My mobile game with 50M players',
    tag: 'New',
    note: 'Sold',
  },
  {
    url: '/pager/',
    title: 'Pager App',
    description: 'Quickly share links in conferences',
  },
  {
    url: '/qr-by-hand/',
    title: 'QR Codes by Hand',
    description: 'First manual code calculation ever',
  },
  {
    url: '/talks/login-2024/',
    title: 'Inevitable End of Labor',
    description: 'Talk at LOGIN 2024',
  },
]

export default featuredItems
