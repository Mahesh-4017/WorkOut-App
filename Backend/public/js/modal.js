export function openModal(id, content = '') { const backdrop = document.getElementById(id); if (content) backdrop.querySelector('.modal').innerHTML = content; backdrop.classList.remove('hidden'); }
export function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }
export function confirmAction(message) {
	return new Promise((resolve) => {
		const backdrop = document.getElementById('confirm-modal');
		backdrop.querySelector('.modal').innerHTML = `<h2>Are you sure?</h2><p>${message}</p><div class="top-actions"><button class="btn secondary" id="cancel-confirm">Cancel</button><button class="btn danger" id="accept-confirm">Delete</button></div>`;
		backdrop.classList.remove('hidden');
		const finish = (value) => { backdrop.classList.add('hidden'); resolve(value); };
		backdrop.querySelector('#cancel-confirm').onclick = () => finish(false);
		backdrop.querySelector('#accept-confirm').onclick = () => finish(true);
	});
}
