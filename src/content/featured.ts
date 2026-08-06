type FeaturedItem = {
  url: string;
  title: string;
  description: string;
  image?: string;
  tag?: string;
  note?: string;
};

const featuredItems: FeaturedItem[] = [
  {
    url: "https://dubitai.com",
    title: "Du Bitai",
    description: "My weekly tech news podcast",
    note: "Lithuanian",
    image:
      "https://lekevicius.nbg1.your-objectstorage.com/thumbnail_du_bitai_697be39401.png",
  },
  {
    url: "/loop/",
    title: "Infinite Loop",
    description: "My mobile game with 50M players",
    // tag: 'New',
    note: "Sold",
    image:
      "https://lekevicius.nbg1.your-objectstorage.com/thumbnail_loop_0959d0b7a8.png",
  },
];

export default featuredItems;
