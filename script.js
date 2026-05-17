const ASSET_POINT_VALUES = {
  MNQ: 2,
  MES: 5,
  MYM: 0.5,
  MGC: 10,
};

const inputs = {
  accountBalance: document.getElementById('accountBalance'),
  maxLossAmount: document.getElementById('maxLossAmount'),
  stopLossPoints: document.getElementById('stopLossPoints'),
  asset: document.getElementById('asset'),
};

const outputs = {
  riskAmount: document.getElementById('riskAmount'),
  riskPerContract: document.getElementById('riskPerContract'),
  riskPctDisplay: document.getElementById('riskPctDisplay'),
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

function validateInputs(balance, maxLossAmount, stopLoss) {
  let valid = true;

  showError('accountBalance', '');
  showError('maxLossAmount', '');
  showError('stopLossPoints', '');

  if (!Number.isFinite(balance) || balance <= 0) {
    showError('accountBalance', 'Enter an account balance greater than 0.');
    valid = false;
  }

  if (!Number.isFinite(maxLossAmount) || maxLossAmount <= 0) {
    showError('maxLossAmount', 'Enter a max loss amount greater than 0.');
    valid = false;
  }

  if (Number.isFinite(maxLossAmount) && Number.isFinite(balance) && maxLossAmount > balance) {
    showError('maxLossAmount', 'Max loss cannot exceed account balance.');
    valid = false;
  }

  if (!Number.isFinite(stopLoss) || stopLoss <= 0) {
    showError('stopLossPoints', 'Enter stop loss points greater than 0.');
    valid = false;
  }

  return valid;
}

function resetOutputs() {
  outputs.riskAmount.textContent = '$0.00';
  outputs.riskPerContract.textContent = '$0.00';
  outputs.riskPctDisplay.textContent = '0.00%';
  outputs.contracts.textContent = '0';
  outputs.statusMessage.textContent = 'Please fix the highlighted fields.';
  outputs.statusMessage.classList.remove('warning');
}

function calculatePositionSize() {
  const accountBalance = toNumber(inputs.accountBalance.value);
  const maxLossAmount = toNumber(inputs.maxLossAmount.value);
  const stopLossPoints = toNumber(inputs.stopLossPoints.value);
  const asset = inputs.asset.value;
  const pointValue = ASSET_POINT_VALUES[asset];

  if (!validateInputs(accountBalance, maxLossAmount, stopLossPoints)) {
    resetOutputs();
    return;
  }

  const riskPercentage = (maxLossAmount / accountBalance) * 100;
  const riskPerContract = stopLossPoints * pointValue;
  const contracts = Math.floor(maxLossAmount / riskPerContract);

  outputs.riskAmount.textContent = formatCurrency(maxLossAmount);
  outputs.riskPerContract.textContent = formatCurrency(riskPerContract);
  outputs.riskPctDisplay.textContent = `${riskPercentage.toFixed(2)}%`;
  outputs.contracts.textContent = String(Math.max(0, contracts));

  if (contracts < 1) {
    outputs.statusMessage.textContent = 'Risk too small for 1 contract.';
    outputs.statusMessage.classList.remove('warning');
    return;
  }

  const warnings = [];
  if (riskPercentage > 2) {
    warnings.push('Risk percentage is above 2%.');
  }
  if (contracts > 10) {
    warnings.push('Contract count exceeds 10.');
  }

  if (warnings.length > 0) {
    outputs.statusMessage.textContent = `${warnings.join(' ')} Position size supports up to ${contracts} ${asset} contract${contracts > 1 ? 's' : ''}.`;
    outputs.statusMessage.classList.add('warning');
  } else {
    outputs.statusMessage.textContent = `Position size supports up to ${contracts} ${asset} contract${contracts > 1 ? 's' : ''}.`;
    outputs.statusMessage.classList.remove('warning');
  }
}

inputs.accountBalance.value = '50000';
inputs.maxLossAmount.value = '250';

Object.values(inputs).forEach((element) => {
  element.addEventListener('input', calculatePositionSize);
  element.addEventListener('change', calculatePositionSize);
});

calculatePositionSize();
