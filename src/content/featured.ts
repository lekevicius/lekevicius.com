type FeaturedItem = {
  url: string
  title: string
  description: string
  image?: string
  tag?: string
  note?: string
}

const featuredItems: FeaturedItem[] = [
  {
    url: 'https://dubitai.com',
    title: 'Du Bitai',
    description: 'My weekly tech news podcast',
    note: 'Lithuanian',
    image: 'https://lekevicius.nbg1.your-objectstorage.com/du_bitai_697be39401.png',
  },
  {
    url: '/loop/',
    title: 'Infinite Loop',
    description: 'My mobile game with 50M players',
    // tag: 'New',
    note: 'Sold',
    image: 'https://lekevicius.nbg1.your-objectstorage.com/loop_0959d0b7a8.png',
  },
  // {
  //   url: '/qr-by-hand/',
  //   title: 'QR Codes by Hand',
  //   description: 'First manual code calculation ever',
  // },
  // {
  //   url: '/talks/login-2024/',
  //   title: 'Inevitable End of Labor',
  //   description: 'Talk at LOGIN 2024',
  // },
]

export default featuredItems
