#ifdef GL_ES
precision mediump float;
#endif
  
precision highp float;

varying vec2 vUV;

uniform sampler2D tex;

uniform float time;
uniform float frequency;
uniform float amplitude;
uniform float stretch;

void main() {
  vec2 uv = vec2(0.0) - vUV;
  uv.x = uv.x * -1.0;

  float sineWave = sin(uv.x * frequency) * amplitude * sin(time);


  float weight = sin(uv.y * -2.0) * 0.5 + 0.5;

  float stretchpoint = 1.0 - stretch;

  vec2 distort = vec2(0 , sineWave * weight);

  uv.x *= 1.0 - stretch;

  vec4 texColor = texture2D(tex, mod(uv + distort, 1.0));

  gl_FragColor = texColor;
}


