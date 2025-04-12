var height = 6;
var width = 5; 

var row = 0;
var col = 0; 

var gameOver = false;

var wordList;
var word = "";

// URL raw do Gist com a lista de palavras
var GIST_URL = 'https://gist.githubusercontent.com/vncsmnl/25e7c165da276405af8ca4e1c8e17806/raw/bd238615c9089721a16418289589961490d0cf65/wordlist';

window.onload = function () {
    carregarListaPalavras(GIST_URL)
        .then(lista => {
            wordList = lista;
            iniciarJogo();
        })
        .catch(erro => {
            console.error('Erro ao carregar a lista de palavras:', erro);
        });
}

function carregarListaPalavras(gistURL) {
    return fetch(gistURL)
        .then(response => response.text())
        .then(text => text.split('\n').filter(palavra => palavra.trim() !== ''));
}

function iniciarJogo() {
    word = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
    console.log(word);
    intialize();
}


function intialize() {

    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            let tile = document.createElement("span");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            tile.innerText = "";
            document.getElementById("board").appendChild(tile);
        }
    }

    let keyboard = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ç"],
        ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
    ];

    for (let i = 0; i < keyboard.length; i++) {
        let currRow = keyboard[i];
        let keyboardRow = document.createElement("div");
        keyboardRow.classList.add("keyboard-row");

        for (let j = 0; j < currRow.length; j++) {
            let keyTile = document.createElement("div");

            let key = currRow[j];
            keyTile.innerText = key;
            if (key == "Enter") {
                keyTile.id = "Enter";
            }
            else if (key == "⌫") {
                keyTile.id = "Backspace";
            }
            else if ("A" <= key && key <= "Z") {
                keyTile.id = "Key" + key;
            }

            keyTile.addEventListener("click", processKey);

            if (key == "Enter") {
                keyTile.classList.add("enter-key-tile");
            } else {
                keyTile.classList.add("key-tile");
            }
            keyboardRow.appendChild(keyTile);
        }
        document.body.appendChild(keyboardRow);
    }

    document.addEventListener("keyup", (e) => {
        processInput(e);
    })
}

function processKey() {
    e = { "code": this.id };
    processInput(e);
}

function removerAcentos(palavra) {
    return palavra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function validarPalavra(palavra) {
    const palavraSemAcentos = removerAcentos(palavra);
    const palavraUpperCase = palavraSemAcentos.toUpperCase();
    return wordList.some(item => {
        const itemSemAcentos = removerAcentos(item);
        return itemSemAcentos.toUpperCase() === palavraUpperCase;
    });
}

function processInput(e) {
    if (gameOver) return;

    if (("KeyA" <= e.code && e.code <= "KeyZ") || e.code == "KeyÇ") {
        if (col < width) {
            let currTile = document.getElementById(row.toString() + '-' + col.toString());
            if (currTile.innerText == "") {
                currTile.innerText = e.code == "KeyÇ" ? "Ç" : e.code[3];
                col += 1;
            }
        }
    }

    else if (e.code == "Backspace") {
        if (0 < col && col <= width) {
            col -= 1;
        }
        let currTile = document.getElementById(row.toString() + '-' + col.toString());
        currTile.innerText = "";
    }

    else if (e.code == "KeyÇ") {
        if (col < width) {
            let currTile = document.getElementById(row.toString() + '-' + col.toString());
            if (currTile.innerText == "") {
                currTile.innerText = "Ç";
                col += 1;
            }
        }
    }

    else if (e.code == "Enter") {
        let guess = "";
        for (let c = 0; c < width; c++) {
            let currTile = document.getElementById(row.toString() + '-' + c.toString());
            let letter = currTile.innerText;
            guess += letter;
        }

        if (validarPalavra(guess)) {
            update();
        } else {
            alert('Palavra inválida!');
        }
    }

    if (!gameOver && row == height) {
        gameOver = true;
        document.getElementById("answer").innerText = word;
        setTimeout(function () {
            window.location.reload(false);
        }, 2000);
    }
}

function update() {
    let guess = "";
    document.getElementById("answer").innerText = "";

    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;
        guess += letter;
    }

    guess = guess.toLowerCase();
    console.log(guess);

    let correct = 0;

    let letterCount = {}; 
    for (let i = 0; i < word.length; i++) {
        let letter = word[i];

        if (letterCount[letter]) {
            letterCount[letter] += 1;
        }
        else {
            letterCount[letter] = 1;
        }
    }

    console.log(letterCount);

    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        if (word[c] == letter) {
            currTile.classList.add("correct");

            let keyTile = document.getElementById("Key" + letter);
            keyTile.classList.remove("present");
            keyTile.classList.add("correct");

            correct += 1;
            letterCount[letter] -= 1
        }

        if (correct == width) {
            gameOver = true;
            setTimeout(function () {
                window.location.reload(false);
            }, 2000);
        }
    }

    console.log(letterCount);
    for (let c = 0; c < width; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        let letter = currTile.innerText;

        if (!currTile.classList.contains("correct")) {

            if (word.includes(letter) && letterCount[letter] > 0) {
                currTile.classList.add("present");

                let keyTile = document.getElementById("Key" + letter);
                if (!keyTile.classList.contains("correct")) {
                    keyTile.classList.add("present");
                }
                letterCount[letter] -= 1;
            }
            else {
                currTile.classList.add("absent");
                let keyTile = document.getElementById("Key" + letter);
                keyTile.classList.add("absent")
            }
        }
    }

    row += 1;
    col = 0;
}