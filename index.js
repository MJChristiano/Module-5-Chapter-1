const themeToggleButton = document.querySelector('.nav__theme-toggle');
const openModalButton = document.querySelector('.mail__btn');
const contactModalLinks = document.querySelectorAll('[data-open-contact-modal="true"]');
const closeModalButton = document.querySelector('.modal__close');
const modal = document.querySelector('.modal');
const modalContact = document.querySelector('.modal__contact');
const landingPage = document.querySelector('#landing-page');
const shapes = document.querySelectorAll('.shape');
const contactForm = document.querySelector('#contact__form');
const formStatus = contactForm?.querySelector('.form__status');
const loadingOverlay = document.querySelector('.modal__overlay--loading');
const successOverlay = document.querySelector('.modal__overlay--success');
const errorOverlay = document.querySelector('.modal__overlay--error');
const errorOverlayMessage = errorOverlay?.querySelector('.modal__overlay-message');
const overlayExitButton = document.querySelector('.modal__exit');
const EMAILJS_PUBLIC_KEY = 'mYb_oVWJFfy9u49s2';
const EMAILJS_SERVICE_ID = 'service_uf2p78e';
const EMAILJS_TEMPLATE_ID = 'template_ie563c5';
const savedTheme = localStorage.getItem('theme');

if (!openModalButton) console.warn('Modal trigger button (.mail__btn) was not found.');
if (!modal) console.warn('Modal container (.modal) was not found.');
if (!contactForm) console.warn('Contact form (#contact__form) was not found.');

document.body.classList.toggle('dark-theme', savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches));

if (window.emailjs) {
	window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

themeToggleButton?.addEventListener('click', () => {
	localStorage.setItem('theme', document.body.classList.toggle('dark-theme') ? 'dark' : 'light');
});

const setFormStatus = (message, type = '') => {
	if (!formStatus) return;
	formStatus.textContent = message;
	formStatus.classList.remove('form__status--success', 'form__status--error');
	if (type === 'success') formStatus.classList.add('form__status--success');
	if (type === 'error') formStatus.classList.add('form__status--error');
};

const clearOverlays = () => {
	loadingOverlay?.classList.remove('modal__overlay--visible');
	successOverlay?.classList.remove('modal__overlay--visible');
	errorOverlay?.classList.remove('modal__overlay--visible');
	if (errorOverlayMessage) {
		errorOverlayMessage.textContent = 'Sorry, something went wrong. Please try again in a moment.';
	}
	modalContact?.classList.remove('modal__contact--overlay-active');
};

const sendEmail = (templateParams) => {
	if (!window.emailjs) {
		return Promise.reject(new Error('Email service is not loaded yet.'));
	}

	return window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
};

const showOverlay = (overlayElement) => {
	clearOverlays();
	overlayElement?.classList.add('modal__overlay--visible');
	if (overlayElement) {
		modalContact?.classList.add('modal__contact--overlay-active');
	}
};

const setModalOpen = (isOpen) => {
	if (!modal) return;
	modal.classList.toggle('modal--open', isOpen);
	modal.setAttribute('aria-hidden', String(!isOpen));
	document.body.classList.toggle('modal-open', isOpen);
	if (isOpen) setFormStatus('');
	clearOverlays();
};

openModalButton?.addEventListener('click', () => setModalOpen(true));
landingPage?.addEventListener('mousemove', moveBackground);
contactModalLinks.forEach((link) => {
	link.addEventListener('click', (event) => {
		event.preventDefault();
		setModalOpen(true);
	});
});
closeModalButton?.addEventListener('click', () => setModalOpen(false));
overlayExitButton?.addEventListener('click', () => {
	clearOverlays();
	setFormStatus('');
});

modal?.addEventListener('click', (event) => {
	if (event.target === modal) setModalOpen(false);
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && modal?.classList.contains('modal--open')) setModalOpen(false);
});

contactForm?.addEventListener('submit', async (event) => {
	event.preventDefault();

	if (!window.emailjs) {
		setFormStatus('Email service is not loaded yet. Please refresh and try again.', 'error');
		return;
	}

	const submitButton = contactForm.querySelector('.form__submit');
	const originalButtonText = submitButton?.textContent || 'Send Message';

	if (submitButton) {
		submitButton.disabled = true;
		submitButton.textContent = 'Sending...';
	}
	showOverlay(loadingOverlay);
	setFormStatus('Sending your message...');

	try {
		const formData = new FormData(contactForm);
		const name = String(formData.get('user_name') || '').trim();
		const email = String(formData.get('user_email') || '').trim();
		const message = String(formData.get('message') || '').trim();
		const templateParams = {
			name,
			email,
			message,
			from_name: name,
			from_email: email,
			reply_to: email,
		};

		if (!templateParams.name || !templateParams.email || !templateParams.message) {
			setFormStatus('Please fill in your name, email, and message before sending.', 'error');
			clearOverlays();
			return;
		}

		await sendEmail(templateParams);
		showOverlay(successOverlay);
		setFormStatus("Thank you for your message. I'll be in touch soon.", 'success');
		contactForm.reset();
	} catch (error) {
		const errorStatus = error?.status ? String(error.status) : '';
		const errorText = error?.text ? String(error.text) : '';
		const errorDetails = [errorStatus, errorText].filter(Boolean).join(' - ');
		const errorMessage = `Sorry, something went wrong. ${errorDetails || 'Please verify your EmailJS template settings and try again.'}`;
		console.error('EmailJS send failed:', errorDetails || error);
		if (errorOverlayMessage) {
			errorOverlayMessage.textContent = errorMessage;
		}
		showOverlay(errorOverlay);
		setFormStatus(errorMessage, 'error');
	} finally {
		if (!successOverlay?.classList.contains('modal__overlay--visible')) {
			loadingOverlay?.classList.remove('modal__overlay--visible');
		}
		if (submitButton) {
			submitButton.disabled = false;
			submitButton.textContent = originalButtonText;
		}
	}
});
const scaleFactor = 1 / 20;

function moveBackground(event) {
	const x = event.clientX * scaleFactor;
	const y = event.clientY * scaleFactor;
	
	for (let i = 0; i < shapes.length; ++i) {
	 const isOdd = i % 2 !== 0;
	 const boolInt = isOdd ? -1 : 1;	
	 shapes[i].style.transform = `translate(${x * boolInt}px, ${y * boolInt}px)`
		}
} 

