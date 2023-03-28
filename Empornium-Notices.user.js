// ==UserScript==
// @name         Empornium - Notices
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Empornium-Notices/raw/master/Empornium-Notices.user.js
// @version      1.4.0
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




	class EmpNotices {
	constructor() {
		this.getNotices();
	}




	async getNotices(root=null) {
		const items = $$(root||document, '#nav_userinfo > ul > li.highlight, #navmenu_notifications, .alertbar > [href*="subscribed_collages"]');
		const parts = await Promise.all(items.map(item=>this.handleItem(item)));
		const thin = $('#content > .thin');
		const h2 = $('#content > .thin > h2');
		let before;
		if (h2) {
			before = h2.nextElementSibling;
		} else {
			before = thin.children[0];
		}
		const container = document.createElement('div'); {
			container.style.marginBottom = '20px';
			parts.forEach(part=>container.append(part));
			thin.insertBefore(container, before);
		}
	}

	async handleItem(item) {
		switch (item.id || item.href.replace(/^.*action=([^&]+).*$/, '$1')) {
			case 'navmenu_inbox': {
				return this.handleInbox($(item, 'a') || item);
			}
			case 'navmenu_subscriptions': {
				return this.handleSubscriptions($(item, 'a') || item);
			}
			case 'subscribed_collages': {
				return this.handleTorrentTables($(item, 'a') || item);
			}
			case 'navmenu_notifications': {
				return this.handleTorrentTables($(item, 'a') || item);
			}
			default: {
				log('UNHANDLED: ', item);
			}
		}
	}




	async handleInbox(item) {
		const html = await getHtml(item.href);
		const frag = document.createDocumentFragment();
		frag.append($(html, '#content > .thin > .head'));
		const content = $(html, '#content > .thin > .box.pad');
		$(content, '#searchbox').remove();
		const tbl = $(html, '#messageform table');
		log(tbl.nextSibling);
		$$(content, '#messageform > input').forEach(it=>it.remove());
		while (tbl.nextSibling && tbl.nextSibling.nodeType == Node.TEXT_NODE) {
			log('removing text node');
			tbl.nextSibling.remove();
		}
		$$(content, '#messageform > table > tbody > tr').filter(it=>!it.classList.contains('unreadpm')).forEach(it=>it.remove());
		frag.append(content);

		return frag;
	}




	async handleSubscriptions(item) {
		const html = await getHtml(item.href);
		const frag = document.createDocumentFragment();
		const head = Array.from(html.querySelectorAll('.head')).find(it=>!it.classList.contains('latest_threads'));
		const body = head.nextElementSibling;
		frag.append(head);
		frag.append(body);

		return frag;
	}




	async handleTorrentTables(item) {
		const html = await getHtml(item.href);
		const frag = document.createDocumentFragment();
		const elements = [];
		$$(html, '.torrent_table').forEach(table=>{
			elements.push(table.previousElementSibling);
			elements.push(table);
			frag.append(table.previousElementSibling);
			frag.append(table);
		});

		$$(frag, '.head > a').filter(it=>it.textContent.trim() == 'Clear').forEach(clearLink=>{
			clearLink.addEventListener('click', async(evt)=>{
				evt.preventDefault();
				evt.stopPropagation();
				const newHtml = await getHtml(clearLink.href);
				elements.forEach(it=>it.remove());
				const newFrag = document.createDocumentFragment();
				$$(html, '.torrent_table').forEach(table=>{
					elements.push(table.previousElementSibling);
					elements.push(table);
					newFrag.append(table.previousElementSibling);
					newFrag.append(table);
				});
			});
		});
		
		return frag;
	}
}
	const app = new EmpNotices();
})();