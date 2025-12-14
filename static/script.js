// SERDAR SHAKIROV - TAB PANEL SİSTEMİ

document.addEventListener('DOMContentLoaded', function() {
    // TAB PANEL SİSTEMİ
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // İlk açılışta sadece Anasayfa gösterilsin
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Tüm butonlardan aktif sınıfını kaldır
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Tüm içerikleri gizle
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Tıklanan butonu aktif yap
            this.classList.add('active');
            
            // İlgili içeriği göster
            document.getElementById(tabId).classList.add('active');
            
            // Eğer Anasayfa'ya döndüysek istatistikleri güncelle
            if (tabId === 'home') {
                updateStats();
                updateUserInfo();
            }
        });
    });
    
    // Kullanıcı bilgilerini güncelle
    async function updateUserInfo() {
        try {
            const response = await fetch('/api/userinfo');
            const data = await response.json();
            
            // IP Adresi
            document.getElementById('userIp').textContent = data.ip || 'Bilinmiyor';
            
            // Ülke
            document.getElementById('userCountry').textContent = data.country || 'Bilinmiyor';
            
            // Şehir
            document.getElementById('userCity').textContent = data.city || 'Bilinmiyor';
            
            // Saat dilimi
            const timezone = data.timezone || 'Europe/Moscow';
            document.getElementById('userTimezone').textContent = timezone;
            
            // İnternet sağlayıcısı
            document.getElementById('userISP').textContent = data.isp || 'Bilinmiyor';
            
            // Cihaz ve tarayıcı bilgisi
            const deviceInfo = getDeviceInfo();
            document.getElementById('userDevice').textContent = deviceInfo;
            
            // Kullanıcının yerel saatini göster
            updateLocalTime(timezone);
            
            // Saati her saniye güncelle
            setInterval(() => updateLocalTime(timezone), 1000);
            
        } catch (error) {
            console.error('Kullanıcı bilgileri alınamadı:', error);
            
            // Varsayılan değerler
            document.getElementById('userIp').textContent = 'IP alınamadı';
            document.getElementById('userCountry').textContent = 'Bilinmiyor';
            document.getElementById('userCity').textContent = 'Bilinmiyor';
            document.getElementById('userTimezone').textContent = 'Europe/Moscow';
            document.getElementById('userISP').textContent = 'Bilinmiyor';
            
            updateLocalTime('Europe/Moscow');
        }
    }
    
    // Kullanıcının yerel saatini güncelle
    function updateLocalTime(timezone) {
        try {
            const now = new Date();
            const options = {
                timeZone: timezone,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            };
            
            const formatter = new Intl.DateTimeFormat('tr-TR', options);
            const formattedTime = formatter.format(now);
            
            document.getElementById('userLocalTime').textContent = formattedTime;
        } catch (error) {
            console.error('Saat güncellenemedi:', error);
            document.getElementById('userLocalTime').textContent = 'Saat alınamadı';
        }
    }
    
    // Cihaz ve tarayıcı bilgisini al
    function getDeviceInfo() {
        const userAgent = navigator.userAgent;
        let device = 'Bilinmeyen Cihaz';
        let browser = 'Bilinmeyen Tarayıcı';
        
        // Cihaz tespiti
        if (userAgent.match(/Android/i)) {
            device = 'Android';
        } else if (userAgent.match(/iPhone|iPad|iPod/i)) {
            device = 'iOS';
        } else if (userAgent.match(/Windows/i)) {
            device = 'Windows';
        } else if (userAgent.match(/Mac/i)) {
            device = 'Mac';
        } else if (userAgent.match(/Linux/i)) {
            device = 'Linux';
        }
        
        // Tarayıcı tespiti
        if (userAgent.match(/Chrome/i) && !userAgent.match(/Edg/i)) {
            browser = 'Chrome';
        } else if (userAgent.match(/Firefox/i)) {
            browser = 'Firefox';
        } else if (userAgent.match(/Safari/i) && !userAgent.match(/Chrome/i)) {
            browser = 'Safari';
        } else if (userAgent.match(/Edg/i)) {
            browser = 'Edge';
        } else if (userAgent.match(/Opera|OPR/i)) {
            browser = 'Opera';
        }
        
        return `${device} / ${browser}`;
    }
    
    // Form gönderme
    const messageForm = document.getElementById('messageForm');
    const messagesContainer = document.getElementById('messagesContainer');
    
    if (messageForm) {
        messageForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('nameInput');
            const messageInput = document.getElementById('messageInput');
            const submitBtn = document.querySelector('.submit-btn');
            
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'GÖNDERİLİYOR...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: nameInput.value,
                        message: messageInput.value
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Yeni mesajı listeye ekle
                    addMessageToUI(data.message);
                    
                    // Formu temizle
                    nameInput.value = '';
                    messageInput.value = '';
                    
                    // Başarı animasyonu
                    submitBtn.textContent = '✓ GÖNDERİLDİ!';
                    submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
                    
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }, 2000);
                    
                    // İstatistikleri güncelle
                    updateStats();
                }
            } catch (error) {
                console.error('Hata:', error);
                submitBtn.textContent = '❌ HATA!';
                submitBtn.style.background = 'linear-gradient(135deg, #f44336, #c62828)';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
    }
    
    // Mesajları UI'ya ekleme fonksiyonu
    function addMessageToUI(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-card';
        messageElement.innerHTML = `
            <div class="message-header">
                <div class="message-author">${message.name}</div>
                <div class="message-time">${message.time} • ${message.date}</div>
            </div>
            <div class="message-content">${message.message}</div>
        `;
        
        // En üste ekle
        messagesContainer.insertBefore(messageElement, messagesContainer.firstChild);
        
        // Animasyon
        messageElement.style.animation = 'fadeIn 0.5s ease-out';
    }
    
    // İstatistikleri güncelle
    async function updateStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            
            document.getElementById('totalMessages').textContent = data.total_messages;
            document.getElementById('uniqueVisitors').textContent = data.unique_visitors;
            document.getElementById('serverTime').textContent = data.server_time;
        } catch (error) {
            console.error('İstatistik güncelleme hatası:', error);
        }
    }
    
    // Sayfa yüklendiğinde mesajları getir
    async function loadMessages() {
        try {
            const response = await fetch('/api/messages');
            const data = await response.json();
            
            messagesContainer.innerHTML = '';
            
            if (data.messages && data.messages.length > 0) {
                data.messages.reverse().forEach(message => {
                    addMessageToUI(message);
                });
            } else {
                messagesContainer.innerHTML = `
                    <div class="empty-state">
                        <p style="text-align: center; color: var(--text-muted); padding: 40px;">
                            Henüz mesaj yok. İlk mesajı siz gönderin! ✨
                        </p>
                    </div>
                `;
            }
            
            // İstatistikleri güncelle
            updateStats();
        } catch (error) {
            console.error('Mesaj yükleme hatası:', error);
        }
    }
    
    // Kaygan panel efekti için mousemove
    document.addEventListener('mousemove', function(e) {
        const cards = document.querySelectorAll('.message-card, .project-card');
        
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 25;
                const rotateY = (centerX - x) / 25;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
                card.style.boxShadow = `${rotateY * 2}px ${rotateX * 2}px 30px rgba(0, 0, 0, 0.3)`;
            } else {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
                card.style.boxShadow = '';
            }
        });
    });
    
    // Sayfa yüklendiğinde çalışacak fonksiyonlar
    if (window.location.hash) {
        // Hash varsa ilgili tab'i aç
        const tabId = window.location.hash.substring(1);
        const tabButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (tabButton) {
            tabButton.click();
        }
    }
    
    // Başlangıç fonksiyonlarını çalıştır
    loadMessages();
    updateUserInfo();
    
    // İstatistikleri her 30 saniyede bir güncelle
    setInterval(updateStats, 30000);
});