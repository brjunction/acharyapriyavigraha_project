import { LayoutGrid, UserRound, Sparkles, Clock, NotebookPen, HandHeart, Gift, Mail, Image as ImageIcon, MapPin, Package, Crown, GitBranch, IdCard, Landmark } from "lucide-react";

/** Every part of Śrīla Gurudeva’s section, in order. */
export const GURUDEVA_TABS = [
  ["/gurudeva", "Overview", LayoutGrid], ["/gurudeva/who-is-srila-gurudeva", "Who is Śrīla Gurudeva", UserRound], ["/gurudeva/radha-gopal-jiu", "His beloved Deity", Sparkles],
  ["/gurudeva/timeline", "Life timeline", Clock], ["/gurudeva/diaries", "His diary", NotebookPen], ["/gurudeva/memories", "Memories", HandHeart], ["/gurudeva/glorifications", "Glorifications", Gift],
  ["/gurudeva/letters", "Letters", Mail], ["/gurudeva/gallery", "Gallery", ImageIcon], ["/gurudeva/places-of-remembrance", "Places", MapPin], ["/gurudeva/personal-belongings", "Belongings", Package],
  ["/gurudeva/srila-prabhupada", "Śrīla Prabhupāda", Crown], ["/gurudeva/guru-parampara", "Paramparā", GitBranch], ["/gurudeva/disciples", "Disciples", IdCard], ["/gurudeva/projects", "Projects", Landmark],
] as const;
