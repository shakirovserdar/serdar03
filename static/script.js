// ULTRA MEGA SÜPER INTERACTIVE SCRIPT

document.addEventListener('DOMContentLoaded', function() {
    // Typewriter efekti
    const typewriterText = document.getElementById('typewriterText');
    const messages = [
        "BEN SERDAR SHAKIROV'UN SİTESİYİM",
        "SİZE NASIL YARDIMCI OLABİLİRİM?",
        "MESAJ GÖNDEREBİLİRSİNİZ",
        "PROJELERİMİ İNCELEYEBİLİRSİNİZ",
        "BENİMLE İLETİŞİME GEÇEBİLİRSİNİZ"
    ];
    
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    
    function typeWriter() {
        if (isPaused) return;
        
        const currentMessage = messages[messageIndex];
        
        if (!isDeleting && charIndex <= currentMessage.length) {
            typewriterText.textContent = currentMessage.substring(0, charIndex);
            charIndex++;
            setTimeout(typeWriter, 100);
        } else if (isDeleting && charIndex >= 0) {
            typewriterText.textContent = currentMessage.substring(0, charIndex);
            charIndex--;
            setTimeout(typeWriter, 50);
        } else {
            isDeleting = !isDeleting;
            
            if (!isDeleting) {
                messageIndex = (messageIndex + 1) % messages.length;
            }
            
            // Mesajlar arası bekleme
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
                typeWriter();
            }, 1500);
        }
    }
    
    // Typewriter'ı başlat
    setTimeout(typeWriter, 1000);
    
    // Form gönderme
    const messageForm = document.getElementById('messageForm');
    const messagesContainer = document.getElementById('messagesContainer');
    
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
    
    // Renk paleti etkileşimi
    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', function() {
            const colorName = this.textContent;
            
            // Geçici feedback
            const originalText = this.textContent;
            this.textContent = '✓ SEÇİLDİ!';
            
            setTimeout(() => {
                this.textContent = originalText;
            }, 1000);
            
            // Renk değişikliği efekti
            document.documentElement.style.setProperty('--accent-red', getComputedStyle(this).backgroundColor);
        });
    });
    
    // Kaygan panel efekti için mousemove
    document.addEventListener('mousemove', function(e) {
        const cards = document.querySelectorAll('.message-card, .stats-card, .color-palette');
        
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
                card.style.boxShadow = 'var(--shadow-glow)';
            }
        });
    });
    
    // Sayfa yüklendiğinde mesajları yükle
    loadMessages();
    
    // İstatistikleri her 30 saniyede bir güncelle
    setInterval(updateStats, 30000);
    
    // Gece/gündüz efekti (saate göre)
    function updateTimeBasedTheme() {
        const hour = new Date().getHours();
        const isNight = hour < 6 || hour > 18;
        
        if (isNight) {
            document.documentElement.style.setProperty('--dark-bg', '#050508');
            document.documentElement.style.setProperty('--card-bg', '#0f0f1a');
        } else {
            document.documentElement.style.setProperty('--dark-bg', '#0a0a0f');
            document.documentElement.style.setProperty('--card-bg', '#151520');
        }
    }
    
    updateTimeBasedTheme();
    setInterval(updateTimeBasedTheme, 60000);
});
