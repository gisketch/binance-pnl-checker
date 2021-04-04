"use strict";

/// ------- Functions----------///

// function uuidv4() {
//   return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
//     var r = (Math.random() * 16) | 0,
//       v = c == "x" ? r : (r & 0x3) | 0x8;
//     return v.toString(16);
//   });
// }

function calculatePnl(price, orderPrice) {
  return ((price - orderPrice) / orderPrice) * 100;
}

function calculatePnlString(price, orderPrice) {
  const pnlRaw = ((price - orderPrice) / orderPrice) * 100;
  return `${pnlRaw >= 0 ? "+" : ""}${pnlRaw.toFixed(2)}%`;
}

function calculatePnlCurrency(pnl) {
  return `${(coin.orderCurrency * (1 + pnl / 100)).toFixed(2)}`;
}

///------- COINS CLASSES --------///

class Coin {
  constructor(symbol, coinPair, orderPrice, orderCurrency) {
    this.symbol = symbol.toUpperCase();
    this.coinPair = coinPair;
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
const overlay = document.querySelector(".overlay");
const addCoinModal = document.querySelector(".add-coin-container");
const addCoinBtn = document.querySelector(".add-coin-btn");

let coin;

class App {
  //TODO: find a way to save pushed coins to this array to load on startup
  #coins = [];

  constructor() {
    this._renderCoin;

    addCoin.addEventListener("click", this._newCoin.bind(this));
    addCoin.addEventListener("click", this._hideCoinModal.bind(this));
    addCoinBtn.addEventListener("click", this._showCoinModal.bind(this));
    overlay.addEventListener("click", this._hideCoinModal.bind(this));

    this._loadAllCoins(this.#coins);
  }

  _showCoinModal(e) {
    e.preventDefault();
    overlay.style.display = "block";
    addCoinModal.classList.add("show-modal");
  }

  _hideCoinModal(e) {
    e.preventDefault();
    overlay.style.display = "none";
    addCoinModal.classList.remove("show-modal");
  }

  _newCoin(e) {
    e.preventDefault();

    const coinSymbol = inputSymbol.value;
    const coinOrder = +inputOrder.value;
    const coinOrderCurrency = +inputOrderCurrency.value;

    coin = new Coin(coinSymbol, "USDT", coinOrder, coinOrderCurrency); //PLACEHOLDER prevday and price
    this.#coins.push(coin); //push to coins array
    this._renderCoin(coin);
  }

  _renderCoin(coin) {
    let html = `
        <div class="coin">
          <div class="icons">
            <div class="icon-item">
              <img class="icon">
            </div>
            <div class="icon-item">
              <img class="icon-pair">
            </div>
          </div>
          <div class="coin-details">
            <div class="coin-detail-1">
              <span class="coin-name">
                ${coin.symbol.toUpperCase()}
                  <span>
                      <object
                        data="img/refresh-button.svg"
                        class="refresh"
                      ></object>
                  </span>
                ${coin.coinPair.toUpperCase()}
              </span>
              <span class="order-price">${
                coin.orderPrice
              } ${coin.coinPair.toUpperCase()}</span>
            </div>

            <div class="coin-detail-2">
              <div id="${coin.coinId}" class="price">Loading...</div>
              <div id="coin-pnl">Loading...</div>
            </div>
          </div>
        </div>`;

    //Instantiate coin html object in pnlContainer
    pnlContainer.insertAdjacentHTML("afterbegin", html);

    // ------- DATA REFRESH ---------//
    let coinPrice = document.querySelector(`#${coin.coinId}`);
    let pnlText = document.querySelector(`#coin-pnl`);
    // let curCurrency = document.querySelector(`#currency-pnl`);
    let coinImage = document.querySelector(`.icon`);
    let coinPairImage = document.querySelector(`.icon-pair`);
    let curPrice;
    let fetchImage;

    fetch(
      `https://cryptoicon-api.vercel.app/api/icon/${coin.symbol.toLowerCase()}`
    )
      .then((res) => res.blob())
      .then((blob) => {
        fetchImage = URL.createObjectURL(blob);
        coinImage.src = fetchImage;
      });

    fetch(
      `https://cryptoicon-api.vercel.app/api/icon/${coin.coinPair.toLowerCase()}`
    )
      .then((res) => res.blob())
      .then((blob) => {
        fetchImage = URL.createObjectURL(blob);
        coinPairImage.src = fetchImage;
      });

    ///--- following function will update every 500ms ---///
    setInterval(function () {
      fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${coin.symbol.toUpperCase()}${coin.coinPair.toUpperCase()}`
      )
        .then((res) => res.json())
        .then(function (data) {
          const newPrice = +data.price;
          coinPrice.textContent = `${newPrice.toPrecision(6)}`;
          curPrice = data.price;
        })
        .catch((err) => console.log(err));

      ///---- set PnL percentage -----///
      pnlText.className =
        calculatePnl(curPrice, coin.orderPrice) > 0 ? "gain" : "loss";
      pnlText.textContent = calculatePnlString(curPrice, coin.orderPrice);
      ///----- set new Currency ---- ///
      // curCurrency.textContent = calculatePnlCurrency(
      //   calculatePnl(curPrice, coin.orderPrice)
      // );
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
