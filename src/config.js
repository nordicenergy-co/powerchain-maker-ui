export default {
  version: process.env.VUE_APP_VERSION || '0.0.1',
  locale: process.env.VUE_APP_LOCALE || 'en',
  erc20Address: {
    main: process.env.VUE_APP_MAIN_SC_ERC20_ADDRESS || '0x763fa6806e1acf68130d2d0f0df754c93cc546b2',
    ropsten: process.env.VUE_APP_ROPSTEN_SC_ERC20_ADDRESS || '0x65fc0f7d2bb96a9be30a770fb5fcd5a7762ad659'
  },
  registryAddress: {
    main: process.env.VUE_APP_MAIN_SC_LITION_REGISTRY_ADDRESS || '0x3b9a052bc3e457A0f278436f058E040A147aB323',
    ropsten: process.env.VUE_APP_ROPSTEN_SC_LITION_REGISTRY_ADDRESS || '0xA8659cee561B7C6118B2FB0D8f73e18aA8aC4ba4'
  },
  validtorAddress: {
    main: process.env.VUE_APP_MAIN_SC_LITION_VALIDATOR_ADDRESS || '0x022023BE5EC6aE0af99d3CB337a2811AD123B3D8',
    ropsten: process.env.VUE_APP_ROPSTEN_SC_LITION_VALIDATOR_ADDRESS || '0x8c8fb24B2514f89ce5E34Ee91A2DB5E9891C88FF'
  }
}
