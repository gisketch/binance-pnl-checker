"use strict";

///------- COINS CLASSES --------///

class Coin {
  constructor(symbol, orderPrice, prevDay, price) {
    this.symbol = symbol;
    this.orderPrice = orderPrice;
    this.prevDay = prevDay;
    this.price = price;

    this._setPnl();
  }

  _setPnl() {
    this.pnl = ((this.price - this.orderPrice) / this.orderPrice) * 100;
  }
}

///-------ARCHITECTURE--------///
const pnlContainer = document.querySelector(".pnl-container");
const addCoin = document.querySelector(".btn");
const inputSymbol = document.querySelector(".input-symbol");
const inputOrder = document.querySelector(".order-price");
let coin;

class App {
  #coins = [];

  constructor() {
    this._renderCoin;

    addCoin.addEventListener("click", this._newCoin.bind(this));

    this._loadAllCoins(this.#coins);
  }

  _newCoin(e) {
    e.preventDefault();

    const coinSymbol = inputSymbol.value;
    const coinOrder = +inputOrder.value;

    coin = new Coin(coinSymbol, coinOrder, 2.456, 3.569);

    this.#coins.push(coin);
    this._renderCoin(coin);
  }

  _renderCoin(coin) {
    let html = `
        <div class="coin">
          <div class="icon">+</div>
          <div class="coin-details">
            <span class="coin-name">${coin.symbol}</span>
            <span class="order-price">${coin.orderPrice}</span>
            <span class="prev-price">${coin.prevDay}</span>
            <span class="price">${coin.price}</span>
            <span class="${coin.pnl > 0 ? "gain" : "loss"}">${coin.pnl}%</span>
          </div>
        </div>`;

    pnlContainer.insertAdjacentHTML("afterbegin", html);
  }

  _loadAllCoins(coinsArr) {
    coinsArr.forEach((coin) => {
      this._renderCoin(coin);
    });
  }
}

const app = new App();

fetch("https://api.binance.com/api/v3/ticker/price?symbol=btcusdt ")
  .then((res) => res.json())
  .then((res) => console.log(res));
