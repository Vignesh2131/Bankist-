'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Vignesh Sadhu',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-05-26T17:01:17.194Z',
    '2022-05-28T23:36:17.929Z',
    '2022-05-29T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Viraja Kamarajugadda',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-05-10T14:43:26.374Z',
    '2020-05-25T18:49:59.371Z',
    '2021-05-29T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date,locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  
  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(new Date());
  // console.log(daysPassed)
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = date.getDate();
    // const month = date.getMonth() + 1;
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  } 
  
}

const formatCurr = function (value,locale,currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value)
}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ?acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
     
    const value = new Date(acc.movementsDates[i]);
    // console.log(value);
    const displayDate = formatMovementDate(value,acc.locale);
    
    const formattedMovement = formatCurr(mov, acc.locale, acc.currency);


    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1
      } ${type}</div>
      <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMovement}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCurr(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurr(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurr(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurr(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick=function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //in each call back print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;
  
    //When 0 seconds , stop timer and log out user
    if (time === 0) {
      clearInterval(timer)
      labelWelcome.textContent = 'Log in to get started'
      containerApp.style.opacity = 0;
    }
      //decrease 1s
      time--;
  };
   //Set time to 5mins
   let time = 300;
   //call the timer every sec
    tick();
  const timer = setInterval(tick, 1000);
  return timer;
  
}

///////////////////////////////////////
// Event handlers
let currentAccount,timer;

//FAKE ALWAYS
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;


btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]
      }`;
    containerApp.style.opacity = 100;
    
    //create current date and time
    const now = new Date();
//     const month = now.getMonth() + 1;
//     const year = now.getFullYear() + 1;
//     const hour = now.getHours();
//     const min = now.getMinutes();
//     const day = now.getDate();
//     const daysPassed = (date1, date2) => Math.abs(date2 - date1)/(1000*60*60*24);

// labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
     //EXPERIMENTING FAKE API
  const option = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  weekday:'long',
}

labelDate.textContent = new Intl.DateTimeFormat
  (currentAccount.locale, option).format(now);

//Day/month/year

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) {
      //console.log('There is a timer')
      clearInterval(timer);
    }
   timer= startLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Transfer
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());


    // Update UI
    updateUI(currentAccount);

    //Reset the timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //Adding date and time
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    },2500);
  }
  inputLoanAmount.value = '';
   //Reset the timer
   clearInterval(timer);
   timer = startLogOutTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(acc, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES


//Base 10 - 0 to 9 
//Binary base 2 - 0 and 1
/*
console.log(23 == 23.0);

//conversion
let y = +'23';
console.log(typeof y);

//parsing
console.log(Number.parseInt('34px', 10));
console.log(Number.parseInt('34.5rem', 10));

console.log(Number.parseFloat('23.55rem'));

console.log(Number.isNaN(20));
console.log(Number.isNaN(+'30%'));

//Checking if value is number
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));

console.log(Number.isInteger(23));
console.log(Number.isInteger(32 / 3));
*/



/////MATH AND ROUNDING/////
/*
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(23, 354, 3, 532, 54));
console.log(Math.min(12, 64, 85, 4, 84));

console.log(Math.PI * Number.parseFloat('10px'));

console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) => Math.trunc(Math.random() * (max - min) + 1)+min;
console.log(randomInt(10, 20));

//Rounding integers
console.log(Math.trunc(23.45));
console.log(Math.round(45.7));
console.log(Math.ceil(67.4));
console.log(Math.floor(34.89));

//Rounding Decimals
console.log((2.6).toFixed(0));//it returns a string
console.log((9.7).toFixed(3));
console.log(+(2.34).toFixed(0));//Now it returns a number
*/

////REMAINDER OPERATOR////
/*

console.log(5 % 2);
console.log(5 / 2);

console.log(8 % 3);
console.log(8 / 3);

console.log(6 % 2);
console.log(6 / 2);

const isEven = n => n % 2 == 0;
console.log(isEven(9));
*/


////NUMERIC SEPERATORS////
/*
const diameter = 207_809_000_000;
console.log(diameter);

const priceCents = 354_99;
console.log(priceCents);

console.log(Number('230_000));//Returns NAN i.e type conversion cannot be acheived.



/////BIG INT/////
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 4);
console.log(2 ** 53 + 9);

console.log(54136536464581132584n);
console.log(BigInt(6435416341621678));

//Operations
console.log(10000n + 10000n);
console.log(536416364165n * 4156486597n);
//console.log(Math.sqrt(13n));(Not possible)

const huge = 623985793754n;
const num = 211;
console.log(huge * BigInt(num));

//Exceptions
console.log(20n > 15);
console.log(20n === 20);
console.log(typeof 20n);
console.log(20n == '20');

console.log(huge + 'is really big value');

//Divisons
console.log(15n / 2n);
*/

////DATE FUNCTIONS////
/*
//Create a date.
const date1 = new Date();
console.log(date1);

const date2 = new Date('May 30 2022 10:55:42');
console.log(date2);

const date3 = new Date('August 21 2003');
console.log(date3);

const newDate = new Date(account1.movementsDates[0]);
console.log(newDate);

console.log(new Date(2035, 10, 19, 15, 23, 7));

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));


//Working with dates
const future = new Date(2037, 10, 19, 15, 23,10);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

console.log(Date.now());
*/

////OPERATIONS ON DATES////
/*
const future = new Date(2037, 10, 19, 15, 23, 10);
console.log(Number(future));

const daysPassed = (date1, date2) =>
    Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = daysPassed(new Date(2037, 3, 14,10,8), new Date(2037, 10, 22));
console.log(days1);
*/

//INTERNATIONALISATION OF NUMBERS//
/*
const num = 4649643.2345;
const options = {
  style: 'unit',
  unit: 'mile-per-hour',
  currency: 'EUR'
}
console.log(new Intl.NumberFormat('en-US',options).format(num));
console.log(new Intl.NumberFormat('te-IN',options).format(num));
*/

////SETTIMEOUT AND SETINTERVAL////

/*
//set timeout

const ingridients = ['olives', 'brocolli', 'corn'];
const pizzaDl=setTimeout((in1, in2,in3) => console.log(`Here is your pizza with ${in1}, ${in2}, ${in3}`),
  3000,...ingridients);
console.log('Waiting');

if (ingridients.includes('spinach')) {
  clearTimeout(pizzaDl);
}

//set interval
setInterval(function () {
  const now = new Date();
  console.log(now)
},1000)

setInterval(function () {
  const present = new Date();
  const hour = present.getHours();
  const minutes = present.getMinutes();
  const seconds = present.getSeconds();
  console.log(`${hour}:${minutes}:${seconds}`)
}, 1000);
*/