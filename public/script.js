let allProducts = [];
let selectedProduct = null;
let currentFilter = 'all';
let currentSearch = '';

// API Base URL
const API_URL = '/api';

// Product Rendering
async function fetchProducts() {
    try {
        // Add cache busting timestamp
        const response = await fetch(`${API_URL}/products?t=${Date.now()}`);
        if (!response.ok) throw new Error('Network response was not ok');

        allProducts = await response.json();
        console.log('Products fetched:', allProducts.length);
        renderProducts();
    } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback or empty state
        const grid = document.querySelector('.product-grid');
        if (grid) grid.innerHTML = '<p style="color: white; text-align: center;">Impossible de charger les produits pour le moment.</p>';
    }
}

function renderProducts() {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let filteredProducts = currentFilter === 'all'
        ? allProducts
        : allProducts.filter(p => p.category === currentFilter);

    if (currentSearch) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(currentSearch.toLowerCase())) ||
            (p.tag && p.tag.toLowerCase().includes(currentSearch.toLowerCase()))
        );
    }

    filteredProducts.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;

        const formattedPrice = product.price.toLocaleString('fr-FR');

        const imgStr = String(product.image || product.icon || '');
        const isFontAwesome = imgStr.startsWith('fa-');
        const imageHtml = isFontAwesome
            ? `<i class="fas ${imgStr}"></i>`
            : `<img src="${imgStr}" alt="${product.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/150?text=Produit'">`;

        card.innerHTML = `
            <div class="product-image ${isFontAwesome ? 'has-icon' : ''}" onclick="openDetailModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <span class="tag">${product.tag || ''}</span>
                ${imageHtml}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <span class="price">${formattedPrice} FCFA</span>
                <button class="add-cart-btn" onclick="openOrderModal('${product.name}', ${product.price})">
                    Offrir ce Cadeau
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Add Custom Order Card
    if (currentFilter === 'all' && !currentSearch) {
        const customCard = document.createElement('div');
        customCard.className = 'product-card custom-gift-card';
        customCard.style.animation = `fadeIn 0.5s ease forwards ${filteredProducts.length * 0.1}s`;
        customCard.innerHTML = `
            <div class="product-image has-icon" onclick="openCustomOrderModal()">
                <span class="tag">Sur Mesure</span>
                <i class="fas fa-magic"></i>
            </div>
            <div class="product-info">
                <h3>Cadeau Personnalisé</h3>
                <span class="price">Sur Devis</span>
                <button class="add-cart-btn" onclick="openCustomOrderModal()" style="border-color: var(--accent); color: var(--accent);">
                    Créer mon Cadeau
                </button>
            </div>
        `;
        grid.appendChild(customCard);
    }
}

// Modal Logic
const modal = document.getElementById('order-modal');
const closeBtn = document.querySelector('.close-btn');
const form = document.getElementById('surprise-form');
const stepInfo = document.getElementById('step-info');
const stepPayment = document.getElementById('step-payment');
const stepRedirection = document.getElementById('step-redirection');
const stepOTP = document.getElementById('step-otp');

function openOrderModal(productName, price) {
    selectedProduct = { name: productName, price: price };
    modal.style.display = 'flex';
    document.querySelector('.modal-title').textContent = `Offrir : ${productName}`;

    // Hide custom content field by default
    document.getElementById('custom-content-group').style.display = 'none';
    document.getElementById('custom-content').removeAttribute('required');

    showInfo();
}

function openCustomOrderModal() {
    selectedProduct = { name: 'Cadeau Personnalisé', price: 0 };
    modal.style.display = 'flex';
    document.querySelector('.modal-title').textContent = "Votre Surprise Sur Mesure";

    // Show custom content field
    document.getElementById('custom-content-group').style.display = 'block';
    document.getElementById('custom-content').setAttribute('required', 'true');

    showInfo();
}

function showPayment() {
    const inputs = stepInfo.querySelectorAll('input, textarea');
    let valid = true;
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value) {
            valid = false;
            input.style.borderColor = 'red';
        } else {
            input.style.borderColor = '';
        }
    });

    if (valid) {
        stepInfo.style.display = 'none';
        stepOTP.style.display = 'none';
        stepPayment.style.display = 'block';
        const priceText = selectedProduct.price === 0 ? "Prix à déterminer (Contactez-nous pour un devis)" : "Choisissez votre mode de paiement";
        document.querySelector('.modal-subtitle').textContent = priceText;
    } else {
        alert('Veuillez remplir tous les champs obligatoires.');
    }
}

async function startPayment() {
    const paymentSelected = form.querySelector('input[name="payment"]:checked');
    if (!paymentSelected) {
        alert('Veuillez choisir un mode de paiement.');
        return;
    }

    // Basic validation for phone or card inputs
    const phoneInput = document.getElementById('phone-input');
    const cardInput = document.getElementById('card-input');

    if (phoneInput.style.display === 'block' && !phoneInput.querySelector('input').value) {
        alert('Veuillez entrer votre numéro de téléphone.');
        return;
    }

    if (cardInput.style.display === 'block') {
        const cardNum = cardInput.querySelector('input[placeholder="0000 0000 0000 0000"]').value;
        if (!cardNum) {
            alert('Veuillez remplir les informations de votre carte.');
            return;
        }
    }

    // Show Redirection Step
    stepPayment.style.display = 'none';
    stepRedirection.style.display = 'block';
    document.querySelector('.modal-subtitle').textContent = "Connexion sécurisée en cours...";

    const operator = paymentSelected.value;
    const ussdCodeElem = document.getElementById('ussd-code-display');
    const ussdMsgElem = document.getElementById('ussd-msg');

    if (operator === 'om') {
        ussdCodeElem.textContent = "#144*82#";
        ussdMsgElem.textContent = "Composez le code suivant sur votre téléphone Orange :";
    } else if (operator === 'moov') {
        ussdCodeElem.textContent = "*155*4*4#";
        ussdMsgElem.textContent = "Composez le code suivant sur votre téléphone Moov :";
    } else {
        ussdCodeElem.textContent = "PAIEMENT CARTE";
        ussdMsgElem.textContent = "Veuillez suivre les instructions sur l'écran :";
    }

    // Start Timer
    startPaymentTimer(15 * 60);

    // Simulate redirection delay
    setTimeout(() => {
        stepRedirection.style.display = 'none';
        stepOTP.style.display = 'block';
        document.querySelector('.modal-subtitle').textContent = "Validation du paiement";
    }, 2500);
}

let paymentTimerInterval = null;

function startPaymentTimer(duration) {
    if (paymentTimerInterval) clearInterval(paymentTimerInterval);

    let timer = duration, minutes, seconds;
    const display = document.getElementById('payment-timer');

    paymentTimerInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(paymentTimerInterval);
            alert("Le temps alloué au paiement a expiré.");
            showPayment();
        }
    }, 1000);
}

function showOTP() {
    startPayment();
}

function showInfo() {
    if (paymentTimerInterval) clearInterval(paymentTimerInterval);
    stepPayment.style.display = 'none';
    stepRedirection.style.display = 'none';
    stepOTP.style.display = 'none';
    stepInfo.style.display = 'block';
    const subtitle = selectedProduct.price === 0
        ? "Précisez le contenu de votre cadeau sur mesure ci-dessous."
        : "Dites-nous où livrer ce cadeau spécial";
    document.querySelector('.modal-subtitle').textContent = subtitle;
}

// Payment Option Selection
const submitBtn = document.querySelector('#step-payment button[type="submit"]');
const paymentInstruction = document.createElement('div');
paymentInstruction.id = 'payment-instruction';
paymentInstruction.style.cssText = 'margin: 1rem 0; padding: 1rem; background: rgba(245, 158, 11, 0.1); border: 1px solid var(--accent); border-radius: 8px; color: var(--accent); text-align: center; display: none;';
if (submitBtn) {
    submitBtn.parentNode.insertBefore(paymentInstruction, submitBtn);
}

document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const phoneInput = document.getElementById('phone-input');
        const cardInput = document.getElementById('card-input');
        paymentInstruction.style.display = 'none';

        if (e.target.value === 'om' || e.target.value === 'moov') {
            phoneInput.style.display = 'block';
            cardInput.style.display = 'none';
            phoneInput.querySelector('input').setAttribute('required', 'true');
            cardInput.querySelectorAll('input').forEach(i => i.removeAttribute('required'));

            if (e.target.value === 'om') {
                paymentInstruction.innerHTML = '<i class="fas fa-info-circle"></i> Effectuez le transfert au : <br><strong>76 21 55 76</strong>';
                paymentInstruction.style.display = 'block';
            }
        } else {
            phoneInput.style.display = 'none';
            cardInput.style.display = 'block';
            phoneInput.querySelector('input').removeAttribute('required');
            cardInput.querySelectorAll('input').forEach(i => i.setAttribute('required', 'true'));
        }
    });
});

const detailModal = document.getElementById('product-detail-modal');
const closeDetailBtn = document.querySelector('.close-detail-btn');

function openDetailModal(product) {
    const title = document.getElementById('detail-title');
    const tag = document.getElementById('detail-tag');
    const price = document.getElementById('detail-price');
    const desc = document.getElementById('detail-desc');
    const mainImg = document.getElementById('detail-main-image');
    const thumbList = document.getElementById('thumbnail-list');
    const addBtn = document.getElementById('detail-add-cart');

    title.textContent = product.name;
    tag.textContent = product.tag || 'Nouveauté';
    price.textContent = `${product.price.toLocaleString('fr-FR')} FCFA`;
    desc.textContent = product.description || "Une surprise exceptionnelle sélectionnée avec soin par nos experts pour faire plaisir à votre binôme.";

    // Gallery Logic
    thumbList.innerHTML = '';
    const images = product.images && product.images.length > 0 ? product.images : [product.image];

    // Limit to 8 images as requested
    const galleryImages = images.slice(0, 8);

    galleryImages.forEach((imgSrc, idx) => {
        const thumbStr = String(imgSrc || '');
        const isFA = thumbStr.startsWith('fa-');
        const thumb = document.createElement('div');
        thumb.className = `thumbnail ${idx === 0 ? 'active' : ''}`;
        thumb.innerHTML = isFA
            ? `<i class="fas ${thumbStr}"></i>`
            : `<img src="${thumbStr}" alt="Thumbnail">`;

        thumb.onclick = () => {
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            if (isFA) {
                mainImg.parentElement.innerHTML = `<i class="fas ${thumbStr}" id="detail-main-image" style="font-size: 5rem; color: var(--accent);"></i>`;
            } else {
                mainImg.parentElement.innerHTML = `<img id="detail-main-image" src="${thumbStr}" alt="Main Product Image">`;
            }
        };
        thumbList.appendChild(thumb);
    });

    // Set initial main image
    const firstImg = String(galleryImages[0] || '');
    if (firstImg.startsWith('fa-')) {
        mainImg.parentElement.innerHTML = `<i class="fas ${firstImg}" id="detail-main-image" style="font-size: 5rem; color: var(--accent);"></i>`;
    } else {
        mainImg.src = firstImg;
    }

    addBtn.onclick = () => {
        detailModal.style.display = 'none';
        openOrderModal(product.name, product.price);
    };

    detailModal.style.display = 'flex';
}

if (closeBtn) {
    closeBtn.onclick = () => modal.style.display = 'none';
}
if (closeDetailBtn) {
    closeDetailBtn.onclick = () => detailModal.style.display = 'none';
}
window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
    if (e.target === detailModal) detailModal.style.display = 'none';
}

// Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = stepOTP.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    const otpValue = document.getElementById('otp-input').value;
    if (!otpValue || otpValue.length < 4) {
        alert('Veuillez entrer un code de confirmation valide.');
        return;
    }

    // Collect data
    const formData = {
        recipientName: stepInfo.querySelector('input[placeholder="Son nom complet"]').value,
        address: stepInfo.querySelector('input[placeholder="Son adresse exacte"]').value,
        city: stepInfo.querySelector('input[placeholder="Code Postal & Ville"]').value,
        deliveryDate: stepInfo.querySelector('input[type="date"]').value,
        message: document.getElementById('order-message').value,
        customContent: document.getElementById('custom-content').value,
        productName: selectedProduct.name,
        totalAmount: selectedProduct.price,
        paymentMethod: form.querySelector('input[name="payment"]:checked').value,
        phoneNumber: document.getElementById('phone-input').querySelector('input').value,
        confirmationCode: otpValue // Add this line
    };

    btn.textContent = 'Transaction en cours...';
    btn.style.opacity = '0.7';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            btn.textContent = 'Paiement Validé !';
            btn.style.background = '#22c55e';
            btn.style.borderColor = '#22c55e';

            setTimeout(() => {
                modal.style.display = 'none';
                alert('Félicitations ! Votre binôme recevra sa surprise bientôt. Une facture a été enregistrée.');
                form.reset();
                showInfo();
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.disabled = false;
                document.getElementById('phone-input').style.display = 'none';
                document.getElementById('card-input').style.display = 'none';
            }, 1500);
        } else {
            throw new Error('Failed to submit order');
        }
    } catch (err) {
        alert('Erreur lors de la validation. Veuillez réessayer.');
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.opacity = '1';
    }
});

// Newsletter
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input').value;
        try {
            const response = await fetch(`${API_URL}/newsletter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (response.ok) {
                alert('Merci pour votre inscription !');
                newsletterForm.reset();
            } else {
                const data = await response.json();
                alert(data.message || 'Erreur lors de l’inscription.');
            }
        } catch (err) {
            alert('Erreur de connexion au serveur.');
        }
    });
}

// Contact Form
// Contact form removed - now only showing contact information


// Mobile Menu
const menuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
}

// Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderProducts();
    });
});

// Search Logic
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderProducts();
    });
}

if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        searchInput.focus();
        if (window.innerWidth < 768) {
            searchInput.classList.toggle('active');
        }
    });
}

// Navbar Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 5, 24, 0.95)';
            navbar.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(15, 5, 24, 0.85)';
            navbar.style.boxShadow = 'none';
        }
    }
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    // Smooth Scroll for Navigation Links
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Get navbar height for offset
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 80;

                // Calculate position
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

                // Smooth scroll
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if active
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const menuIcon = document.querySelector('.mobile-menu-btn i');
                    if (menuIcon) {
                        menuIcon.classList.remove('fa-times');
                        menuIcon.classList.add('fa-bars');
                    }
                }
            }
        });
    });
});

// Keyframes
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}`;
document.head.appendChild(styleSheet);

