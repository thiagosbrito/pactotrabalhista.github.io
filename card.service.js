/*
	Projeto: redepay-portal
	Author/Empresa: Concrete Solutions / Rede
	Copyright (C) 2015 Rede S.A.
*/

(function () {
	'use strict';

	angular
		.module('app')
		.service('CardService', CardService);

	CardService.$inject = ['$filter', 'ValidatorService'];

	function CardService($filter, ValidatorService) {
		var objSelf = this;
		var strImageBaseUrl = config.staticPath + 'assets/images/svgs/';

		this.cardMask = '9999  9999  9999  999?9?';
		this.cardLimit = 16;
		this.codeSecurity = {
			mask: '999',
			limit: 3,
			message: 'É um número de 3 dígitos impresso no verso do cartão.'
		};

		this.cards = [
			{
				id: 'visa',
				title: 'Visa',
				img: strImageBaseUrl + 'brand_visa.svg',
				regex: {
					init4: [/^4[0-9]{15}$/]
				},
				regexExcluded: {
					init4: [
						/^(40117[8-9])[0-9]{10}$/,
						/^(43(1274|8935))[0-9]{10}$/,
						/^(45(1416|7393|763[1-2]))[0-9]{10}$/
					],
				}
			},
			{
				id: 'mastercard',
				title: 'Mastercard',
				img: strImageBaseUrl + 'brand_mastercard.svg',
				regex: {
					init2: [/^(2)[0-9]{15}$/],
					init5: [/^(5)[0-9]{15}$/],
				},
				regexExcluded: {
					init5: [
						/^(504175|509090)[0-9]{10}$/,
						/^(5067(0[7-8]|1(5|[7-9])|2[0-9]|3([0-6]|9)|4[0-8]|5[0-3]|7[4-8]))[0-9]{10}$/,
						/^(5090([0-8][0-3]|8([5-6]|9)))[0-9]{10}$/,
					],
				}
			},
			{
				id: 'hiper',
				title: 'Hiper',
				img: strImageBaseUrl + 'brand_hiper.svg',
				regex: {
					init6: [/^(637095|637599|637609|637612|637600|637568)[0-9]{10}$/]
				},
				regexExcluded: {
					init6: [
						/^(636297|636368)[0-9]{10}$/
					]
				}
			},
			{
				id: 'hipercard',
				title: 'Hipercard',
				img: strImageBaseUrl + 'brand_hipercard.svg',
				regex: {
					init3: [/^(3841)[0-9]{12}$/],
					init6: [/^(606282)[0-9]{10}$/]
				}
			},
			{
				id: 'diners',
				title: 'Diners Club',
				img: strImageBaseUrl + 'brand_diners.svg',
				regex: {
					init3: [
						/^(300|301|302|303|304|305)[0-9]{11}$/,
						/^(36|38|39)[0-9]{12}$/
					]
				},
				regexExcluded: {
					init3: [/^(3841)[0-9]{10}$/]
				},
				cardLimit: 14
			},
			{
				id: 'jcb',
				title: 'Jcb',
				img: strImageBaseUrl + 'brand_jcb.svg',
				regex: {
					init3: [/^(356700|366999|357200)[0-9]{10}$/]
				}
			},
			{
				id: 'amex',
				title: 'American Express',
				img: strImageBaseUrl + 'brand_amex.svg',
				regex: {
					init3: [/^(34|37)[0-9]{13}$/]
				},
				regexExcluded: {
					init3: [/^(3761)[0-5]{11}$/]
				},
				cardLimit: 15,
				cardMask: '9999  999999  99999',
				codeSecurity: {
					mask: '9999',
					limit: 4,
					message: 'É um número de 4 dígitos impresso na frente do cartão.'
				}
			},
			{
				id: 'elo',
				title: 'elo',
				img: strImageBaseUrl + 'brand_elo.svg',
				regex: {
					init4: [
						/^(40117[8-9])[0-9]{10}$/,
						/^(43(1274|8935))[0-9]{10}$/,
						/^(45(1416|7393|763[1-2]))[0-9]{10}$/
					],
					init5: [
						/^(504175|509090)[0-9]{10}$/,
						/^(5067(0[7-8]|1(5|[7-9])|2[0-9]|3([0-6]|9)|4[0-8]|5[0-3]|7[4-8]))[0-9]{10}$/,
						/^(5090([0-8][0-3]|8([5-6]|9)))[0-9]{10}$/,
					],
					init6: [
						/^(627780|636297|636368)[0-9]{10}$/,
						/^(6503([1-3]|[5-9]|4[0-9]|5[0-1]))[0-9]{10}$/,
						/^(6504(0[5-9]|[1-3][0-9]|8[5-9]|9[0-9]))[0-9]{10}$/,
						/^(6505([0-2][0-9]|3[0-8]|4[1-9]|[5-8][0-9]|9[0-8]))[0-9]{10}$/,
						/^(6507(0[0-9]|1[0-8]|2[0-7]))[0-9]{10}$/,
						/^(6509([0-1][0-9]|20))[0-9]{10}$/,
						/^(6516(5[2-9]|6[0-9]|7[0-9]))[0-9]{10}$/,
						/^(6550([0-1][0-9]|[2-4][0-9]|5[0-8]))[0-9]{10}$/
					]
				}
				// /^()[0-9]{10}$/
			},
		];

		this.message = {
			invalidCardNumber: 'Este não é um número de cartão de crédito válido. Por favor, digite outro número.',
			cannotDuplicateCard: 'Este cartão já está cadastrado na sua carteira Rede Pay.',
			isZeroDollar: 'Cartão inválido! Verifique a digitação ou insira outro cartão.'
		};

		this.cardFormat = function (cardNumber) {
			var objDetectedBrand;

			if (cardNumber) {
				objDetectedBrand = objSelf.detectedBrand(cardNumber);
				cardNumber = $filter('mask')(ValidatorService.strip(cardNumber),
					(objDetectedBrand ? objDetectedBrand.cardMask : objSelf.cardMask));
			}
			return cardNumber;
		};

		this.clearFormat = function (cardNumber) {
			return cardNumber ? cardNumber.replace(/[^\d]+/g, '') : cardNumber;
		};

		this.detectedBrand = function (cardNumber, key) {
			var objBrand = false;
			var intNumber = objSelf.clearFormat(cardNumber);
			var firstPosDigit = intNumber ? intNumber[0] : 0;

			objSelf.cards.forEach(function (card) {
				var objRegs = card.regex['init' + firstPosDigit];
				if (!objBrand && objRegs) {

					objRegs.forEach(function(reg) {
						var intExcluded = false;
						if (reg.test(intNumber)) {

							if (card.regexExcluded && card.regexExcluded['init' + firstPosDigit]) {
								card.regexExcluded['init' + firstPosDigit].forEach(function(regExcluded) {
									if (regExcluded.test(intNumber)) {
										intExcluded = true;
									}
								});

								if (intExcluded) {
									return;
								}

							}

							objBrand = card;
							return;
						}
					});
				}

				if (key) {
					if (card.id === key.toLowerCase()) {
						objBrand = card;
						return;
					}
				}
			});

			if (objBrand) {
				objBrand.cardMask = (objBrand.cardMask ? objBrand.cardMask : objSelf.cardMask);
				objBrand.cardLimit = (objBrand.cardLimit ? objBrand.cardLimit : objSelf.cardLimit);
				objBrand.codeSecurity = (objBrand.codeSecurity ? objBrand.codeSecurity : objSelf.codeSecurity);
			}
			return objBrand;
		};
	}
})();
