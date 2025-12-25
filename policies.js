/*
  WASE Policies Script
  Collapsible sections (one open at a time)
*/

document.addEventListener("DOMContentLoaded", () => {
  const headers = document.querySelectorAll(".policy h2");

  headers.forEach(header => {
    header.addEventListener("click", () => togglePolicy(header));
  });
});

function togglePolicy(activeHeader) {
  const allContents = document.querySelectorAll(".policy-content");

  allContents.forEach(content => {
    if (content !== activeHeader.nextElementSibling) {
      content.style.display = "none";
    }
  });

  const current = activeHeader.nextElementSibling;
  current.style.display = current.style.display === "block" ? "none" : "block";
}

