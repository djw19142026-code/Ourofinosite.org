
const targetDate = new Date("2026-06-26T09:00:00").getTime(); 

// 2. Use setInterval para chamar a função a cada segundo

let countdownInterval;

function updateCountdown() {
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (distance <= 0) { // Use <= 0 para garantir que a condição seja atendida no momento exato ou depois
    clearInterval(countdownInterval);
    document.getElementById('countdown-display').innerHTML = `<p class="text-4xl font-bold text-green-600 p-4">EVENTO INICIADO!</p>`;
    document.getElementById('countdown-message').classList.remove('hidden');
    return;
  }
    
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById('days').textContent = format(days);
  document.getElementById('hours').textContent = format(hours);
  document.getElementById('minutes').textContent = format(minutes);
  document.getElementById('seconds').textContent = format(seconds);

}

// A função 'format' precisa ser definida antes de ser chamada em 'updateCountdown'
// A sintaxe da arrow function estava incorreta.
const format = (n) => String(n).padStart(2, '0');

// Inicia a atualização da contagem a cada segundo
countdownInterval = setInterval(updateCountdown, 1000);

// Atualiza os elementos na página imediatamente na carga
updateCountdown();