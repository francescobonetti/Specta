let myShader;
let myVideo;
let clicked = false; //variabile che attiva o disattiva la distorsione dell'immagine (corrisponde all'alzare o abbassare il dispositivo che abbiamo pensato). Con un click diventa true, con il successivo false e così via
let stretch = 0; //variabile che va da 0 a 1, che passata allo shader determina lo stretch
let stretchcounter = 0; //come un framecount ma solo per determinare la durata dell'animazione di stretch
let distortcounter = 0; //come un framecount ma solo per determinare la durata dell'animazione di distorsione sinusoidale


let freq = 0;
let amp = 0;


function preload() {
  myShader = loadShader('shader/shader.vert', 'shader/shader.frag')
  myVideo = createVideo(
    ['News.mp4'],
    vidLoad
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  myVideo.hide() //nasconde il video, altrimenti p5 lo mostrerebbe sotto

  shader(myShader);
  
  myShader.setUniform('tex', myVideo); 

  noStroke();
}

function vidLoad() {
  myVideo.loop();
  myVideo.volume(0)
}

function mouseClicked() { //cambia la variabile clicked
  
  if(clicked == false) { 
    clicked = true;
  } else {clicked = false}
}

function draw() {
  
  let goalfreq; //frequenza che l'onda deve raggiungere quando clicco. Mi serve a non fare uno stacco netto ma usare un lerp per arrivarci
  let goalamp;  //stesso ma per l'altezza (amplitude) dell'onda

  if (clicked == true) { //accensione dispositivo
      stretchcounter = stretchcounter + 1; //aumento del tempo di stretch
      stretch = stretchcounter * 0.005; //con esso aumenta anche la variabile stretch, finchè non arriva a 1

      if (stretch > 1) { //solo dopo che l'immagine è totalmente stretchata, esegui 

        stretch = 1;
        stretchcounter = stretch / 0.005 //fa si che il counter non continui ma rimanga fisso al valore che porta allo stretch massimo (1/0.005 = 200)


        distortcounter += 0.005 //ora che l'immagine è stretchata, parte il counter di tempo della distorsione sinusoidale 

        goalfreq = map(mouseY, 0, height, 1.0, 5.0); //la frequenza a cui arrivare dipende dalla mouseY
        goalamp = map(mouseX, 0, width, 0.5, 1); //l'altezza a cui arrivare dipende dalla mouseX

        freq = lerp(0, goalfreq, distortcounter) //frequenza vera dell'olda che varia nel tempo sfruttando il counter (per evitare uno stacco netto)
        amp = lerp(0, goalamp, distortcounter) //frequenza vera dell'olda che varia nel tempo sfruttando il counter (per evitare uno stacco netto)

        myShader.setUniform('frequency', freq);
        myShader.setUniform('amplitude', amp);
        myShader.setUniform('time', stretchcounter * 0.005); //crea piccole variazioni per non tenere l'onda statica

        if (distortcounter > 1) {
          distortcounter = 1
        }
      }
 
  } else if (clicked ==false) { //spegnimento dispositivo

    distortcounter -= 0.005; //diminuisce fino ad arrivare a 0 per diminuire la distorsione sinusoidale

      let backfreq = lerp(0, freq, distortcounter); //ho dovuto creare una nuova variabile per il ritorno per non fare casini col lerp inserendo due volte freq. Comunque è un lerp che parte dalla frequenza attuale e va a 0
      let backamp = lerp(0, amp, distortcounter);  //stesso per l'altezza

      myShader.setUniform('frequency', backfreq);
      myShader.setUniform('amplitude', backamp);
      

    if (distortcounter < 0) { //quando la distorsione è finita, esegui
      distortcounter = 0;
      
      if(stretch != 0) { //destretcha fino a che non torna alla situazione iniziale
        stretchcounter -= 1;
        stretch = stretchcounter * 0.005;
      }

      if (stretch < 0) {
        stretch = 0
      }

    } 
      
  }

  myShader.setUniform('stretch', stretch);
  myShader.setUniform('time', frameCount * 0.001); 
  
  console.log(distortcounter)
  //console.log(stretch)
  //console.log(clicked)
  

  rect(0,0,width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}