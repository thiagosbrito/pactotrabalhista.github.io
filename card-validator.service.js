/*
	Projeto: redepay-portal
	Author/Empresa: Concrete Solutions / Rede
	Copyright (C) 2015 Rede S.A.
*/

(function () {
	'use strict';

	angular
		.module('app')
		.service('CardValidatorService', CardValidator);

	CardValidator.$inject = ['$filter', 'ToastrService', 'CardService'];

	function CardValidator($filter, ToastrService, CardService) {
		var self = this;

		this.CardIsValid = function (cardNumber) {
			return self.getCardBrand(self.clearFormat(cardNumber));
		};

		this.CardBrandValid = function (cardNumber) {
			if (self.CardIsValid(cardNumber)) {
				return true;
			} else {
				ToastrService.show(CardService.message.invalidCardNumber);
				return false;
			}
		};

		this.CardValid = function (cardNumber, limit) {
			if (cardNumber) {
				cardNumber = self.clearFormat(cardNumber);
				if (!limit) {
					limit = 14;
				}

				if (((cardNumber.length >= limit) && (cardNumber.length <= 16))) {
					var intCheck = 0;
					var intDigit = 0;
					var bolEven = false;

					for (var intIndex = cardNumber.length - 1; intIndex >= 0; intIndex--) {
						var strDigit = cardNumber.charAt(intIndex);
						intDigit = parseInt(strDigit, 10);

						if (bolEven) {
							if ((intDigit *= 2) > 9) {
								intDigit -= 9;
							}
						}
						intCheck += intDigit;
						bolEven = !bolEven;
					}
					return ((intCheck % 10) === 0);
				}
				return false;
			}
			else {
				return false;
			}
		};

		this.getCardBrand = function (value) {
			var identified = false;
			if (value) {
				value = value.replace(/[^\d]+/g, '');
				identified = CardService.detectedBrand(value);

				if (!self.CardValid(value, identified.limit)) {
					return false;
				}
			}
			return identified;
		};

		this.clearFormat = function (cardNumber) {
			return cardNumber ? cardNumber.replace(/[^\d]+/g, '') : cardNumber;
		};
	}
})();
