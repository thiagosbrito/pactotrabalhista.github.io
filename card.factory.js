/*
 Projeto: redepay-portal
 Author/Empresa: Concrete Solutions / Rede
 Copyright (C) 2015 Rede S.A.
 */

(function () {
	'use strict';

	angular
		.module('app')
		.factory('CardFactory', CardFactory);

	function CardFactory() {
		return {
			CardNumber: ''
		};
	}
})();
