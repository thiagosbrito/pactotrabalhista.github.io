/*
Projeto: redepay-portal
Author/Empresa: Concrete Solutions / Rede
Copyright (C) 2015 Rede S.A.
*/

(function () {
	'use strict';

	angular
		.module('app')
		.service('RegisterCardService', RegisterCardService);

	RegisterCardService.$inject = ['$q', 'MessageService', 'NewUser', 'EncryptService', 'PayerService',
	'Session', 'CardValidatorService'];

	function RegisterCardService($q, MessageService, NewUser, EncryptService, PayerService,
	Session, CardValidatorService) {

		this.types = [
			{
				id: 'CONNECT_ITAU',
				title: 'Itaú',
				classe: 'itau',
				img: config.staticPath + 'assets/images/logo-itau.png'
			},
			{
				id: 'CONNECT_HIPERCARD',
				title: 'Hipercard',
				classe: 'hipercard',
				img: config.staticPath + 'assets/images/hipercard-logo.png'
			},
			{
				id: 'CONNECT_CREDICARD',
				title: 'Credicard',
				classe: 'credicard',
				img: config.staticPath + 'assets/images/svgs/credicard_white.svg'
			},
			{
				id: 'GUEST',
				title: 'Guest',
				classe: 'guest'
			}
		];

		this.messageCardCreate = {
			itauConnect1AttemptLeft: 'Senha incorreta. Você possui mais uma tentativa. ' +
			'Caso esteja incorreta, sua senha será bloqueada.',
			itauConnect2AttemptsLeft: 'Senha incorreta. Você possui mais duas tentativas.',
			itauConnectGenericError: 'Senha incorreta. Sua senha foi bloqueada para sua segurança. ' +
			'Por favor, entre em contato com a central de atendimento do seu cartão ou utilize outro cartão.',
			itauConnectSuspendedCreditCard: 'Sua senha foi bloqueada para sua segurança. ' +
			'Por favor, entre em contato com a central de atendimento do seu cartão ou utilize outro cartão.',
			itauConnectRetryWithAnotherCreditCard: 'Por favor, tente novamente com outro cartão.',
			itauConnectRestricted: 'Por favor, tente novamente com outro cartão.',
			default: 'Ocorreu um problema ao verificar sua senha. Por favor, tente novamente.'
		};

		this.messageCardUpgrade = this.messageCardCreate;
		this.messageCardUpgrade.itauConnectRestricted = 'Por favor, prossiga sua compra sem a digitação da senha.';

		this.SaveCardGuest = function(card) {
			var def = $q.defer();
			var self = this;
			self.encrypt(card.cardNumber, function (number) {
				var validThru = self.handleValidThru(card.validThru);
				NewUser.setCard(
					number,
					self.getDisplayNumber(card.cardNumber),
					card.cvv,
					validThru.expirationMonth,
					validThru.expirationYear,
					card.brand);

				def.resolve(NewUser.data);
			});

			return def.promise;
		};

		this.SaveCardConnect = function(card) {
			var def = $q.defer();
			var self = this;

			self.checkedPassword(card, function(response, error) {
				if (error) {
					def.reject();
					return;
				}

				self.encrypt(card.password, function (pin) {
					self.encrypt(card.cardNumber, function(number) {
						PayerService.createItau(
							self.strip(NewUser.data.cpf),
							NewUser.data.email,
							NewUser.data.fullName,
							self.strip(NewUser.data.phoneNumber),
							number,
							pin
						).then(function (response) {
							NewUser.data.itau = response.data;
							def.resolve();
						}).catch(function (response) {
							var message = self.messageCardCreate[response.data.messageCode ? response.data.messageCode : 'default'];
							MessageService.show(message);
							def.reject({password: '', message: message});
						});
					});
				});
			});

			return def.promise;
		};

		this.upgradeCardConnect = function(card) {
			var def = $q.defer();
			var self = this;

			self.checkedPassword(card, function(response, error) {
				if (error) {
					def.reject();
					return;
				}

				self.encrypt(card.password, function (pin) {
					self.encrypt(card.cardNumber, function(number) {
						PayerService.upgrade(number, pin).then(function (response) {
							Session.create(response.data.sessionId);
							MessageService.show('Seu cartão foi habilitado com sucesso.');
							def.resolve();
						}).catch(function (response) {
							var message = self.messageCardUpgrade[response.data.messageCode ? response.data.messageCode : 'default'];
							MessageService.show(message);
							def.reject({password: '', message: message});
						});
					});
				});
			});

			return def.promise;
		};

		this.checkedPassword = function(card, callback) {
			var error = false;
			card.password = card.password || '';

			if (card.password.length < 4) {
				MessageService.show('Por favor digite a senha de 4 dígitos do cartão para continuar.');
				error = true;
			}

			callback(card, error);
		};

		this.encrypt = function(value, fn) {
			EncryptService.encrypt(CardValidatorService.clearFormat(value)).then(function (response) {
				fn(response);
			})
			.catch(function () {
				MessageService.show('Erro de servidor');
			});
		};

		this.getDisplayNumber = function(number) {
			if (!number) {
				return;
			}
			number = number.slice(-4);
			return number;
		};

		this.strip = function(value) {
			return value ? value.toString().replace(/[^a-zA-Z0-9]/g, '') : value;
		};

		this.handleValidThru = function(validThru) {
			return {
				expirationMonth: validThru.replace(/[^\d]+/g,'').substring(0,2),
				expirationYear: validThru.replace(/[^\d]+/g,'').substring(2,4)
			};
		};
	}
})();
