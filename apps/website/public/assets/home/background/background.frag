uniform vec2 iResolution;
uniform float iTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 hash22(vec2 p) {
  vec2 q =
      fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) *
            43758.5453);
  return q;
}

void main() {
  // UV in 0-1, then expand to get more stars (we'll use aspect-correct coords
  // for placement)
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float aspect = iResolution.x / iResolution.y;
  vec2 coord = vec2(uv.x * aspect, uv.y);

  float CELL_SIZE_PX = 20.0;
  float STAR_DENSITY = 0.35;
  float gridScale = iResolution.y / CELL_SIZE_PX;
  coord *= gridScale;

  vec2 cell = floor(coord);
  vec2 cellUv = fract(coord) - 0.5;

  vec3 color = vec3(0.02, 0.02, 0.08); // dark blue-black background

  // Check neighboring cells for star overlap at edges
  for (int dx = -1; dx <= 1; dx++) {
    for (int dy = -1; dy <= 1; dy++) {
      vec2 nCell = cell + vec2(float(dx), float(dy));
      vec2 nCellId = nCell + 0.5;

      float r = hash(nCellId);
      if (r > STAR_DENSITY)
        continue;

      vec2 starOffset = hash22(nCellId) - 0.5;
      vec2 starCenter = vec2(float(dx), float(dy)) + starOffset - cellUv;

      float dist = length(starCenter);
      float starRadius = 0.03 + hash(nCellId + 0.1) * 0.015;
      float star = 1.0 - smoothstep(starRadius * 0.3, starRadius, dist);

      float phase = hash(nCellId + 0.5) * 6.28318;
      float speed = 0.5 + hash(nCellId + 0.7) * 0.5;
      float twinkle = 0.5 + 0.5 * sin(iTime * speed + phase);
      star *= twinkle;

      // Distinct star colors (clearly blue, white, yellow, orange)
      float colorChoice = hash(nCellId + 0.2);
      vec3 starColor;
      if (colorChoice < 0.4) {
        starColor = vec3(0.85, 0.9, 1.0); // blue
      } else if (colorChoice < 0.7) {
        starColor = vec3(1.0, 1.0, 1.0); // white
      } else if (colorChoice < 0.88) {
        starColor = vec3(1.0, 0.98, 0.85); // yellow-white
      } else {
        starColor = vec3(1.0, 0.88, 0.7); // orange
      }

      color += star * starColor;
    }
  }

  gl_FragColor = vec4(color, 1.0);
}
