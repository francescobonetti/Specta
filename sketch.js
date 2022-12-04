let myShader;
let img;
let noiseImg;
let video;
let clicked = false; //variabile che attiva o disattiva la distorsione dell'immagine (corrisponde all'alzare o abbassare il dispositivo che abbiamo pensato). Con un click diventa true, con il successivo false e così via
let stretch = 0; //variabile che va da 0 a 1, che passata allo shader determina lo stretch
let stretchcounter = 0; //come un framecount ma solo per determinare la durata dell'animazione di stretch
let distortcounter = 0; //come un framecount ma solo per determinare la durata dell'animazione di distorsione sinusoidale
let ineasing = 0.01;
let outeasing = 0.02;

let freq = 0;
let amp = 0;
let xpos = 0;
let yAngleArray = [];

//variabili arduino
let serial;
let latestData = "waiting for data";

function preload() {
  myShader = loadShader("shader/shader.vert", "shader/shader.frag");
  video = createVideo(["News.mp4"], vidLoad);
  //video = loadImage('img.jpg');
  noiseImg = loadImage("noiseTexture.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  video.hide(); //nasconde il video, altrimenti p5 lo mostrerebbe sotto

  shader(myShader);

  myShader.setUniform("tex", video);
  myShader.setUniform("noiseTex", noiseImg);
  myShader.setUniform("screenWidth", width);
  myShader.setUniform("screenHeight", height);

  noStroke();

  //porta seriale
  serial = new p5.SerialPort();

  serial.list();
  //porta d'ingrsso arduino, da cambiare per ogni porta usb
  serial.open("COM7");

  serial.on("connected", serverConnected);

  serial.on("list", gotList);

  serial.on("data", gotData);

  serial.on("error", gotError);

  serial.on("open", gotOpen);

  serial.on("close", gotClose);
}

//arduino
function serverConnected() {
  print("Connected to Server");
}

function gotList(thelist) {
  print("List of Serial Ports:");

  for (let i = 0; i < thelist.length; i++) {
    print(i + " " + thelist[i]);
  }
}

function gotOpen() {
  print("Serial Port is Open");
}

function gotClose() {
  print("Serial Port is Closed");
  latestData = "Serial Port is Closed";
}

function gotError(theerror) {
  print(theerror);
}

function gotData() {
  let currentString = serial.readLine();
  trim(currentString);
  if (!currentString) return;
  latestData = currentString;
}

function vidLoad() {
  video.loop();
  video.volume(0);
}

function keyPressed()  {
  //cambia la variabile clicked
  if (key == ' '){
    if (clicked == false) {
    clicked = true;
    } else {
    clicked = false;
    } 
  }
}

function draw() {
  let goalfreq; //frequenza che l'onda deve raggiungere quando clicco
  let goalamp; //stesso ma per l'altezza (amplitude) dell'onda

  const angleArray = latestData.split(" ");

  let myAngleX = +angleArray[0];
  let myAngleY = +angleArray[1];
  let myAngleZ = +angleArray[2];
  

  let amplitudeAngle = -myAngleX
  let xposangle = myAngleY

  


  if (clicked == true) {
    //accensione dispositivo
    stretchcounter = stretchcounter + 1; //aumento del tempo di stretch
    stretch = stretchcounter * 0.005; //con esso aumenta anche la variabile stretch, finchè non arriva a 1

    if (stretch > 1) {
      //solo dopo che l'immagine è totalmente stretchata, esegui

      stretch = 1;
      stretchcounter = stretch / 0.005; //fa si che il counter non continui ma rimanga fisso al valore che porta allo stretch massimo (1/0.005 = 200)

      distortcounter += 0.005; //ora che l'immagine è stretchata, parte il counter di tempo della distorsione sinusoidale

      goalfreq = 1.5 * sin(frameCount * 0.001) + 3
      //goalfreq = map(frequencyAngle, 0, 180, 3.0, 5.0); //la frequenza a cui arrivare dipende dalla mouseY
      goalamp = map(amplitudeAngle, -90, 90, -0.8, 0.8, true); //l'altezza a cui arrivare dipende dalla mouseX
      //goalamp = map(mouseX, 0, width, 0.05, 0.5);
      //goalfreq = map(mouseY, 0, height, 5.0, 10.0);
      goalxpos = map(xposangle, -90, 90, -10.0, 10.0, true)
      

      let d_freq = goalfreq - freq;
      freq += d_freq * ineasing;

      let d_amp = goalamp - amp;
      amp += d_amp * ineasing;

      let d_xpos = goalxpos - xpos;
      xpos += d_xpos * ineasing;

      myShader.setUniform("frequency", freq);
      myShader.setUniform("amplitude", amp);
      myShader.setUniform("xpos", xpos);

      if (distortcounter > 1) {
        distortcounter = 1;
      }
    }
  } else if (clicked == false) {
    //spegnimento dispositivo

    distortcounter -= 0.005; //diminuisce fino ad arrivare a 0 per diminuire la distorsione sinusoidale

    goalfreq = 0;
    goalamp = 0;

    let d_freq = goalfreq - freq;
    freq += d_freq * outeasing;

    let d_amp = goalamp - amp;
    amp += d_amp * outeasing;

    myShader.setUniform("frequency", freq);
    myShader.setUniform("amplitude", amp);

    if (distortcounter < 0.2) {
      //quando la distorsione è finita, esegui
      distortcounter = 0;

      if (stretch != 0) {
        //destretcha fino a che non torna alla situazione iniziale
        stretchcounter -= 1;
        stretch = stretchcounter * 0.005;
      }

      if (stretch < 0) {
        stretch = 0;
      }
    }
  }

  myShader.setUniform("stretch", stretch);
  myShader.setUniform("time", frameCount * 0.001);
  myShader.setUniform("distortcounter", distortcounter);

  rect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
