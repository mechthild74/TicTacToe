let fields = [
    null,
    'circle',
    null,
    null,
    'cross',
    null,
    null,
    null
];

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
        if (fields[index] === 'circle') {
          symbol = 'o';
        } else if (fields[index] === 'cross') {
          symbol = 'x';
        }
        html += `<td>${symbol}</td>`;
      }
      html += '</tr>';
    }
    
    html += '</table>';
    document.getElementById('content').innerHTML = html;
  }
