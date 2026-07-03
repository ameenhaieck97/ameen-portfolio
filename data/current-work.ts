export type CurrentWorkProject = {
  id: "mujeebCenter" | "najafPodcast" | "iliaApp";
  logo: string;
};

export const currentWorkProjects: CurrentWorkProject[] = [
  { id: "mujeebCenter", logo: "/images/current-work/al-mujeeb-center.svg" },
  { id: "najafPodcast", logo: "/images/current-work/najaf-time-podcast.svg" },
  { id: "iliaApp", logo: "/images/current-work/ilia-app.svg" },
];
