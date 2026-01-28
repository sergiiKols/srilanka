// Telegram Web App SDK Polyfill
(function() {
    if (window.Telegram && window.Telegram.WebApp) {
        console.log('Telegram WebApp already loaded');
        return;
    }
    
    window.Telegram = window.Telegram || {};
    window.Telegram.WebApp = {
        initData: '',
        initDataUnsafe: {},
        version: '6.7',
        platform: 'web',
        colorScheme: 'light',
        themeParams: {
            bg_color: '#ffffff',
            text_color: '#000000',
            hint_color: '#999999',
            link_color: '#2481cc',
            button_color: '#2481cc',
            button_text_color: '#ffffff'
        },
        isExpanded: false,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
        headerColor: '#ffffff',
        backgroundColor: '#ffffff',
        isClosingConfirmationEnabled: false,
        BackButton: {
            isVisible: false,
            onClick: function(callback) {},
            offClick: function(callback) {},
            show: function() { this.isVisible = true; },
            hide: function() { this.isVisible = false; }
        },
        MainButton: {
            text: '',
            color: '#2481cc',
            textColor: '#ffffff',
            isVisible: false,
            isActive: true,
            isProgressVisible: false,
            setText: function(text) { this.text = text; },
            onClick: function(callback) {},
            offClick: function(callback) {},
            show: function() { this.isVisible = true; },
            hide: function() { this.isVisible = false; },
            enable: function() { this.isActive = true; },
            disable: function() { this.isActive = false; },
            showProgress: function(leaveActive) { this.isProgressVisible = true; },
            hideProgress: function() { this.isProgressVisible = false; },
            setParams: function(params) {}
        },
        HapticFeedback: {
            impactOccurred: function(style) {},
            notificationOccurred: function(type) {},
            selectionChanged: function() {}
        },
        ready: function() {
            console.log('Telegram WebApp ready (polyfill)');
        },
        expand: function() {
            this.isExpanded = true;
            console.log('Telegram WebApp expanded');
        },
        close: function() {
            console.log('Telegram WebApp close');
        },
        sendData: function(data) {
            console.log('Telegram WebApp sendData:', data);
        },
        openLink: function(url) {
            window.open(url, '_blank');
        },
        openTelegramLink: function(url) {
            window.open(url, '_blank');
        },
        showPopup: function(params, callback) {
            alert(params.message);
            if (callback) callback();
        },
        showAlert: function(message, callback) {
            alert(message);
            if (callback) callback();
        },
        showConfirm: function(message, callback) {
            const result = confirm(message);
            if (callback) callback(result);
        }
    };
    
    console.log('✅ Telegram WebApp polyfill initialized');
})();
