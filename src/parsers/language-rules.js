export const LANGUAGE_RULES = {
	en: {
		multipliers: [
			{ suffix: "billion", value: 1000000000 },
			{ suffix: "b", value: 1000000000 },
			{ suffix: "million", value: 1000000 },
			{ suffix: "m", value: 1000000 },
			{ suffix: "thousand", value: 1000 },
			{ suffix: "k", value: 1000 },
		],
		thousandSeparator: ",",
		decimalSeparator: ".",
	},
	pt: {
		multipliers: [
			{ suffix: "bilhão", value: 1000000000 },
			{ suffix: "bilhões", value: 1000000000 },
			{ suffix: "b", value: 1000000000 },
			{ suffix: "milhão", value: 1000000 },
			{ suffix: "milhões", value: 1000000 },
			{ suffix: "mi", value: 1000000 },
			{ suffix: "m", value: 1000000 },
			{ suffix: "mil", value: 1000 },
		],
		thousandSeparator: ".",
		decimalSeparator: ",",
	},
};
