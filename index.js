const themeToggleButton = document.querySelector('.nav__theme-toggle');
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
	document.body.classList.add('dark-theme');
}

if (themeToggleButton) {
	themeToggleButton.addEventListener('click', () => {
		const isDarkTheme = document.body.classList.toggle('dark-theme');
		localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
	});
}
function toggleDarkMode() {
  document.body.classList.toggle('dark-theme');
}