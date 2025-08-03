// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Animation des cartes au chargement
    animateCards();
    
    // Gestion des formulaires
    setupForms();
    
    // Mise à jour en temps réel des statistiques
    updateStats();
    
    // Gestion des notifications
    setupNotifications();
});

// Animation des cartes
function animateCards() {
    const cards = document.querySelectorAll('.feature-card, .stat-card, .server-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Configuration des formulaires
function setupForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Désactiver le bouton
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enregistrement...';
            
            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    showNotification('Configuration sauvegardée avec succès!', 'success');
                } else {
                    throw new Error('Erreur lors de la sauvegarde');
                }
            } catch (error) {
                showNotification('Erreur lors de la sauvegarde: ' + error.message, 'error');
            } finally {
                // Réactiver le bouton
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    });
}

// Mise à jour des statistiques
function updateStats() {
    const statsElements = document.querySelectorAll('[data-stat]');
    
    if (statsElements.length > 0) {
        setInterval(async () => {
            try {
                const response = await fetch('/api/stats');
                const stats = await response.json();
                
                statsElements.forEach(element => {
                    const statType = element.dataset.stat;
                    if (stats[statType] !== undefined) {
                        element.textContent = stats[statType];
                    }
                });
            } catch (error) {
                console.error('Erreur lors de la mise à jour des stats:', error);
            }
        }, 30000); // Mise à jour toutes les 30 secondes
    }
}

// Système de notifications
function setupNotifications() {
    // Créer le conteneur de notifications
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    document.body.appendChild(notificationContainer);
}

// Afficher une notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Couleurs selon le type
    const colors = {
        success: '#57f287',
        error: '#ed4245',
        warning: '#faa61a',
        info: '#7289da'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    const container = document.getElementById('notification-container');
    container.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Gestion des onglets
function setupTabs() {
    const tabButtons = document.querySelectorAll('[data-tab]');
    const tabContents = document.querySelectorAll('[data-tab-content]');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Désactiver tous les onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activer l'onglet sélectionné
            button.classList.add('active');
            const targetContent = document.querySelector(`[data-tab-content="${targetTab}"]`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Gestion des modales
function setupModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.dataset.modal;
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Fermer les modales
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }
        
        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
}

// Gestion des tooltips
function setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.dataset.tooltip;
            tooltip.style.cssText = `
                position: absolute;
                background: #161b22;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 1000;
                pointer-events: none;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        });
        
        element.addEventListener('mouseleave', () => {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Initialisation des composants
document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    setupModals();
    setupTooltips();
});

// Fonction utilitaire pour formater les nombres
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Fonction pour mettre à jour les compteurs en temps réel
function updateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.counter);
        const duration = 2000; // 2 secondes
        const increment = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = formatNumber(Math.floor(current));
        }, 16);
    });
}

// Appeler la mise à jour des compteurs au chargement
document.addEventListener('DOMContentLoaded', updateCounters); 