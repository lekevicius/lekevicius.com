export type ContactServiceIcon =
  | "bluesky"
  | "buttondown"
  | "discord"
  | "email"
  | "ens"
  | "facebook"
  | "github"
  | "hackernews"
  | "instagram"
  | "letterboxd"
  | "linkedin"
  | "lens"
  | "mastodon"
  | "medium"
  | "messenger"
  | "reddit"
  | "rss"
  | "signal"
  | "telegram"
  | "x"
  | "youtube";

export type ContactService = {
  name: string;
  description: string;
  icon: ContactServiceIcon;
  href: string;
};

export type ContactServiceGroup = {
  id: "contact" | "follow" | "lithuanian";
  title: string;
  services: ContactService[];
};

export const gpgPublicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEYzSWPxYJKwYBBAHaRw8BAQdAOKLBV2r665Xv/gtalxPNFbFn4Zb5BvkybrNB
UD0ZcsG0FGpvbmFzQGxla2V2aWNpdXMuY29tiJkEExYKAEEWIQRw+Ucqjy0uw/Md
ImYw9guqdf/Q1wUCYzSWPwIbAwUJA8JnAAULCQgHAgIiAgYVCgkICwIEFgIDAQIe
BwIXgAAKCRAw9guqdf/Q1/t/APsHB3PVv70Y5Fvm0jZdiAkXT/Q++KdXa/kmES4A
bAEK2AEAs5Plng1hxII6t9wGylSwUjc2gWsL8t+yScyRBqZ3oAe4OARjNJY/Egor
BgEEAZdVAQUBAQdA7mDFEvWFVBuRY5Qy79R6t2o+LBsdrfHyGSgeA5/kMV8DAQgH
iHgEGBYKACAWIQRw+Ucqjy0uw/MdImYw9guqdf/Q1wUCYzSWPwIbDAAKCRAw9guq
df/Q10zXAP9+5/ABBDYdZFH3FHYqlJGYieWaMLlPmpnSQmFZIIFJtgD+OVEmKRDZ
E1bfSUgCOFL1IFBaLs1h/mg551rmNW10wAo=
=tZq9
-----END PGP PUBLIC KEY BLOCK-----`;

const contactServices: ContactServiceGroup[] = [
  {
    id: "contact",
    title: "Contact",
    services: [
      {
        name: "Signal",
        description: "My preferred messaging app.",
        href: "https://signal.me/#eu/519y9OoMmKjPzHFsP0XUP5MNP8lnBpytNLLocKpiIcX-x_LnkrpOu7Zs7uH96Ka7",
        icon: "signal",
      },
      {
        name: "Telegram",
        description: "If you don’t have Signal.",
        href: "https://t.me/lekevicius",
        icon: "telegram",
      },
      {
        name: "Messenger",
        description: "Worst option.",
        href: "https://m.me/lekevicius",
        icon: "messenger",
      },
      {
        name: "Email",
        description: "Good ol’.",
        href: "mailto:jonas@lekevicius.com",
        icon: "email",
      },
    ],
  },
  {
    id: "follow",
    title: "Follow",
    services: [
      {
        name: "Twitter",
        description: "Brief and regular thoughts.",
        href: "https://x.com/lekevicius",
        icon: "x",
      },
      {
        name: "LinkedIn",
        description: "Necessary evil.",
        href: "https://linkedin.com/in/lekevicius",
        icon: "linkedin",
      },
      {
        name: "GitHub",
        description: "All open source.",
        href: "https://github.com/lekevicius",
        icon: "github",
      },
      {
        name: "Instagram",
        description: "Photos and stories.",
        href: "https://instagram.com/lekevicius",
        icon: "instagram",
      },
      {
        name: "YouTube",
        description: "Explanations and experiments.",
        href: "https://www.youtube.com/@FromFirstPrinciples",
        icon: "youtube",
      },
      {
        name: "Letterboxd",
        description: "Movie reviews.",
        href: "https://letterboxd.com/lekevicius",
        icon: "letterboxd",
      },
    ],
  },
  {
    id: "lithuanian",
    title: "Lithuanian",
    services: [
      {
        name: "Facebook",
        description: "Still haven’t deleted.",
        href: "https://facebook.com/lekevicius",
        icon: "facebook",
      },
      {
        name: "Du Bitai",
        description: "Weekly episodes on tech.",
        href: "https://www.youtube.com/@du-bitai",
        icon: "youtube",
      },
    ],
  },
];

export default contactServices;
