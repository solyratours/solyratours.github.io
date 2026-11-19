/* ===== Images: يجرب الامتدادات تلقائياً (jpeg / jpg / png / webp / avif) ===== */
document.querySelectorAll("img[data-img]").forEach(function (img) {
    const base = img.dataset.img;
    const exts = ["jpeg", "jpg", "png", "webp", "avif"];
    let n = 0;
    img.addEventListener("error", function () {
        n++;
        if (n < exts.length) img.src = base + "." + exts[n];
    });
    img.src = base + "." + exts[0];
});

/* ===== Header + parallax on scroll ===== */
const header = document.getElementById("header");
const heroBg = document.getElementById("heroBg");

function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 60);

    if (heroBg && window.scrollY < window.innerHeight) {
        heroBg.style.transform = "translateY(" + window.scrollY * 0.3 + "px) scale(1.1)";
    }
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ===== Gold dust particles in hero ===== */
const particlesBox = document.getElementById("particles");
if (particlesBox) {
    for (let i = 0; i < 24; i++) {
        const p = document.createElement("span");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "%";
        p.style.setProperty("--s", (Math.random() * 4 + 2) + "px");
        p.style.setProperty("--t", (Math.random() * 10 + 8) + "s");
        p.style.setProperty("--dl", (Math.random() * -14) + "s");
        p.style.setProperty("--x", (Math.random() * 120 - 60) + "px");
        particlesBox.appendChild(p);
    }
}

/* ===== Reveal on scroll ===== */
const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(function (el) {
    revealObserver.observe(el);
});

/* ===== Cursor glow + 3D tilt on trip cards ===== */
const glow = document.getElementById("cursorGlow");
if (glow) {
    window.addEventListener("mousemove", function (e) {
        glow.style.opacity = 1;
        glow.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    });
}

document.querySelectorAll(".trip-card").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
        if (!card.classList.contains("visible")) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
            "perspective(1000px) rotateY(" + x * 8 + "deg) rotateX(" + (-y * 8) + "deg) translateY(-6px)";
    });
    card.addEventListener("mouseleave", function () {
        card.style.transform = "";
    });
});

/* ===== Lightbox (مشترك: الريفيوز + معرض صور الرحلات) ===== */
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCount = document.getElementById("lbCount");
let lbList = [];
let lbIndex = 0;

function showImage(i, animate) {
    const total = lbList.length;
    lbIndex = (i + total) % total;

    if (animate) {
        lbImg.classList.add("swap");
        setTimeout(function () {
            lbImg.src = lbList[lbIndex];
            lbImg.classList.remove("swap");
        }, 180);
    } else {
        lbImg.src = lbList[lbIndex];
    }

    lbCount.textContent = (lbIndex + 1) + " / " + total;

    /* تحميل الصورة اللي بعدها والقبلها مسبقاً عشان التنقل يبقى سريع */
    [lbIndex + 1, lbIndex - 1].forEach(function (n) {
        new Image().src = lbList[(n + total) % total];
    });
}

function openLightbox(list, i) {
    lbList = list;
    showImage(i, false);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

if (lightbox) {
    document.getElementById("lbClose").addEventListener("click", closeLightbox);
    document.getElementById("lbPrev").addEventListener("click", function () { showImage(lbIndex - 1, true); });
    document.getElementById("lbNext").addEventListener("click", function () { showImage(lbIndex + 1, true); });

    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") showImage(lbIndex - 1, true);
        if (e.key === "ArrowRight") showImage(lbIndex + 1, true);
    });

    /* السحب بالإصبع على الموبايل */
    let touchStartX = 0;
    lightbox.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) showImage(lbIndex + (dx < 0 ? 1 : -1), true);
    }, { passive: true });
}

/* ===== Reviews: two moving rows (الصفحة الرئيسية) ===== */
/* عدّلي أسماء الصور هنا لو غيرتي ملفاتها أو زودتي صور */
const REVIEW_IMAGES = [
    "images/r1.jpeg",  "images/r2.jpeg",  "images/r3.jpeg",
    "images/r4.jpeg",  "images/r5.jpeg",  "images/r6.jpeg",
    "images/r7.jpeg",  "images/r8.jpeg",  "images/r9.jpeg",
    "images/r10.jpeg", "images/r11.jpeg", "images/r12.jpeg"
];

const reviewRows = document.querySelector(".review-rows");
if (reviewRows) {
    const tracks = document.querySelectorAll(".review-track");
    const half = Math.ceil(REVIEW_IMAGES.length / 2);
    const rowItems = [
        REVIEW_IMAGES.slice(0, half).map(function (src, i) { return { src: src, index: i }; }),
        REVIEW_IMAGES.slice(half).map(function (src, i) { return { src: src, index: i + half }; })
    ];

    tracks.forEach(function (track, rowIndex) {
        const items = rowItems[rowIndex] || [];
        /* 4 نسخ عشان الحركة تكمل من غير ما يظهر فراغ حتى على الشاشات العريضة */
        for (let copy = 0; copy < 4; copy++) {
            items.forEach(function (item) {
                const img = document.createElement("img");
                img.className = "review-img";
                img.src = item.src;
                img.alt = "Guest review " + (item.index + 1);
                img.draggable = false;
                img.dataset.index = item.index;
                if (copy > 0) img.setAttribute("aria-hidden", "true");
                track.appendChild(img);
            });
        }
    });

    reviewRows.addEventListener("click", function (e) {
        const img = e.target.closest(".review-img");
        if (img) openLightbox(REVIEW_IMAGES, Number(img.dataset.index));
    });
}

/* ===== Trip page gallery (safari.html وغيرها) ===== */
const galleryImgs = document.querySelectorAll(".gallery .g-item img");
galleryImgs.forEach(function (img, i) {
    img.parentElement.addEventListener("click", function () {
        const list = Array.from(galleryImgs).map(function (g) { return g.currentSrc || g.src; });
        openLightbox(list, i);
    });
});

/* ===== Red Sea trips: معرض صور لكل رحلة (redsea.html) ===== */
/* بيدور على الصور t1, t2, t3... جوه الفولدر (data-folder) وبيعرض الموجود منها بس */
function probeImage(base) {
    return new Promise(function (resolve) {
        const exts = ["jpg", "jpeg", "png", "webp"];
        let n = 0;
        const probe = new Image();
        probe.onload = function () { resolve(probe.src); };
        probe.onerror = function () {
            n++;
            if (n < exts.length) probe.src = base + "." + exts[n];
            else resolve(null);
        };
        probe.src = base + "." + exts[0];
    });
}

document.querySelectorAll(".sea-media").forEach(function (box) {
    const folder = box.dataset.folder;
    const count = Number(box.dataset.count) || 1;
    const main = box.querySelector(".sea-main");
    const mainImg = box.querySelector(".sea-main-img");
    const thumbsBox = box.querySelector(".sea-thumbs");
    const counter = box.querySelector(".sea-count");
    const prevBtn = box.querySelector(".sea-prev");
    const nextBtn = box.querySelector(".sea-next");

    const probes = [];
    for (let i = 1; i <= count; i++) probes.push(probeImage(folder + "/t" + i));

    Promise.all(probes).then(function (found) {
        const urls = found.filter(Boolean);
        if (!urls.length) {
            box.style.display = "none";
            return;
        }

        let idx = 0;
        const thumbs = [];

        function show(i, animate) {
            idx = (i + urls.length) % urls.length;

            function apply() {
                mainImg.src = urls[idx];
                mainImg.classList.remove("swap");
            }
            if (animate) {
                mainImg.classList.add("swap");
                setTimeout(apply, 160);
            } else {
                apply();
            }

            counter.textContent = (idx + 1) + " / " + urls.length;
            thumbs.forEach(function (t, n) { t.classList.toggle("active", n === idx); });

            const t = thumbs[idx];
            if (t && thumbsBox.scrollWidth > thumbsBox.clientWidth) {
                thumbsBox.scrollTo({
                    left: t.offsetLeft - (thumbsBox.clientWidth - t.clientWidth) / 2,
                    behavior: "smooth"
                });
            }
        }

        urls.forEach(function (url, n) {
            const t = document.createElement("img");
            t.className = "sea-thumb";
            t.src = url;
            t.alt = "Photo " + (n + 1);
            t.addEventListener("click", function () { show(n, true); });
            thumbsBox.appendChild(t);
            thumbs.push(t);
        });

        if (urls.length < 2) {
            thumbsBox.style.display = "none";
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
        }

        prevBtn.addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1, true); });
        nextBtn.addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1, true); });

        /* الضغط على الصورة الكبيرة يفتحها ملء الشاشة */
        main.addEventListener("click", function () { openLightbox(urls, idx); });

        /* السحب بالإصبع على الموبايل */
        let startX = 0;
        main.addEventListener("touchstart", function (e) {
            startX = e.changedTouches[0].clientX;
        }, { passive: true });
        main.addEventListener("touchend", function (e) {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1), true);
        }, { passive: true });

        show(0, false);
    });
});

/* ===== Light / Dark theme toggle ===== */
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        const root = document.documentElement;
        const goDark = root.getAttribute("data-theme") !== "dark";

        if (goDark) {
            root.setAttribute("data-theme", "dark");
        } else {
            root.removeAttribute("data-theme");
        }

        try {
            localStorage.setItem("solyra_theme", goDark ? "dark" : "light");
        } catch (e) {}
    });
}