import { getErc20Abi, getPowerChainRegistryAbi } from './abi/abi'
import config from './config'
import { tokensToLitPrecision, fromLitPrecisionToTokens, getErc20ContractAddress, getPowerChainRegistryAddress } from './utils'
import Web3 from 'web3'

export default async (ethereum, web3) => {
  if (typeof ethereum === 'undefined' || typeof web3 === 'undefined' || !Object.prototype.hasOwnProperty.call(web3, 'currentProvider')) {
    throw Error('No ethereum compatible client installed')
  }

  function getCurrentNetwork (ethereum) {
    if (ethereum.networkVersion === '1') {
      return 'main'
    } else if (ethereum.networkVersion === '3') {
      return 'ropsten'
    }
  }

  let _network = getCurrentNetwork(ethereum)
  const _ethereum = ethereum
  const _currentProvider = web3.currentProvider
  let _erc20Contract
  let _PowerChainRegistryContract
  let _web3
  let _account
  let _PowerChainRegistryContractAddress
  let _accountsChangedEventRegistered = false

  function initialize (powerchainErc20Abi = getErc20Abi(), PowerChainRegistryAbi = getPowerChainRegistryAbi(), erc20ContractAddress = getErc20ContractAddress(), PowerChainRegistryContractAddress = getPowerChainRegistryAddress()) {
    _PowerChainRegistryContractAddress = PowerChainRegistryContractAddress
    _web3 = new Web3(_currentProvider)
    _erc20Contract = new _web3.eth.Contract(powerchainErc20Abi, erc20ContractAddress)
    _PowerChainRegistryContract = new _web3.eth.Contract(PowerChainRegistryAbi, PowerChainRegistryContractAddress)
  }

  initialize(
    getErc20Abi(_network),
    getPowerChainRegistryAbi(_network),
    getErc20ContractAddress(_network),
    getPowerChainRegistryAddress(_network)
  )

  return {
    hasMetaMask () {
      return _ethereum.isMetaMask
    },
    async login () {
      let accounts = await _ethereum.enable()

      if (accounts.length === 0) {
        throw Error('User has no MetaMask accounts')
      }

      _account = accounts[0]

      if (!_accountsChangedEventRegistered) {
        _ethereum.on('accountsChanged', accounts => {
          _account = accounts[0]
        })

        _accountsChangedEventRegistered = true
      }
    },
    reinitialize (powerchainErc20Abi = getErc20Abi(), PowerChainRegistryAbi = getPowerChainRegistryAbi(), erc20ContractAddress = getErc20ContractAddress(), PowerChainRegistryContractAddress = getPowerChainRegistryAddress()) {
      initialize(powerchainErc20Abi, PowerChainRegistryAbi, erc20ContractAddress, PowerChainRegistryContractAddress)
    },
    getNetworkName () {
      return _network
    },
    async mint (tokens) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      return _erc20Contract
        .methods
        .mint(_account, tokensToLitPrecision(tokens))
        .send({
          from: _account
        })
    },
    async approve (tokens) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      return _erc20Contract
        .methods
        .approve(_PowerChainRegistryContractAddress, tokensToLitPrecision(tokens))
        .send({
          from: _account
        })
    },
    async registerChain (
      description,
      initEndpoint,
      chainValidator,
      minRequiredDeposit,
      minRequiredVesting,
      rewardBonusRequiredVesting,
      rewardBonusPercentage,
      notaryPeriod,
      maxValidators,
      maxTransactors,
      notaryVesting,
      notaryParticipation
    ) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      if (chainValidator == 0) {
        chainValidator = '0x0000000000000000000000000000000000000000'
      }

      return _PowerChainRegistryContract
        .methods
        .registerChain(
          description,
          initEndpoint,
          chainValidator,
          tokensToLitPrecision(minRequiredDeposit),
          tokensToLitPrecision(minRequiredVesting),
          tokensToLitPrecision(rewardBonusRequiredVesting),
          rewardBonusPercentage,
          notaryPeriod,
          maxValidators,
          maxTransactors,
          notaryVesting,
          notaryParticipation
        )
        .send({
          from: _account
        })
    },
    async getChainStaticDetails (chainId) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      return _PowerChainRegistryContract
        .methods
        .getChainStaticDetails(chainId)
        .call()
    },
    async getChainDynamicDetails (chainId) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      return _PowerChainRegistryContract
        .methods
        .getChainDynamicDetails(chainId)
        .call()
    },
    async requestVestInChain (chainId, tokens) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      return _PowerChainRegistryContract
        .methods
        .requestVestInChain(chainId, tokensToLitPrecision(tokens))
        .send({
          from: _account
        })
    },
    async addToVestInChain (chainId, tokens) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      const userDetails = await this.getUserDetails(chainId)
      const totalVesting = parseInt(fromLitPrecisionToTokens(userDetails.vesting))
      const newVesting = totalVesting + parseInt(tokens)

      return _PowerChainRegistryContract
        .methods
        .requestVestInChain(chainId, tokensToLitPrecision(newVesting))
        .send({
          from: _account
        })
    },
    async confirmVestInChain (chainId) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      return _PowerChainRegistryContract
        .methods
        .confirmVestInChain(chainId)
        .send({
          from: _account
        })
    },
    async requestDepositInChain (chainId, tokens) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      return _PowerChainRegistryContract
        .methods
        .requestDepositInChain(chainId, tokensToLitPrecision(tokens))
        .send({
          from: _account
        })
    },
    async addToDepositInChain (chainId, tokens) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      const userDetails = await this.getUserDetails(chainId)
      const totalDeposit = parseInt(fromLitPrecisionToTokens(userDetails.deposit))
      const newDeposit = totalDeposit + parseInt(tokens)

      console.log(chainId, tokensToLitPrecision(newDeposit))

      return _PowerChainRegistryContract
        .methods
        .requestDepositInChain(chainId, tokensToLitPrecision(newDeposit))
        .send({
          from: _account
        })
    },
    async getUserDetails (chainId) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      return _PowerChainRegistryContract
        .methods
        .getUserDetails(chainId, _account)
        .call()
    },
    async withdrawVestInChain (chainId, tokens) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      const userDetails = await this.getUserDetails(chainId)
      const totalVesting = parseInt(fromLitPrecisionToTokens(userDetails.vesting))

      if (tokens > totalVesting) {
        throw new Error(`You can withdraw maximum of ${totalVesting} tokens from vesting`)
      }

      return this.requestVestInChain(chainId, totalVesting - tokens)
    },
    async withdrawDepositInChain (chainId, tokens) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      const userDetails = await this.getUserDetails(chainId)
      const totalDeposit = parseInt(fromLitPrecisionToTokens(userDetails.deposit))

      if (tokens > totalDeposit) {
        throw new Error(`You can withdraw maximum of ${totalDeposit} tokens from deposit`)
      }

      return this.requestDepositInChain(chainId, totalDeposit - tokens)
    },
    async confirmDepositWithdrawalFromChain (chainId) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      return _PowerChainRegistryContract
        .methods
        .confirmDepositWithdrawalFromChain(chainId)
        .send({
          from: _account
        })
    },
    async startMining (chainId) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      return _PowerChainRegistryContract
        .methods
        .startMining(chainId)
        .send({
          from: _account
        })
    },
    async stopMining (chainId) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      return _PowerChainRegistryContract
        .methods
        .stopMining(chainId)
        .send({
          from: _account
        })
    },
    async getTransaction (transactionHash) {
      if (typeof _account === 'undefined') {
        await this.login()
      }

      return _web3
        .eth
        .getTransaction(transactionHash)
    }
  }
}
