// Variáveis para as setas (Memória das fotos)
let imagensEsq = [];
let imagensDir = [];
let indexEsq = 0;
let indexDir = 0;

// --- 1. CONTAGEM REGRESSIVA ---

//Let é a variavel, targetDate é a funçao que faz o contador, getTime formata o número
let targetDate = new Date("2026-06-26T09:00:00").getTime(); 
//Aqui você guarda o "ID" do cronômetro dentro da variável que criou antes
let countdownInterval;


//Formata números menores que 10 com um zero à esquerda (ex: 9 vira 09)
let format = (n) => String(n).padStart(2, '0');


//Faz hoje - dia determinado.
function updateCountdown() {
  let now = new Date().getTime();
  let distance = targetDate - now;


  //Retorna quando inicia e remove outras coisas inúteis quando isso acontecer.
  if (distance <= 0) { 
    clearInterval(countdownInterval);
    let display = document.getElementById('countdown-display');
    if(display) display.innerHTML = `<p class="text-4xl font-bold text-green-600 p-4">EVENTO INICIADO!</p>`;
    let message = document.getElementById('countdown-message');
    if(message) message.classList.remove('hidden');
    return;
  }
    
  // Math.flor arrendonda os numeros e o distance usa segundos, minutos, horas, dias.
  let days = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((distance % (1000 * 60)) / 1000);

  //Formatação dos valores.
  let elDays = document.getElementById('days');
  if(elDays) {
      document.getElementById('days').textContent = format(days);
      document.getElementById('hours').textContent = format(hours);
      document.getElementById('minutes').textContent = format(minutes);
      document.getElementById('seconds').textContent = format(seconds);
  }
}

//Retoma
countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// --- 2. CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDwXLM9DBX6wXCwlOF0fjAdnoH0I3OeB4k",
    databaseURL: "https://ourofinosite-b5cc9-default-rtdb.firebaseio.com",
    projectId:"ourofinosite-b5cc9",
    storageBucket: "ourofinosite-b5cc9.firebasestorage.app", // Adicionado para funcionar as imagens
    appId:  "1:615972474038:web:4c3f5a306acf9354fd6a17"
};



// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

// --- 4. LÓGICA DO CARROSSEL (SETAS) ---

// Ouve as imagens da ESQUERDA
database.ref('configuracao_site/imagens/esquerda').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        imagensEsq = Object.values(data).reverse(); // Foto nova primeiro
        indexEsq = 0;
        atualizarFotoNaTela('imagem-esquerda', imagensEsq, indexEsq);
    }
});

// Ouve as imagens da DIREITA
database.ref('configuracao_site/imagens/direita').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        imagensDir = Object.values(data).reverse();
        indexDir = 0;
        atualizarFotoNaTela('imagem-direita', imagensDir, indexDir);
    }
});

function atualizarFotoNaTela(idElemento, lista, index) {
    const imgEl = document.getElementById(idElemento);
    if (imgEl && lista.length > 0) {
        imgEl.src = lista[index];
    }
}

// Funções chamadas pelos botões HTML
function mudarEsquerda(direcao) {
    if (imagensEsq.length === 0) return;
    indexEsq += direcao;
    if (indexEsq >= imagensEsq.length) indexEsq = 0;
    if (indexEsq < 0) indexEsq = imagensEsq.length - 1;
    atualizarFotoNaTela('imagem-esquerda', imagensEsq, indexEsq);
}

function mudarDireita(direcao) {
    if (imagensDir.length === 0) return;
    indexDir += direcao;
    if (indexDir >= imagensDir.length) indexDir = 0;
    if (indexDir < 0) indexDir = imagensDir.length - 1;
    atualizarFotoNaTela('imagem-direita', imagensDir, indexDir);
}
// --- 4. FUNÇÕES DO PAINEL ADMIN ---

function abrirPainel() {
    let senha = prompt("Digite a senha para acessar:");
    if (senha === "1914") { 
        document.getElementById('painel-admin').style.display = 'block';
    } else {
        alert("Senha incorreta!");
    }
}
 
// --- 1. REFERÊNCIAS E OUVINTES (LEITURA) ---

// Criamos o caminho para as duas pastas no banco
const refEsquerda = firebase.database().ref('configuracao_site/imagens/esquerda');
const refDireita = firebase.database().ref('configuracao_site/imagens/direita');

// .limitToLast(5): É o filtro. Diz ao Firebase: "Só me mande as 5 fotos mais novas"
// .on('value'): É o "ouvinte". Sempre que algo mudar no banco, ele avisa aqui.
refEsquerda.limitToLast(3).on('value', (snapshot) => {
    const fotos = snapshot.val(); // snapshot.val() pega os dados reais (as URLs)
    if (fotos) atualizarInterfaceCarrossel('container-esquerda', fotos);
});

refDireita.limitToLast(3).on('value', (snapshot) => {
    const fotos = snapshot.val();
    if (fotos) atualizarInterfaceCarrossel('container-direita', fotos);
});

    
// --- 2. FUNÇÃO DE UPLOAD (AÇÃO) ---

// --- NOVA FUNÇÃO DE UPLOAD (SEM USAR STORAGE / SEM PEDIR UPGRADE) ---
function processarUpload() {
    const arquivo = document.getElementById('input-arquivo').files[0];
    const lado = document.getElementById('lado-escolhido').value; 

    if (!arquivo) return alert("Selecione uma imagem!");

    const btn = document.querySelector('#painel-admin button:first-child');
    const textoOriginal = btn.innerText;
    btn.innerText = "Processando...";
    btn.disabled = true;

    // LER O ARQUIVO NO CELULAR/PC
    const reader = new FileReader();
    reader.readAsDataURL(arquivo);
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            // --- DIMINUIR A FOTO (COMPRESSÃO) ---
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; // Largura suficiente para o quadro de anúncios
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Transforma em JPEG leve (qualidade 0.6)
            const fotoComprimidaBase64 = canvas.toDataURL('image/jpeg', 0.6);

            // --- ENVIAR DIRETO PARA O DATABASE ---
            // Usamos .push() para manter um histórico ou .set() para substituir a atual
            database.ref(`configuracao_site/imagens/${lado}`).push(fotoComprimidaBase64)
                .then(() => {
                    alert(`✅ Publicado com sucesso no lado ${lado}!`);
                    document.getElementById('painel-admin').style.display = 'none';
                })
                .catch(error => {
                    console.error(error);
                    alert("❌ Erro ao salvar no banco.");
                })
                .finally(() => {
                    btn.innerText = textoOriginal;
                    btn.disabled = false;
                });
        };
    };
}
// --- 3. ATUALIZAÇÃO DA TELA (VISUAL) ---

function atualizarInterfaceCarrossel(idContainer, fotos) {
    const container = document.getElementById(idContainer);
    if (!container) return; // Segurança: se o container não existir no HTML, não faz nada
    
    // .innerHTML = "": Isso "apaga" o que tinha antes. 
    // Essencial para o limite de 5 funcionar visualmente.
    container.innerHTML = ""; 

    // Object.values(fotos): Transforma o objeto bagunçado do Firebase em uma lista [URL, URL...]
    Object.values(fotos).forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.className = "foto-carrossel"; // Você pode estilizar isso no CSS
        container.appendChild(img); // Adiciona a foto na tela
    });
}

// --- 5. SINCRONIZAÇÃO EM TEMPO REAL ---
// Isso faz o site carregar as imagens salvas no Firebase automaticamente
window.addEventListener('load', () => {
    
    // Ouve as imagens da ESQUERDA
    database.ref('configuracao_site/imagens/esquerda').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Converte o objeto do firebase em lista
            const listaUrls = Object.values(data);
            imagensEsq = listaUrls.reverse(); // As mais novas aparecem primeiro
            indexEsq = 0;
            document.getElementById("imagem-esquerda").src = imagensEsq[0];
        }
    });

    // Ouve as imagens da DIREITA
    database.ref('configuracao_site/imagens/direita').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const listaUrls = Object.values(data);
            imagensDir = listaUrls.reverse();
            indexDir = 0;
            document.getElementById("imagem-direita").src = imagensDir[0];
        }
    });
});

// --- 6. FORMULÁRIO DE PEDIDOS ---


// O evento 'submit' acontece quando a pessoa clica no botão de enviar ou aperta Enter
document.getElementById('form-pedidos').addEventListener('submit', async function(e) {
    
    // e.preventDefault() evita que a página recarregue. 
    // Sem isso, o JS morre antes de conseguir enviar os dados.
    e.preventDefault();

    //  CAPTURA DOS DADOS 
    // Assim, o JS lê o que está escrito no exato momento do clique

    // Selecionamos o botão que foi clicado através do 'e.target' (o formulário)
   
    // Guardamos o texto "Enviar Pedido" para devolver ao botão no final
    const nome = document.getElementById('nome-solicitante').value;
    const lista = document.getElementById('lista-itens').value;
    const btn = e.target.querySelector('button');
    const textoOriginal = btn.innerText;


    
    
    // O link do Google Apps Script que criamos no item 2
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxcGyNYNExyjvyRb1ZFUwnlbNtEGsJ5MkV26rKYfztI33bEUCL3qRqLxiG8l-N20il6jQ/exec'; 

    // BLOQUEIO DE SEGURANÇA: Muda o visual para o usuário não clicar duas vezes
    btn.disabled = true; 
    btn.innerText = "Enviando... aguarde";

    // O bloco 'try' tenta executar o código. Se algo falhar, ele pula para o 'catch'
    try {
        // FETCH: O "entregador". Ele leva os dados até o endereço (scriptURL)
        // await: Diz ao JS para esperar o entregador chegar lá antes de continuar
        const response = await fetch(scriptURL, {
            // POST: Método de envio (como colocar uma carta no correio)
            method: 'POST', 
            
            // mode 'no-cors': Um ajuste para o Google não bloquear a entrega por segurança
            mode: 'no-cors', 
            
            // BODY: É o conteúdo da caixa. 
            // JSON.stringify: Converte seu objeto {nome, lista} em TEXTO, pois a internet só transporta texto
            body: JSON.stringify({ 
                nome: document.getElementById('nome-solicitante').value, 
                lista: document.getElementById('lista-itens').value 
            }),
        });

        // Se o código chegou aqui, significa que a "viagem" do fetch deu certo
        alert("✅ Enviado! O pedido chegou na planilha da congregação.");
        
        // .reset() limpa todos os campos do formulário automaticamente
        document.getElementById('form-pedidos').reset();

    } catch (error) {
        // CATCH: O "escudo". Se a internet cair ou o link estiver quebrado, o erro cai aqui
        console.error('Detalhe do erro:', error);
        
        // Avisa ao usuário que houve um problema REAL de conexão
        alert("❌ Erro de conexão! Verifique seu Wi-Fi ou dados móveis.");
        
    } finally {
        // FINALLY: A "limpeza". Ele roda dando certo ou dando errado.
        // Aqui devolvemos o botão ao estado original para a pessoa tentar de novo
        btn.disabled = false;
        btn.innerText = textoOriginal;
    }

});

