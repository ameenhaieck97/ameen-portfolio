export type CurrentWorkProject = {
  id: "institute" | "mujeebCenter" | "najafPodcast" | "iliaApp";
  logo: string;
  /** Design assets scoped to this project — populated once real work is sent. */
  designs: string[];
};

// The institute itself is one of the four clickable nodes (the hub), shown
// separately from the three project cards in the ecosystem diagram.
export const instituteHub: CurrentWorkProject = {
  id: "institute",
  logo: "/images/current-work/al-mustafa-institute.svg",
  designs: [],
};

export const currentWorkProjects: CurrentWorkProject[] = [
  { id: "mujeebCenter", logo: "/images/current-work/al-mujeeb-center.svg", designs: [] },
  { id: "najafPodcast", logo: "/images/current-work/najaf-time-podcast.svg", designs: [] },
  { id: "iliaApp", logo: "/images/current-work/ilia-app.svg", designs: [] },
];
