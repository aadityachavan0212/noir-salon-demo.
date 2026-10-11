/* NOIR: configuration. Edit these to change contact details. */
const CONFIG = {
  whatsappNumber: "910000000000", // country code + number, digits only (DEMO PLACEHOLDER)
  salonName: "NOIR"
};

document.documentElement.classList.add("js");

/* Image fallback: swap to a graphite panel if a photo fails to load */
document.querySelectorAll("img[data-fallback]").forEach(img => {
  img.addEventListener("error", () => {
    img.removeAttribute("src");
    img.parentElement.classList.add("fallback");
    img.style.visibility = "hidden";
  }, { once: true });
});

/* Navigation: solid on scroll, accessible mobile menu */
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const menu = document.getElementById("navMenu");
const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

function setMenu(open) {
  menu.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
}
toggle.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
});

/* Service links preselect the form */
const serviceSelect = document.getElementById("service");
document.querySelectorAll("[data-service]").forEach(a =>
  a.addEventListener("click", () => { serviceSelect.value = a.dataset.service; updateWhatsApp(); }));

/* Date: no past dates */
const dateInput = document.getElementById("date");
dateInput.min = new Date().toISOString().split("T")[0];

/* WhatsApp link generation */
const form = document.getElementById("bookForm");
function buildWhatsApp() {
  const d = Object.fromEntries(new FormData(form));
  const lines = ["Hi " + CONFIG.salonName + ", I'd like to book an appointment."];
  if (d.service) lines.push("Service: " + d.service);
  if (d.date) lines.push("Preferred date: " + d.date);
  if (d.name) lines.push("Name: " + d.name);
  if (d.message) lines.push("Note: " + d.message);
  return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(lines.join("\n"));
}
function updateWhatsApp() {
  document.getElementById("waBook").href = buildWhatsApp();
  document.getElementById("waContact").href = "https://wa.me/" + CONFIG.whatsappNumber;
}
form.addEventListener("input", updateWhatsApp);
updateWhatsApp();

/* Validation */
function setError(id, msg) {
  const field = document.getElementById(id);
  document.getElementById(id + "Err").textContent = msg;
  field.setAttribute("aria-invalid", msg ? "true" : "false");
  if (msg) field.setAttribute("aria-describedby", id + "Err"); else field.removeAttribute("aria-describedby");
  return !msg;
}
form.addEventListener("submit", e => {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(form));
  const digits = (v.phone || "").replace(/\D/g, "");
  const checks = [
    setError("name", v.name.trim().length < 2 ? "Enter your name." : ""),
    setError("phone", digits.length < 10 || digits.length > 13 ? "Enter a valid phone number with at least 10 digits." : ""),
    setError("service", v.service ? "" : "Choose a service."),
    setError("date", !v.date ? "Choose a date." : v.date < dateInput.min ? "Choose today or a later date." : "")
  ];
  const firstBad = ["name", "phone", "service", "date"][checks.indexOf(false)];
  const result = document.getElementById("result");
  if (firstBad) { result.hidden = true; document.getElementById(firstBad).focus(); return; }

  result.hidden = false;
  result.innerHTML = "";
  const p1 = document.createElement("p");
  p1.textContent = "Thanks, " + v.name.trim() + ". Your details look good, but this is a demo site: nothing was sent and no appointment is booked.";
  const p2 = document.createElement("p");
  p2.className = "muted";
  p2.textContent = "Next step: send these details to the salon on WhatsApp.";
  const a = document.createElement("a");
  a.className = "btn btn--solid";
  a.href = buildWhatsApp(); a.target = "_blank"; a.rel = "noopener";
  a.textContent = "Send on WhatsApp";
  const wrap = document.createElement("div"); wrap.className = "actions"; wrap.appendChild(a);
  result.append(p1, p2, wrap);
  result.focus();
});
