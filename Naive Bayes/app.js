/* ===== Particle Background ===== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 3;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.3 + 0.15;
        this.hue = 240 + Math.random() * 60;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 70%, 55%, ${this.opacity})`;
        ctx.fill();
    }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 150)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* ===== Scroll Animations (Intersection Observer) ===== */
const observerOpts = { threshold: 0.15 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOpts);

document.querySelectorAll('.info-card, .proscons-card, .formula-card, .arch-layer').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

/* ===== SVG Connection Lines ===== */
function drawConnections() {
    const svg = document.getElementById('archSvg');
    const container = document.querySelector('.architecture-canvas');
    if (!svg || !container) return;

    // Remove old lines
    svg.querySelectorAll('.conn-line').forEach(l => l.remove());

    const containerRect = container.getBoundingClientRect();
    const getCenter = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
            x: r.left - containerRect.left + r.width / 2,
            y: r.top - containerRect.top + r.height / 2,
            bottom: r.top - containerRect.top + r.height,
            top: r.top - containerRect.top
        };
    };

    const connections = [
        // Input -> Features
        ['node-data', 'node-f1'], ['node-data', 'node-f2'],
        ['node-data', 'node-f3'], ['node-data', 'node-f4'],
        // Features -> Probability
        ['node-f1', 'node-prior'], ['node-f1', 'node-likelihood'],
        ['node-f2', 'node-likelihood'], ['node-f2', 'node-evidence'],
        ['node-f3', 'node-likelihood'], ['node-f3', 'node-evidence'],
        ['node-f4', 'node-prior'], ['node-f4', 'node-likelihood'],
        // Probability -> Bayes
        ['node-prior', 'node-bayes'], ['node-likelihood', 'node-bayes'], ['node-evidence', 'node-bayes'],
        // Bayes -> Output
        ['node-bayes', 'node-c1'], ['node-bayes', 'node-c2']
    ];

    connections.forEach(([from, to]) => {
        const a = getCenter(from);
        const b = getCenter(to);
        if (!a || !b) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x);
        line.setAttribute('y1', a.bottom);
        line.setAttribute('x2', b.x);
        line.setAttribute('y2', b.top);
        line.setAttribute('stroke', 'rgba(99, 102, 241, 0.25)');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('class', 'conn-line');
        svg.appendChild(line);
    });
}

setTimeout(drawConnections, 500);
window.addEventListener('resize', drawConnections);

/* ===== Architecture Node Click (Modal) ===== */
const nodeInfo = {
    input: {
        icon: '📄', title: 'Dataset (Input)',
        desc: 'Data training yang berisi sampel-sampel dengan fitur dan label kelas. Contoh: kumpulan email yang sudah dilabeli sebagai spam atau ham.',
        details: 'Dataset dibagi menjadi training set dan test set. Training set digunakan untuk menghitung probabilitas, sedangkan test set digunakan untuk evaluasi.'
    },
    feature: {
        icon: '🔤', title: 'Fitur (Feature)',
        desc: 'Atribut atau karakteristik yang diekstrak dari data. Dalam klasifikasi email, fitur bisa berupa kata-kata tertentu yang muncul dalam email.',
        details: 'Asumsi "naive" pada Naive Bayes berarti semua fitur dianggap independen satu sama lain. Meskipun jarang benar di dunia nyata, asumsi ini menyederhanakan perhitungan secara signifikan.'
    },
    prior: {
        icon: '📋', title: 'Prior Probability P(C)',
        desc: 'Probabilitas awal dari setiap kelas sebelum melihat fitur apapun. Dihitung dari proporsi data training.',
        details: 'Contoh: Jika 40 dari 100 email di training set adalah spam, maka P(Spam) = 0.4 dan P(Ham) = 0.6'
    },
    likelihood: {
        icon: '⚡', title: 'Likelihood P(X|C)',
        desc: 'Probabilitas fitur X muncul dalam kelas C. Dihitung untuk setiap kombinasi fitur-kelas dari data training.',
        details: 'Untuk Multinomial NB: P(kata|Spam) = (jumlah kata di spam + 1) / (total kata di spam + ukuran vocabulary). Laplace smoothing (+1) mencegah probabilitas nol.'
    },
    evidence: {
        icon: '🎯', title: 'Evidence P(X)',
        desc: 'Probabilitas total fitur X muncul di semua kelas. Berfungsi sebagai normalisasi agar posterior menjadi probabilitas valid.',
        details: 'P(X) = Σ P(X|Cᵢ) × P(Cᵢ) untuk semua kelas i. Sering diabaikan saat hanya membandingkan kelas karena nilainya konstan.'
    },
    bayes: {
        icon: '🧠', title: 'Teorema Bayes',
        desc: 'Inti dari algoritma: menggabungkan prior, likelihood, dan evidence untuk menghitung posterior probability setiap kelas.',
        details: 'Untuk multiple fitur: P(C|X₁,...,Xₙ) ∝ P(C) × ∏ P(Xᵢ|C). Kelas dengan posterior tertinggi dipilih sebagai prediksi.'
    },
    output: {
        icon: '📊', title: 'Hasil Klasifikasi',
        desc: 'Kelas dengan probabilitas posterior tertinggi dipilih sebagai prediksi akhir (argmax).',
        details: 'ŷ = argmax P(C) × ∏ P(Xᵢ|C). Confidence level ditunjukkan oleh selisih probabilitas antar kelas.'
    }
};

document.querySelectorAll('.arch-node').forEach(node => {
    node.addEventListener('click', () => {
        const key = node.getAttribute('data-info');
        const info = nodeInfo[key];
        if (!info) return;
        document.getElementById('modalIcon').textContent = info.icon;
        document.getElementById('modalTitle').textContent = info.title;
        document.getElementById('modalDesc').textContent = info.desc;
        document.getElementById('modalDetails').textContent = info.details;
        document.getElementById('modalOverlay').classList.add('open');
    });
});

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ===== Scroll to Section ===== */
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

/* ===== Demo: Email Classification ===== */
const emails = [
    {
        text: "Selamat! Anda memenangkan hadiah Rp 100.000.000! Klik link ini segera!",
        tokens: ["selamat", "memenangkan", "hadiah", "100.000.000", "klik", "link", "segera"],
        spam: 0.94, ham: 0.06, label: "SPAM"
    },
    {
        text: "Meeting besok jam 10 pagi di ruang meeting lantai 3. Mohon kehadirannya.",
        tokens: ["meeting", "besok", "jam", "pagi", "ruang", "lantai", "mohon", "kehadiran"],
        spam: 0.08, ham: 0.92, label: "HAM"
    },
    {
        text: "DISKON BESAR! Beli sekarang gratis ongkir! Penawaran terbatas!!!",
        tokens: ["diskon", "besar", "beli", "sekarang", "gratis", "ongkir", "penawaran", "terbatas"],
        spam: 0.89, ham: 0.11, label: "SPAM"
    },
    {
        text: "Laporan bulanan sudah tersedia di folder shared drive. Silakan review sebelum Jumat.",
        tokens: ["laporan", "bulanan", "tersedia", "folder", "shared", "drive", "review", "jumat"],
        spam: 0.05, ham: 0.95, label: "HAM"
    }
];

let selectedEmail = 0;

function selectEmail(idx) {
    selectedEmail = idx;
    document.querySelectorAll('.email-option').forEach((el, i) => {
        el.classList.toggle('active', i === idx);
    });
}

function classifyEmail() {
    const email = emails[selectedEmail];
    const steps = [
        { id: 1, delay: 0, detail: email.tokens.join(', ') },
        { id: 2, delay: 800, detail: `P(Spam)=0.40, P(Ham)=0.60` },
        { id: 3, delay: 1600, detail: `∏P(Xᵢ|Spam), ∏P(Xᵢ|Ham)` },
        { id: 4, delay: 2400, detail: `P(Spam|X)=${email.spam.toFixed(2)}, P(Ham|X)=${email.ham.toFixed(2)}` },
        { id: 5, delay: 3200, detail: `Prediksi: ${email.label}` }
    ];

    // Reset
    for (let i = 1; i <= 5; i++) {
        const step = document.getElementById(`step${i}`);
        step.classList.remove('active', 'done');
        document.getElementById(`step${i}Status`).textContent = '⏳';
        document.getElementById(`step${i}Detail`).textContent = 'Menunggu...';
    }
    document.getElementById('resultContent').innerHTML = `
        <div class="result-placeholder">
            <div class="result-placeholder-icon" style="animation: float 2s ease infinite">⏳</div>
            <p>Memproses klasifikasi...</p>
        </div>`;

    steps.forEach(s => {
        setTimeout(() => {
            const step = document.getElementById(`step${s.id}`);
            step.classList.add('active');
            document.getElementById(`step${s.id}Detail`).textContent = s.detail;
            document.getElementById(`step${s.id}Status`).textContent = '🔄';

            setTimeout(() => {
                step.classList.remove('active');
                step.classList.add('done');
                document.getElementById(`step${s.id}Status`).textContent = '✅';
            }, 600);
        }, s.delay);
    });

    // Show result
    setTimeout(() => {
        const isSpam = email.label === 'SPAM';
        document.getElementById('resultContent').innerHTML = `
            <div class="result-bars">
                <div class="result-bar-item">
                    <div class="result-bar-label">
                        <span>🚫 Spam</span>
                        <span>${(email.spam * 100).toFixed(0)}%</span>
                    </div>
                    <div class="result-bar-track">
                        <div class="result-bar-fill spam" style="width: 0%"></div>
                    </div>
                </div>
                <div class="result-bar-item">
                    <div class="result-bar-label">
                        <span>✉️ Ham</span>
                        <span>${(email.ham * 100).toFixed(0)}%</span>
                    </div>
                    <div class="result-bar-track">
                        <div class="result-bar-fill ham" style="width: 0%"></div>
                    </div>
                </div>
            </div>
            <div class="result-verdict ${isSpam ? 'spam-verdict' : 'ham-verdict'}">
                ${isSpam ? '🚫 SPAM Detected!' : '✉️ Email Aman (HAM)'}
            </div>`;

        // Animate bars
        requestAnimationFrame(() => {
            setTimeout(() => {
                document.querySelector('.result-bar-fill.spam').style.width = `${email.spam * 100}%`;
                document.querySelector('.result-bar-fill.ham').style.width = `${email.ham * 100}%`;
            }, 50);
        });
    }, 4000);
}

/* ===== Full Demo: Animate Data Flow ===== */
function startFullDemo() {
    scrollToSection('architecture');

    const nodes = ['node-data', 'node-f1', 'node-f2', 'node-f3', 'node-f4',
                   'node-prior', 'node-likelihood', 'node-evidence',
                   'node-bayes', 'node-c1', 'node-c2'];

    // Reset all
    document.querySelectorAll('.arch-node').forEach(n => n.classList.remove('active-node'));

    const delays = [0, 600, 700, 800, 900, 1500, 1600, 1700, 2400, 3200, 3300];

    nodes.forEach((id, i) => {
        setTimeout(() => {
            const el = document.getElementById(id);
            el.classList.add('active-node');
            // Remove active after a bit
            setTimeout(() => el.classList.remove('active-node'), 1200);
        }, delays[i]);
    });

    // Create flowing particles
    setTimeout(() => createFlowParticles(), 200);
}

function createFlowParticles() {
    const container = document.querySelector('.architecture-canvas');
    const containerRect = container.getBoundingClientRect();

    const getPos = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
            x: r.left - containerRect.left + r.width / 2,
            y: r.top - containerRect.top + r.height
        };
    };

    const getTopPos = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
            x: r.left - containerRect.left + r.width / 2,
            y: r.top - containerRect.top
        };
    };

    const paths = [
        { from: 'node-data', to: 'node-f1', delay: 0, color: '#60a5fa' },
        { from: 'node-data', to: 'node-f2', delay: 100, color: '#22d3ee' },
        { from: 'node-data', to: 'node-f3', delay: 200, color: '#60a5fa' },
        { from: 'node-data', to: 'node-f4', delay: 300, color: '#22d3ee' },
        { from: 'node-f1', to: 'node-likelihood', delay: 900, color: '#a78bfa' },
        { from: 'node-f2', to: 'node-likelihood', delay: 1000, color: '#a78bfa' },
        { from: 'node-f3', to: 'node-evidence', delay: 1100, color: '#fb923c' },
        { from: 'node-f4', to: 'node-prior', delay: 1200, color: '#34d399' },
        { from: 'node-prior', to: 'node-bayes', delay: 2000, color: '#6366f1' },
        { from: 'node-likelihood', to: 'node-bayes', delay: 2100, color: '#6366f1' },
        { from: 'node-evidence', to: 'node-bayes', delay: 2200, color: '#6366f1' },
        { from: 'node-bayes', to: 'node-c1', delay: 2900, color: '#34d399' },
        { from: 'node-bayes', to: 'node-c2', delay: 3000, color: '#f87171' },
    ];

    paths.forEach(p => {
        setTimeout(() => {
            const start = getPos(p.from);
            const end = getTopPos(p.to);
            if (!start || !end) return;
            animateParticleFlow(container, start, end, p.color);
        }, p.delay);
    });
}

function animateParticleFlow(container, start, end, color) {
    const particle = document.createElement('div');
    particle.className = 'data-particle';
    particle.style.left = start.x + 'px';
    particle.style.top = start.y + 'px';
    particle.style.color = color;
    particle.style.backgroundColor = color;
    container.appendChild(particle);

    const duration = 600;
    const startTime = performance.now();

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

        particle.style.left = (start.x + (end.x - start.x) * eased) + 'px';
        particle.style.top = (start.y + (end.y - start.y) * eased) + 'px';
        particle.style.opacity = progress < 0.8 ? 1 : 1 - (progress - 0.8) / 0.2;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            particle.remove();
        }
    }
    requestAnimationFrame(animate);
}

/* ===== Formula Legend Hover ===== */
document.querySelectorAll('.legend-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        const part = item.getAttribute('data-part');
        document.querySelectorAll('.formula-part').forEach(fp => {
            fp.style.opacity = '0.3';
            fp.style.transform = 'scale(0.95)';
        });
        const target = document.querySelector(`.formula-part.${part}`);
        if (target) {
            target.style.opacity = '1';
            target.style.transform = 'scale(1.1)';
        }
    });
    item.addEventListener('mouseleave', () => {
        document.querySelectorAll('.formula-part').forEach(fp => {
            fp.style.opacity = '1';
            fp.style.transform = 'scale(1)';
        });
    });
});

/* ===== Auto-redraw connections on scroll ===== */
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => { drawConnections(); ticking = false; });
        ticking = true;
    }
});
