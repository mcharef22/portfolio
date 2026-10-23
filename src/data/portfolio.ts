export const profile = {
  name: "Mouad Charef",
  location: "Paris, France",
  email: "mouadmami2003@gmail.com",
  phone: "+33 7 67 86 04 43",
  phoneHref: "+33767860443",
  linkedin: "https://www.linkedin.com/in/mouad-charef-218b1a1b8/",
  gitlab: "https://gitlab.com/mcharef22",
  cv: "/CV_Mouad_Charef.pdf",
};
export type Project = {
  id: string;
  name: string;
  category: "professional" | "personal";
  label: string;
  description: string;
  role: string;
  stack: string[];
  features: string[];
  challenge: string;
  results: string;
  security?: string;
  architecture: string[];
  href?: string;
  linkLabel?: string;
  image?: string;
  imageAlt?: string;
  state?: "local" | "ongoing";
  ai?: boolean;
};
