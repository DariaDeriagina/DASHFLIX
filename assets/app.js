// ------- LOAD JSON & RENDER ROWS -------
window.addEventListener("DOMContentLoaded", () => loadRows());

let galleries = {}; // { rowId: items[] }
let current = { rowId: null, index: 0 };

async function loadRows() {
	try {
		const res = await fetch("./data/shows.json", { cache: "no-store" });
		if (!res.ok) throw new Error(`JSON load failed: ${res.status}`);
		const data = await res.json();

		renderRow("row-new", data.new);
		renderRow("row-trending", data.trending);

		// store for lightbox navigation
		galleries["row-new"] = data.new;
		galleries["row-trending"] = data.trending;

		wireLightbox();
	} catch (err) {
		console.error(err);
		document.getElementById(
			"row-new"
		).innerHTML = `<div style="padding:16px;border:1px solid #444;border-radius:12px;">Could not load data. ${String(
			err
		)}</div>`;
	}
}

function renderRow(id, items = []) {
	const row = document.getElementById(id);
	row.innerHTML = items.map((item, i) => cardHTML(item, id, i)).join("");
}

// NOTE: no external link; we attach data-* so clicks open the lightbox
function cardHTML(item, rowId, index) {
	return `
    <button class="card group text-left" type="button"
            data-lightbox data-row="${rowId}" data-idx="${index}">
      <img src="${item.img}" alt="${item.alt ?? item.title}">
      ${item.tag ? `<span class="badge">${item.tag}</span>` : ""}
      <div class="meta">
        <div class="font-semibold">${item.title}</div>
        <div class="opacity-70 text-xs">Windsor Wednesday · D Series</div>
      </div>
    </button>
  `;
}

// ------- LIGHTBOX -------
function wireLightbox() {
	const lb = document.getElementById("lightbox");
	const img = document.getElementById("lightboxImg");
	const bg = document.getElementById("lightboxBg");
	const btnClose = document.getElementById("lightboxClose");
	const btnPrev = document.getElementById("lightboxPrev");
	const btnNext = document.getElementById("lightboxNext");

	// open
	document.addEventListener("click", (e) => {
		const el = e.target.closest("[data-lightbox]");
		if (!el) return;
		const rowId = el.getAttribute("data-row");
		const index = parseInt(el.getAttribute("data-idx"), 10);
		open(rowId, index);
	});

	function open(rowId, index) {
		current.rowId = rowId;
		current.index = index;
		updateImage();
		lb.classList.remove("hidden");
		document.documentElement.classList.add("no-scroll");
	}

	function close() {
		lb.classList.add("hidden");
		document.documentElement.classList.remove("no-scroll");
	}

	function updateImage() {
		const items = galleries[current.rowId] || [];
		const item = items[current.index];
		if (!item) return;
		img.src = item.img;
		img.alt = item.alt || item.title || "";
		// toggle arrows if single item
		const multi = items.length > 1;
		btnPrev.style.display = multi ? "" : "none";
		btnNext.style.display = multi ? "" : "none";
	}

	// controls
	btnClose.addEventListener("click", close);
	bg.addEventListener("click", close);
	btnPrev.addEventListener("click", () => nav(-1));
	btnNext.addEventListener("click", () => nav(1));

	function nav(delta) {
		const items = galleries[current.rowId] || [];
		if (!items.length) return;
		current.index = (current.index + delta + items.length) % items.length;
		updateImage();
	}

	// keyboard: Esc / arrows
	window.addEventListener("keydown", (e) => {
		if (lb.classList.contains("hidden")) return;
		if (e.key === "Escape") close();
		if (e.key === "ArrowLeft") nav(-1);
		if (e.key === "ArrowRight") nav(1);
	});
}
