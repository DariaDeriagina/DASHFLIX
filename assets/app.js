// app.js — robust fetch using import.meta.url (app.js is in /assets/)
const jsonUrl = new URL("../data/shows.json", import.meta.url); // -> /data/shows.json

window.addEventListener("DOMContentLoaded", loadRows);

async function loadRows() {
	try {
		console.log("Loading JSON from:", jsonUrl.toString());
		const res = await fetch(jsonUrl, { cache: "no-store" });
		if (!res.ok) throw new Error(`JSON load failed: ${res.status}`);
		const data = await res.json();

		renderRow("row-new", data.new);
		renderRow("row-trending", data.trending);
	} catch (err) {
		console.error(err);
		const box = document.getElementById("row-new");
		if (box) {
			box.innerHTML = `<div style="padding:16px;border:1px solid #444;border-radius:12px;">
          Could not load data. Are you running a local server?
          ${String(err)}
        </div>`;
		}
	}
}

function renderRow(id, items = []) {
	const row = document.getElementById(id);
	if (!row) return;
	row.innerHTML = items.map(cardHTML).join("");
}

function cardHTML(item) {
	return `
    <a class="card group" href="${
			item.href || "#"
		}" target="_blank" rel="noopener">
      <img src="${item.img}" alt="${item.alt ?? item.title}" loading="lazy">
      ${item.tag ? `<span class="badge">${item.tag}</span>` : ""}
      <div class="meta">
        <div class="font-semibold">${item.title}</div>
        <div class="opacity-70 text-xs">Windsor Wednesday · D Series</div>
      </div>
    </a>
  `;
}
