/**
 * Loader Utility for CNGate
 * Manages the full-screen petrol bunk animation
 */

const Loader = {
    inject() {
        if (document.getElementById('cngate-loader')) return;

        const loaderHtml = `
            <div id="cngate-loader" class="loader-overlay">
                <div class="loader-content">
                    <p class="loader-text" id="loader-message">Processing...</p>
                    <div class="animation-container">
                        <div class="circle-pulse"></div>
                        <div class="circle-pulse"></div>
                        <div class="circle-pulse"></div>
                        <div class="inner-circle">
                            <svg class="bunk-svg" viewBox="0 0 100 100">
                                <!-- Petrol Pump -->
                                <rect x="25" y="30" width="15" height="40" rx="2" />
                                <rect x="28" y="34" width="9" height="6" rx="1" />
                                <line x1="25" y1="65" x2="40" y2="65" />
                                
                                <!-- Nozzle/Pipe -->
                                <path class="nozzle-line" d="M40 45 C 50 45, 55 55, 65 52" />
                                
                                <!-- Scooter -->
                                <g class="scooter-body" transform="translate(68, 48)">
                                    <circle cx="0" cy="18" r="4" /> <!-- Back wheel -->
                                    <circle cx="15" cy="18" r="4" /> <!-- Front wheel -->
                                    <path d="M-5 18 L20 18 L20 10 L15 5 L-5 5 Z" /> <!-- Body -->
                                    <rect x="0" y="0" width="8" height="5" /> <!-- Seat -->
                                    <line x1="15" y1="5" x2="18" y2="-5" /> <!-- Handlebar -->
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loaderHtml);
    },

    show(message = "We're setting up!", isAdmin = false) {
        this.inject();
        const loader = document.getElementById('cngate-loader');
        const text = document.getElementById('loader-message');

        if (text) text.textContent = message;
        if (isAdmin) {
            loader.classList.add('admin');
        } else {
            loader.classList.remove('admin');
        }

        loader.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    },

    hide() {
        const loader = document.getElementById('cngate-loader');
        if (loader) {
            loader.classList.remove('active');
            setTimeout(() => {
                document.body.style.overflow = '';
            }, 400);
        }
    }
};

// Make it globally available
window.CngateLoader = Loader;
