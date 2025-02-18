let fields = [
  null, null, null,
  null, null, null,
  null, null, null
];

let currentPlayer = "circle"; // Start: Kreis
let gameOver = false;         // Flag, ob das Spiel vorbei ist

function init() {
  render();
}

function render() {
  let html = '<table>';
  
  for (let row = 0; row < 3; row++) {
    html += '<tr>';
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      let symbol = '';
      let onclickAttr = '';
      
      // Falls bereits ein Symbol gesetzt ist, wird der entsprechende SVG-Code eingefügt
      if (fields[index] === 'circle') {
        symbol = generateCircle();
      } else if (fields[index] === 'cross') {
        symbol = generateCross();
      } else if (!gameOver) {
        // Bei leerem Feld und solange das Spiel nicht vorbei ist, 
        // füge ein onclick-Attribut hinzu, das handleCellClick() aufruft.
        onclickAttr = ` onclick="handleCellClick(${index}, this)"`;
      }
      
      html += `<td${onclickAttr}>${symbol}</td>`;
    }
    html += '</tr>';
  }
  
  html += '</table>';
  document.getElementById('content').innerHTML = html;
}

function handleCellClick(index, cell) {
  // Wenn das Spiel vorbei ist oder das Feld bereits belegt ist, tue nichts
  if (gameOver || fields[index] !== null) return;

  // Setze den aktuellen Spielzug im Array
  fields[index] = currentPlayer;
  
  // Aktualisiere den Inhalt des angeklickten Feldes mit dem entsprechenden SVG-Code
  if (currentPlayer === "circle") {
    cell.innerHTML = generateCircle();
    currentPlayer = "cross";
  } else {
    cell.innerHTML = generateCross();
    currentPlayer = "circle";
  }
  
  // Entferne den Klick-Handler, damit das Feld nicht erneut angeklickt werden kann
  cell.onclick = null;
  
  // Überprüfe, ob es einen Gewinner gibt
  const winCombo = checkGameOver();
  if (winCombo) {
    gameOver = true;
    drawWinningLine(winCombo);
  }
}

function checkGameOver() {
  // Alle möglichen Gewinnkombinationen (Zeilen, Spalten, Diagonalen)
  const winningCombos = [
    [0, 1, 2], // erste Zeile
    [3, 4, 5], // zweite Zeile
    [6, 7, 8], // dritte Zeile
    [0, 3, 6], // erste Spalte
    [1, 4, 7], // zweite Spalte
    [2, 5, 8], // dritte Spalte
    [0, 4, 8], // Diagonale \
    [2, 4, 6]  // Diagonale /
  ];
  
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (fields[a] && fields[a] === fields[b] && fields[a] === fields[c]) {
      return combo;
    }
  }
  
  return null;
}

function drawWinningLine(winCombo) {
  const table = document.querySelector('#content table');

  // Erstelle ein SVG-Overlay in Größe der Tabelle
  const svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgOverlay.setAttribute('width', table.offsetWidth);
  svgOverlay.setAttribute('height', table.offsetHeight);
  svgOverlay.style.position = 'absolute';
  svgOverlay.style.top = table.offsetTop + 'px';
  svgOverlay.style.left = table.offsetLeft + 'px';
  svgOverlay.style.pointerEvents = 'none'; // Klicks sollen weiter durchgehen

  // Bestimme Mittelpunkte der ersten und letzten Zelle der Gewinnkombination
  const { x: startX, y: startY } = getCellCenter(winCombo[0]);
  const { x: endX,   y: endY   } = getCellCenter(winCombo[2]);

  // Wir möchten die Linie an beiden Enden ein wenig verlängern
  let x1 = startX;
  let y1 = startY;
  let x2 = endX;
  let y2 = endY;

  // Länge und Richtung der Linie bestimmen
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Wie weit soll die Linie über die Zellmitte hinausragen?
  // Probier mal 20px oder 25px; passe nach Geschmack an.
  const extension = 20;

  if (length > 0) {
    // Normalisierter Richtungsvektor
    const ux = dx / length;
    const uy = dy / length;

    // Anfang zurückversetzen
    x1 -= extension * ux;
    y1 -= extension * uy;
    // Ende weiter nach vorne versetzen
    x2 += extension * ux;
    y2 += extension * uy;
  }

  // Erstelle die Linie
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', 'white');
  line.setAttribute('stroke-width', '10');
  line.setAttribute('stroke-linecap', 'round');

  svgOverlay.appendChild(line);

  // Füge das Overlay in den Container ein
  document.getElementById('content').appendChild(svgOverlay);
}

/**
 * Ermittelt den Mittelpunkt einer bestimmten Zelle (cellIndex)
 * relativ zur Tabelle (nicht zum gesamten Browserfenster).
 */
function getCellCenter(cellIndex) {
  const table = document.querySelector('#content table');
  const allCells = table.querySelectorAll('td');
  const cell = allCells[cellIndex];

  // Position & Größe der Tabelle und der konkreten Zelle
  const tableRect = table.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();

  // Mittelpunkt der Zelle relativ zur Tabelle
  const centerX = cellRect.x + cellRect.width / 2 - tableRect.x;
  const centerY = cellRect.y + cellRect.height / 2 - tableRect.y;

  return { x: centerX, y: centerY };
}


function generateCircle() {
  const radius = 27.5; // Damit der Stroke (10px) vollständig im 70x70-Container liegt
  const circumference = 2 * Math.PI * radius;

  return `
    <svg width="70" height="70" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
      <circle 
        cx="35" 
        cy="35" 
        r="${radius}" 
        fill="none" 
        stroke="#00B0EF" 
        stroke-width="10"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${circumference}"
      >
        <animate 
          attributeName="stroke-dashoffset" 
          from="${circumference}" 
          to="0" 
          dur="0.5s" 
          fill="freeze" 
        />
      </circle>
    </svg>
  `;
}

function generateCross() {
  const lineLength = 55 * Math.SQRT2; // Länge der Diagonalen

  return `
    <svg width="70" height="70" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
      <!-- Diagonale von links oben nach rechts unten -->
      <line x1="7.5" y1="7.5" x2="62.5" y2="62.5" 
            stroke="#FFC000" stroke-width="15" stroke-linecap="round"
            stroke-dasharray="${lineLength}" stroke-dashoffset="${lineLength}">
        <animate attributeName="stroke-dashoffset"
                 from="${lineLength}" to="0"
                 dur="0.5s" fill="freeze" />
      </line>
      <!-- Diagonale von rechts oben nach links unten -->
      <line x1="62.5" y1="7.5" x2="7.5" y2="62.5" 
            stroke="#FFC000" stroke-width="15" stroke-linecap="round"
            stroke-dasharray="${lineLength}" stroke-dashoffset="${lineLength}">
        <animate attributeName="stroke-dashoffset"
                 from="${lineLength}" to="0"
                 dur="0.5s" fill="freeze" />
      </line>
    </svg>
  `;
}
