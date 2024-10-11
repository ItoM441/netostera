let stars = [];
let connections = [];
let selectedStars = [];
let isDragging = false;
let zoom = 1;
let zoomOriginX = 0;
let zoomOriginY = 0;
let panning = false;
let panStartX = 0;
let panStartY = 0;
let offsetX = 0;
let offsetY = 0;
let connectedAlphabets = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  
  
  for (let i = 0; i < 26; i++) {
    stars.push({
      pos: createVector(random(width), random(height)),
      blink: random(30),
      label: String.fromCharCode(65 + i) // AからZのラベルを付ける
    });
  }
}

function draw() {
  background(0);
  translate(offsetX, offsetY);
  translate(zoomOriginX, zoomOriginY);
  scale(zoom);

  
  strokeWeight(1);
  for (let conn of connections) {
    stroke(255, map(sin(frameCount * 0.1 + conn.blink), -1, 1, 100, 255));
    line(conn.start.pos.x, conn.start.pos.y, conn.end.pos.x, conn.end.pos.y);
  }

  // 星を描画
  noStroke();
  textAlign(CENTER, CENTER);
  for (let star of stars) {
    fill(255, map(sin(frameCount * 0.1 + star.blink), -1, 1, 180, 255));
    ellipse(star.pos.x, star.pos.y, 8, 8);
    fill(255);
    text(star.label, star.pos.x, star.pos.y - 12); // ラベルを描画
  }

  // ドラッグ中の線を描画
  if (isDragging && selectedStars.length > 0) {
    stroke(255, 150);
    let lastStar = selectedStars[selectedStars.length - 1];
    line(lastStar.pos.x, lastStar.pos.y, (mouseX - offsetX - zoomOriginX) / zoom, (mouseY - offsetY - zoomOriginY) / zoom);
  }
}

function mousePressed() {
  if (keyIsPressed && key === ' ') {
    panning = true;
    panStartX = mouseX - offsetX;
    panStartY = mouseY - offsetY;
  } else {
    let closestStar = getClosestStar();
    if (closestStar) {
      if (mouseButton === LEFT) {
        selectedStars.push(closestStar);
        isDragging = true;
      } else if (mouseButton === RIGHT) {
        removeClosestConnection(); // 右クリックで一番近い線を削除
        return false; // 右クリックのデフォルトメニューを無効化
      }
    }
  }
}

function mouseDragged() {
  if (panning) {
    offsetX = mouseX - panStartX;
    offsetY = mouseY - panStartY;
  }
}

function mouseReleased() {
  if (panning) {
    panning = false;
  } else if (mouseButton === LEFT && isDragging) {
    let closestStar = getClosestStar();
    if (closestStar && selectedStars[selectedStars.length - 1] !== closestStar) {
      let lastStar = selectedStars[selectedStars.length - 1];
      let newStar = closestStar;
      let blink = random(30);
      connections.push({
        start: lastStar,
        end: newStar,
        blink: blink
      });
      lastStar.blink = blink;
      newStar.blink = blink;
      let connectionStr = lastStar.label + newStar.label;
      connectedAlphabets.push(connectionStr); 

      
      if (connectedAlphabets.join("").toLowerCase() == 'nootte') {
        // window.open("https://note.com/nullfulness", "_blank");
        window.location.href = "https://note.com/nullfulness";
      } 
      else if (connectedAlphabets.join("").toLowerCase() == 'yoou'){
        window.open("https://www.youtube.com/", "_blank"); 
      }
    }
    isDragging = false;
  } else if (mouseButton === RIGHT) {
    return false;
  }
}

function mouseWheel(event) {
  const zoomFactor = event.delta > 0 ? 1 / 1.05 : 1.05;
  const newZoom = zoom * zoomFactor;
  const mouseXTransformed = (mouseX - offsetX - zoomOriginX) / zoom;
  const mouseYTransformed = (mouseY - offsetY - zoomOriginY) / zoom;

  zoomOriginX = mouseX - mouseXTransformed * newZoom - offsetX;
  zoomOriginY = mouseY - mouseYTransformed * newZoom - offsetY;
  zoom = newZoom;

  return false; // デフォルトのスクロール動作を無効化
}

function getClosestStar() {
  let closestStar = null;
  let closestDist = 20 / zoom; // クリックされた星の許容範囲
  for (let star of stars) {
    let d = dist((mouseX - offsetX - zoomOriginX) / zoom, (mouseY - offsetY - zoomOriginY) / zoom, star.pos.x, star.pos.y);
    if (d < closestDist) {
      closestStar = star;
      closestDist = d;
    }
  }
  return closestStar;
}

function removeClosestConnection() {
  let closestConn = null;
  let closestDist = 10 / zoom; // 削除する線の許容範囲
  for (let conn of connections) {
    let lineDist = distToSegment(createVector((mouseX - offsetX - zoomOriginX) / zoom, (mouseY - offsetY - zoomOriginY) / zoom), conn.start.pos, conn.end.pos);
    if (lineDist < closestDist) {
      closestConn = conn;
      closestDist = lineDist;
    }
  }
  if (closestConn) connections.splice(connections.indexOf(closestConn), 1);
}

function distToSegment(p, v, w) {
  const l2 = distSq(v, w);
  if (l2 === 0) return dist(p.x, p.y, v.x, v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = max(0, min(1, t));
  return dist(p.x, p.y, v.x + t * (w.x - v.x), v.y + t * (w.y - v.y));
}

function distSq(v, w) {
  return (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
}

function mouseClicked() {
  let closestConn = null;
  let closestDist = 10 / zoom;
  for (let conn of connections) {
    let lineDist = distToSegment(createVector((mouseX - offsetX - zoomOriginX) / zoom, (mouseY - offsetY - zoomOriginY) / zoom), conn.start.pos, conn.end.pos);
    if (lineDist < closestDist) {
      closestConn = conn;
      closestDist = lineDist;
    }
  }
  // if (closestConn) window.open(closestConn.url, '_blank');
  console.log(connectedAlphabets);
}
