#ifdef GL_ES
precision mediump float;
#endif
  
precision highp float;

varying vec2 vUV;

uniform sampler2D tex;
uniform sampler2D noiseTex;

uniform float time;
uniform float distortcounter;
uniform float frequency;
uniform float amplitude;
uniform float xpos;
uniform float stretch;
uniform float screenWidth;
uniform float screenHeight;


vec4 debugValue(float value) {
  vec4 col;
  if (value < 0.0) {
    col = vec4(1.0, 0.0, 0.0, 1.0);
  } else if (value <= 1.0) {
    col =  vec4(vec3(value), 1.0);
  } else {
    col = vec4(0.0, 1.0, 0.0, 1.0);
  }

  return col;
}



void main() {
  // UV
  vec2 uv = vec2(vUV.x, 1.0 - vUV.y);


  // vec2 uv = vec2(0.0) - vUV;
  // uv.x = uv.x * -1.0;

  // float sineWave = sin(uv.x * frequency) * amplitude * sin(time);

  // float weight = sin(uv.y * -2.0) * 0.5 + 0.5;
  // float stretchpoint = 1.0 - stretch;

  // vec2 distort = vec2(0 , sineWave);
  // uv += distort;

  // Distort
  //float noise = texture2D(noiseTex, uv + 0.5 * sin(time)).r * texture2D(noiseTex, uv - 0.5 * sin(time)).r * 0.2 * distortcounter;
  float sineWave = sin(2.0 * uv.x * frequency - 0.5 * frequency + xpos) * amplitude - 1.5 *  sin(uv.x * frequency - 0.5) * amplitude; //+ amplitude; //* sin(time);
  vec2 distort = vec2(0, sineWave);

  uv += distort;
  
  // uv += noise * amplitude;

  // Stretch
  float powerExp = 4.0 * (1.0 - stretch) + 1.0;
  uv.x = uv.x - pow(uv.x * 0.5, powerExp) * 2.0;

  // Mirror repeat
  uv = abs(mod(uv * 1.0 + 1.0, 2.0) - 1.0);


  // gl_FragColor = debugValue(uv.x);
  gl_FragColor = texture2D(tex, uv);
  // gl_FragColor = debugValue(noise);

}


