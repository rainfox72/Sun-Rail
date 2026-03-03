/** Zustand game state store for Sun Rail v2. */

import { create } from "zustand";
import {
  PLANETS,
  SECONDS_PER_SIM_DAY,
  type TimeSpeed,
} from "../simulation/constants";
import {
  computeTransfer,
  type TransferArc,
} from "../simulation/transfer";
import { playLaunch, playArrival, playClick } from "../audio/AudioManager";

export type GameState = "idle" | "prelaunch" | "in_transit" | "arrived";

export interface ActiveTrain {
  arc: TransferArc;
  departureTime: number;
  progress: number; // 0..1
  originIndex: number;
  targetIndex: number;
}

export interface GameStore {
  // Simulation time
  simTime: number;
  speedMultiplier: TimeSpeed;
  paused: boolean;

  // Game state
  gameState: GameState;
  selectedOrigin: number;
  selectedTarget: number;
  activeTrain: ActiveTrain | null;

  // Auto mode — sequential line Mercury→Neptune→Mercury
  autoMode: boolean;
  autoLineIndex: number;   // current station index in PLANETS (0..7)
  autoDirection: 1 | -1;   // 1 = outbound (Mercury→Neptune), -1 = inbound
  autoDwellUntil: number;  // sim time when dwell ends and next launch happens

  // Event splash
  splashMessage: string | null;
  splashType: "success" | null;

  // Actions
  tick: (deltaSeconds: number) => void;
  setSpeed: (speed: TimeSpeed) => void;
  selectRoute: (origin: number, target: number) => void;
  launch: () => void;
  reset: () => void;
  toggleAutoMode: () => void;
  togglePause: () => void;
  dismissSplash: () => void;
}

/** Dwell time at each station in auto mode (sim days). */
const AUTO_DWELL_DAYS = 2;

export const useGameStore = create<GameStore>((set, get) => ({
  simTime: 0,
  speedMultiplier: 1 as TimeSpeed,
  paused: false,

  gameState: "idle",
  selectedOrigin: 2, // Earth
  selectedTarget: 3, // Mars
  activeTrain: null,

  autoMode: false,
  autoLineIndex: 0,
  autoDirection: 1,
  autoDwellUntil: 0,

  splashMessage: null,
  splashType: null,

  tick: (deltaSeconds: number) => {
    const state = get();
    if (state.paused) return;

    const simDelta =
      (deltaSeconds / SECONDS_PER_SIM_DAY) * state.speedMultiplier;
    const newTime = state.simTime + simDelta;

    // Update train if in transit
    if (state.gameState === "in_transit" && state.activeTrain) {
      const train = state.activeTrain;
      const elapsed = newTime - train.departureTime;
      const newProgress = Math.min(elapsed / train.arc.transferTime, 1);

      if (newProgress >= 1) {
        // Bezier endpoint = target planet — arrival guaranteed
        const targetPlanet = PLANETS[train.targetIndex];
        playArrival();
        set({
          simTime: newTime,
          gameState: "arrived",
          activeTrain: { ...train, progress: 1 },
          splashMessage: `ARRIVED AT ${targetPlanet.name.toUpperCase()} STATION`,
          splashType: "success",
        });
        return;
      }

      set({
        simTime: newTime,
        activeTrain: { ...train, progress: newProgress },
      });
    } else {
      set({ simTime: newTime });
    }

    // Auto mode: sequential line Mercury→Venus→...→Neptune→...→Mercury
    const currentState = get().gameState;
    if (state.autoMode) {
      if (currentState === "arrived") {
        // Advance to next station in the line
        let nextIdx = state.autoLineIndex + state.autoDirection;
        let newDir = state.autoDirection;

        // Bounce at ends
        if (nextIdx >= PLANETS.length) {
          newDir = -1;
          nextIdx = PLANETS.length - 2;
        } else if (nextIdx < 0) {
          newDir = 1;
          nextIdx = 1;
        }

        // Compute upcoming origin/target for ghost arc preview
        // Origin = where we just arrived (current autoLineIndex)
        // The fromIdx formula: nextIdx - newDir
        const previewFrom = Math.max(0, Math.min(PLANETS.length - 1,
          nextIdx - newDir));

        set({
          gameState: "idle",
          activeTrain: null,
          splashMessage: null,
          splashType: null,
          autoLineIndex: nextIdx,
          autoDirection: newDir as 1 | -1,
          autoDwellUntil: newTime + AUTO_DWELL_DAYS,
          selectedOrigin: previewFrom,
          selectedTarget: nextIdx,
        });
      } else if (currentState === "idle" && newTime >= state.autoDwellUntil) {
        // Launch to the current autoLineIndex target
        const fromIdx = state.activeTrain
          ? state.activeTrain.targetIndex
          : Math.max(0, Math.min(PLANETS.length - 1,
              state.autoLineIndex - state.autoDirection));
        const toIdx = state.autoLineIndex;

        if (fromIdx === toIdx) return;

        const origin = PLANETS[fromIdx];
        const target = PLANETS[toIdx];
        const arc = computeTransfer(origin, target, newTime, fromIdx, toIdx);

        playLaunch();
        set({
          selectedOrigin: fromIdx,
          selectedTarget: toIdx,
          gameState: "in_transit",
          activeTrain: {
            arc,
            departureTime: newTime,
            progress: 0,
            originIndex: fromIdx,
            targetIndex: toIdx,
          },
        });
      }
    }
  },

  setSpeed: (speed: TimeSpeed) => {
    playClick();
    set({ speedMultiplier: speed });
  },

  selectRoute: (origin: number, target: number) => {
    if (origin === target) return;
    set({
      selectedOrigin: origin,
      selectedTarget: target,
      gameState: "prelaunch",
      activeTrain: null,
    });
  },

  launch: () => {
    const state = get();
    if (state.gameState !== "prelaunch" && state.gameState !== "idle") return;

    const origin = PLANETS[state.selectedOrigin];
    const target = PLANETS[state.selectedTarget];
    const arc = computeTransfer(
      origin, target, state.simTime,
      state.selectedOrigin, state.selectedTarget
    );

    playLaunch();
    set({
      gameState: "in_transit",
      activeTrain: {
        arc,
        departureTime: state.simTime,
        progress: 0,
        originIndex: state.selectedOrigin,
        targetIndex: state.selectedTarget,
      },
    });
  },

  reset: () =>
    set({
      gameState: "idle",
      activeTrain: null,
      splashMessage: null,
      splashType: null,
    }),

  toggleAutoMode: () => {
    const state = get();
    const entering = !state.autoMode;
    set({
      autoMode: entering,
      gameState: "idle",
      activeTrain: null,
      splashMessage: null,
      splashType: null,
      // Start at index 1 (Venus = first destination, Mercury = origin)
      autoLineIndex: entering ? 1 : 0,
      autoDirection: 1,
      autoDwellUntil: state.simTime,
      // Set selectedOrigin/Target so ghost arc shows correct route
      selectedOrigin: 0,   // Mercury
      selectedTarget: 1,   // Venus
    });
  },

  togglePause: () => set({ paused: !get().paused }),

  dismissSplash: () => set({ splashMessage: null, splashType: null }),
}));
