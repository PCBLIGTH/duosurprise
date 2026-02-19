// TEST SIMPLE - Ajoutez ce code dans la console du navigateur

console.log('🔍 Test du menu Contact...');

// 1. Vérifier que la section contact existe
const contactSection = document.querySelector('#contact');
console.log('Section contact trouvée:', contactSection ? '✅ OUI' : '❌ NON');

// 2. Vérifier que le lien existe
const contactLink = document.querySelector('a[href="#contact"]');
console.log('Lien contact trouvé:', contactLink ? '✅ OUI' : '❌ NON');

// 3. Ajouter l'event listener
if (contactLink && contactSection) {
    contactLink.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('🎯 Clic sur Contact détecté !');

        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        const elementPosition = contactSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        console.log('✅ Scroll vers Contact lancé !');
    });
    console.log('✅ Event listener ajouté au lien Contact');
} else {
    console.log('❌ Impossible d\'ajouter l\'event listener');
}

console.log('✅ Test terminé - Essayez de cliquer sur Contact maintenant !');
