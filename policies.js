function togglePolicy(header) {
  const content = header.nextElementSibling;
  const isOpen = content.style.display === "block";

  document.querySelectorAll(".policy-content").forEach(p => {
    p.style.display = "none";
  });

  content.style.display = isOpen ? "none" : "block";
}
