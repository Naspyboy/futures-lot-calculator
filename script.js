const ASSET_POINT_VALUES = {
  MNQ: 2,
  MES: 5,
  MYM: 0.5,
  MGC: 10,
};

const inputs = {
  accountBalance: document.getElementById('accountBalance'),
  riskPercentage: document.getElementById('riskPercentage'),
  stopLossPoints: document.getElementById('stopLossPoints'),
  asset: document.getElementById('asset'),
};

const outputs = {
  riskAmount: document.getElementById('riskAmount'),
  riskPerContract: document.getElementById('riskPerContract'),
  contracts: document.getElementById('contracts'),
  statusMessage: document.getElementById('statusMessage'),
};

function toNumber(value) {
  return Number.parseFloat(value);
}

function showError(fieldId, message = '') {
  const errorEl = document.querySelector(`.error[data-for="${fieldId}"]`);
  if (errorEl) errorEl.textContent = message;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}

function validateInputs(balance, riskPct, stopLoss) {
  let valid = true;

  showError('accountBalance', '');
  showError('riskPercentage', '');
  showError('stopLossPoints', '');

  if (!Number.isFinite(balance) || balance <= 0) {
    showError('accountBalance', 'Enter a valid amount greater than 0.');
    valid = false;
  }

  if (!Number.isFinite(riskPct) || riskPct <= 0 || riskPct > 100) {
    showError('riskPercentage', 'Use a value between 0.01 and 100.');
    valid = false;
  }

  if (!Number.isFinite(stopLoss) || stopLoss <= 0) {
    showError('stopLossPoints', 'Enter stop loss points greater than 0.');
    valid = false;
  }

  return valid;
}

function calculatePositionSize() {
  const accountBalance = toNumber(inputs.accountBalance.value);
  const riskPercentage = toNumber(inputs.riskPercentage.value);
  const stopLossPoints = toNumber(inputs.stopLossPoints.value);
  const asset = inputs.asset.value;
  const pointValue = ASSET_POINT_VALUES[asset];

  if (!validateInputs(accountBalance, riskPercentage, stopLossPoints)) {
    outputs.riskAmount.textContent = '$0.00';
    outputs.riskPerContract.textContent = '$0.00';
    outputs.contracts.textContent = '0';
    outputs.statusMessage.textContent = 'Please fix the highlighted fields.';
    return;
  }

  const riskAmount = accountBalance * (riskPercentage / 100);
  const riskPerContract = stopLossPoints * pointValue;
  const contracts = Math.floor(riskAmount / riskPerContract);

  outputs.riskAmount.textContent = formatCurrency(riskAmount);
  outputs.riskPerContract.textContent = formatCurrency(riskPerContract);
  outputs.contracts.textContent = String(Math.max(0, contracts));

  if (contracts < 1) {
    outputs.statusMessage.textContent = 'Risk is too small for 1 contract at this stop loss.';
  } else {
    outputs.statusMessage.textContent = `You can open up to ${contracts} ${asset} micro contract${contracts > 1 ? 's' : ''}.`;
  }
}

Object.values(inputs).forEach((element) => {
  element.addEventListener('input', calculatePositionSize);
  element.addEventListener('change', calculatePositionSize);
});

calculatePositionSize();
