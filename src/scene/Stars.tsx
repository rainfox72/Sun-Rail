/** Background star field. */

import { Stars as DreiStars } from "@react-three/drei";

export function Stars() {
  return (
    <DreiStars
      radius={100}
      depth={60}
      count={3000}
      factor={3}
      saturation={0}
      fade
      speed={0.5}
    />
  );
}
