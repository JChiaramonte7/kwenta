import { CurrencyKey } from './currency';

export const EXTERNAL_LINKS = {
	Trading: {
		DexAG: 'https://dex.ag/',
		Uniswap: 'https://uniswap.exchange/',
		OneInch: `https://1inch.exchange/`,
		OneInchLink: (from: CurrencyKey, to: CurrencyKey) => `https://1inch.exchange/#/${from}/${to}`,
	},
	Synthetix: {
		Home: 'https://www.synthetix.io',
		Litepaper: 'https://docs.synthetix.io/litepaper/',
	},
	Social: {
		Twitter: 'https://twitter.com/kwenta_io',
		Medium: 'https://blog.synthetix.io/',
		Discord: 'https://discordapp.com/invite/AEdUHzt',
		GitHub: 'https://github.com/synthetixio/kwenta',
	},
	TokenLists: {
		Synthetix:
			'https://bafybeidkpj743vthl5chzdxibjxfbf2hv3y4mmtcbciu4kdh4d6xqfezpa.ipfs.dweb.link/',
		Zapper: 'https://zapper.fi/api/token-list',
		OneInch: 'https://gateway.ipfs.io/ipns/tokens.1inch.eth',
	},
};
