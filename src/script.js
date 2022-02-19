// ==UserScript==
// @name         Empornium - Notices
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Empornium-Notices/raw/master/Empornium-Notices.user.js
// @version      1.3.0
// @author       LenAnderson
// @match        https://www.empornium.me/*
// @match        https://www.empornium.is/*
// @match        https://www.empornium.sx/*
// @grant        none
// ==/UserScript==

(()=>{
	'use strict';

	const log = (...msgs)=>console.log.call(console.log, '[EMP-Notices]', ...msgs);
	
	
	const $ = (query,root)=>(root?query:document).querySelector(root?root:query);
	const $$ = (query,root)=>Array.from((root?query:document).querySelectorAll(root?root:query));


	const get = (url) => {
		return new Promise((resolve,reject)=>{
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.addEventListener('load', ()=>{
				resolve(xhr.responseText);
			});
			xhr.addEventListener('error', ()=>{
				reject(xhr);
			});
			xhr.send();
		});
	};
	const getHtml = (url) => {
		return get(url).then(txt=>{
			const html = document.createElement('div');
			html.innerHTML = txt;
			return html;
		});
	};


	const wait = async(millis)=>new Promise(resolve=>setTimeout(resolve, millis));




	${include: EmpNotices.js}
	const app = new EmpNotices();
})();