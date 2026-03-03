/** Planet and simulation constants for Sun Rail v2. */

export interface PlanetData {
  name: string;
  /** Semi-major axis in AU */
  semiMajorAxis: number;
  /** Eccentricity (0 = circle, <1 = ellipse) */
  eccentricity: number;
  /** Inclination in degrees (relative to ecliptic) */
  inclination: number;
  /** Longitude of ascending node in degrees */
  longitudeAscendingNode: number;
  /** Argument of perihelion in degrees */
  argumentOfPerihelion: number;
  /** Mean anomaly at epoch (J2000) in degrees */
  meanAnomalyAtEpoch: number;
  /** Orbital period in Earth days */
  orbitalPeriod: number;
  /** Display color hex */
  color: string;
  /** Visual sphere radius (scene units) */
  displayRadius: number;
  /** Station radius — zone around planet for proximity FX */
  stationRadius: number;
  /** Texture filename in public/textures/ (null = use color only) */
  textureFile: string | null;
}

/** Scale factor: 1 AU = this many scene units */
export const AU_SCALE = 5;

/** Gravitational parameter (normalized: GM_sun in AU³/day² units) */
export const MU_SUN = (4 * Math.PI * Math.PI) / (365.25 * 365.25);

/** All 8 planets with real Keplerian orbital elements (J2000 epoch) */
export const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    semiMajorAxis: 0.387,
    eccentricity: 0.2056,
    inclination: 7.005,
    longitudeAscendingNode: 48.331,
    argumentOfPerihelion: 29.124,
    meanAnomalyAtEpoch: 174.796,
    orbitalPeriod: 87.97,
    color: "#a0a0a0",
    displayRadius: 0.10,
    stationRadius: 0.25,
    textureFile: "mercury.jpg",
  },
  {
    name: "Venus",
    semiMajorAxis: 0.723,
    eccentricity: 0.0068,
    inclination: 3.395,
    longitudeAscendingNode: 76.680,
    argumentOfPerihelion: 54.884,
    meanAnomalyAtEpoch: 50.115,
    orbitalPeriod: 224.70,
    color: "#e8a735",
    displayRadius: 0.18,
    stationRadius: 0.35,
    textureFile: "venus.jpg",
  },
  {
    name: "Earth",
    semiMajorAxis: 1.000,
    eccentricity: 0.0167,
    inclination: 0.000,
    longitudeAscendingNode: 0.0,
    argumentOfPerihelion: 102.937,
    meanAnomalyAtEpoch: 357.517,
    orbitalPeriod: 365.25,
    color: "#4fc3f7",
    displayRadius: 0.20,
    stationRadius: 0.40,
    textureFile: "earth.jpg",
  },
  {
    name: "Mars",
    semiMajorAxis: 1.524,
    eccentricity: 0.0934,
    inclination: 1.850,
    longitudeAscendingNode: 49.558,
    argumentOfPerihelion: 286.502,
    meanAnomalyAtEpoch: 19.373,
    orbitalPeriod: 686.97,
    color: "#d4603a",
    displayRadius: 0.15,
    stationRadius: 0.40,
    textureFile: "mars.jpg",
  },
  {
    name: "Jupiter",
    semiMajorAxis: 5.203,
    eccentricity: 0.0489,
    inclination: 1.303,
    longitudeAscendingNode: 100.464,
    argumentOfPerihelion: 273.867,
    meanAnomalyAtEpoch: 20.020,
    orbitalPeriod: 4332.59,
    color: "#c88b3a",
    displayRadius: 0.45,
    stationRadius: 1.0,
    textureFile: "jupiter.jpg",
  },
  {
    name: "Saturn",
    semiMajorAxis: 9.537,
    eccentricity: 0.0565,
    inclination: 2.489,
    longitudeAscendingNode: 113.665,
    argumentOfPerihelion: 339.392,
    meanAnomalyAtEpoch: 317.020,
    orbitalPeriod: 10759.22,
    color: "#e0c068",
    displayRadius: 0.40,
    stationRadius: 0.9,
    textureFile: "saturn.jpg",
  },
  {
    name: "Uranus",
    semiMajorAxis: 19.191,
    eccentricity: 0.0473,
    inclination: 0.773,
    longitudeAscendingNode: 74.006,
    argumentOfPerihelion: 96.998,
    meanAnomalyAtEpoch: 142.238,
    orbitalPeriod: 30688.5,
    color: "#7de3f4",
    displayRadius: 0.32,
    stationRadius: 0.8,
    textureFile: "uranus.jpg",
  },
  {
    name: "Neptune",
    semiMajorAxis: 30.069,
    eccentricity: 0.0086,
    inclination: 1.770,
    longitudeAscendingNode: 131.784,
    argumentOfPerihelion: 276.336,
    meanAnomalyAtEpoch: 256.228,
    orbitalPeriod: 60182.0,
    color: "#3f51b5",
    displayRadius: 0.30,
    stationRadius: 0.8,
    textureFile: "neptune.jpg",
  },
];

/** Sun display properties */
export const SUN = {
  color: "#fff4e0",
  emissiveColor: "#ffc107",
  displayRadius: 0.5,
};

/** Color palette */
export const COLORS = {
  background: "#020205",
  cyan: "#00f3ff",
  gold: "#ffc107",
  success: "#00e676",
  failure: "#ff1744",
};

/** Time compression options */
export const TIME_SPEEDS = [1, 50, 100, 1000] as const;
export type TimeSpeed = (typeof TIME_SPEEDS)[number];

/** Seconds of real time per simulated day at 1x speed */
export const SECONDS_PER_SIM_DAY = 1;
