"use strict";

/// ------- UNIQUE ID ----------///

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

///------- COINS CLASSES --------///

class Coin {
  constructor(symbol, orderPrice, orderCurrency) {
    this.symbol = symbol.toUpperCase();
    this.orderPrice = orderPrice; //price when bought
    this.orderCurrency = orderCurrency.toFixed(2); //price when bought
    this.coinId = "a";
  }
}

///-------ARCHITECTURE--------///
const pnlContainer = document.querySelector(".pnl-container");
const addCoin = document.querySelector(".btn");
const inputSymbol = document.querySelector(".input-symbol");
const inputOrder = document.querySelector(".input-order-price");
const inputOrderCurrency = document.querySelector(".input-order-currency");
let coin;

class App {
  //TODO: find a way to save pushed coins to this array to load on startup
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
    const coinOrderCurrency = +inputOrderCurrency.value;

    coin = new Coin(coinSymbol, coinOrder, coinOrderCurrency); //PLACEHOLDER prevday and price
    this.#coins.push(coin); //push to coins array
    this._renderCoin(coin);
  }

  _renderCoin(coin) {
    let html = `
        <div class="coin">
          <div class="icon">+</div>
          <div class="coin-details">
            <div class="coin-detail-1">
              <span class="coin-name">${coin.symbol.toUpperCase()}</span>
              <span class="order-price">${coin.orderPrice}</span>
              <span class="order-currency">${coin.orderCurrency}</span>
            </div>

            <div class="coin-detail-2">
              <span id="${coin.coinId}" class="price">Loading...</span>
              <span id="coin-pnl" class="${
                coin.pnl > 0 ? "gain" : "loss"
              }">Loading...</span>
              <span id="currency-pnl">Loading...</span>
            </div>
          </div>
        </div>`;

    pnlContainer.insertAdjacentHTML("afterbegin", html);

    let coinPrice = document.querySelector(`#${coin.coinId}`);
    let pnlText = document.querySelector(`#coin-pnl`);
    let curCurrency = document.querySelector(`#currency-pnl`);
    let coinImage = document.querySelector(`.icon`);
    let curPrice;
    let newPnl;

    fetch("https://cryptoicons.org/api/icon/eth/200"); //get crypto icon

    ///--- following function will update every 500ms ---///
    setInterval(function () {
      fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${coin.symbol.toUpperCase()}`
      )
        .then((res) => res.json())
        .then(function (data) {
          const newPrice = +data.price;
          coinPrice.textContent = newPrice.toPrecision(6);
          curPrice = data.price;
        })
        .catch((err) => console.log(err));

      ///---- set PnL percentage -----///
      newPnl = ((curPrice - coin.orderPrice) / coin.orderPrice) * 100;
      pnlText.textContent = `${newPnl >= 0 ? "+" : ""}${newPnl.toFixed(2)}%`;

      ///----- set new Currency ---- ///
      curCurrency.textContent = `${(
        coin.orderCurrency *
        (1 + newPnl / 100)
      ).toFixed(2)}`;
    }, 500);
  }

  //on startup, load all coins in the coins array.
  _loadAllCoins(coinsArr) {
    coinsArr.forEach((coin) => {
      this._renderCoin(coin);
    });
  }
}

const app = new App();
