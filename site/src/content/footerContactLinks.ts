import type { ContactServiceIcon } from "./contactServices";

export type FooterContactLink = {
  id: string;
  label: string;
  tooltip: string;
  href: string;
  icon: ContactServiceIcon;
  copyValue?: string;
};

export type FooterContactGroup = {
  title: string;
  links: FooterContactLink[];
};

const footerContactLinks: FooterContactGroup[] = [
  {
    title: "Contact",
    links: [
      {
        id: "email",
        label: "Email",
        tooltip: "Copy email address",
        href: "mailto:click-to-copy@spam-prevention.com",
        icon: "email",
        copyValue: "jonas@lekevicius.com",
      },
      {
        id: "signal",
        label: "Signal",
        tooltip: "Message on Signal",
        href: "https://signal.me/#eu/519y9OoMmKjPzHFsP0XUP5MNP8lnBpytNLLocKpiIcX-x_LnkrpOu7Zs7uH96Ka7",
        icon: "signal",
      },
      {
        id: "telegram",
        label: "Telegram",
        tooltip: "Message on Telegram",
        href: "https://t.me/lekevicius",
        icon: "telegram",
      },
      {
        id: "messenger",
        label: "Messenger",
        tooltip: "Message on Messenger",
        href: "https://m.me/lekevicius",
        icon: "messenger",
      },
    ],
  },
  {
    title: "Follow",
    links: [
      {
        id: "x",
        label: "X",
        tooltip: "Follow on X",
        href: "https://x.com/lekevicius",
        icon: "x",
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        tooltip: "Connect on LinkedIn",
        href: "https://linkedin.com/in/lekevicius",
        icon: "linkedin",
      },
      {
        id: "github",
        label: "GitHub",
        tooltip: "Follow on GitHub",
        href: "https://github.com/lekevicius",
        icon: "github",
      },
      {
        id: "instagram",
        label: "Instagram",
        tooltip: "Follow on Instagram",
        href: "https://instagram.com/lekevicius",
        icon: "instagram",
      },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      {
        id: "buttondown",
        label: "Newsletter",
        tooltip: "Subscribe to newsletter",
        href: "https://buttondown.email/lekevicius",
        icon: "buttondown",
      },
      {
        id: "youtube-thought-technologies",
        label: "YouTube",
        tooltip: "Thought Technologies on YouTube",
        href: "https://youtube.com/@ThoughtTechs",
        icon: "youtube",
      },
      {
        id: "youtube-lithuanian",
        label: "YouTube",
        tooltip: "Subscribe on YouTube [Lithuanian]",
        href: "https://youtube.com/@JonasLekevicius",
        icon: "youtube",
      },
      {
        id: "letterboxd",
        label: "Letterboxd",
        tooltip: "Follow on Letterboxd",
        href: "https://letterboxd.com/lekevicius",
        icon: "letterboxd",
      },
    ],
  },
];

export default footerContactLinks;
