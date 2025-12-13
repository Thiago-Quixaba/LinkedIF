function atualizarAvatar(url) {
    const finalUrl = url + "?v=" + Date.now();

    const avatarPerfil = document.querySelector(
        ".profile-shortcut-card .avatar img"
    );
    const avatarHeader = document.querySelector(
        ".top-header .avatar img"
    );
    const preview = document.getElementById("previewFoto");

    if (avatarPerfil) avatarPerfil.src = finalUrl;
    if (avatarHeader) avatarHeader.src = finalUrl;
    if (preview) preview.src = finalUrl;
}

// ============================
// ABRIR MODAL
// ============================
document.getElementById("open-edit-modal").addEventListener("click", () => {
    document.getElementById("edit-modal").classList.add("show");
    document.body.style.overflow = "hidden";
});

// ============================
// FECHAR MODAL
// ============================
function closeEditModal() {
    document.getElementById("edit-modal").classList.remove("show");
    document.body.style.overflow = "auto";
    document.getElementById("msg").textContent = "";
}

document.getElementById("edit-modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("edit-modal")) {
        closeEditModal();
    }
});


// ============================
// UPLOAD DA FOTO – IMGBB
// ============================
document.getElementById("fotoPerfil").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // PREVIEW imediata
    document.getElementById("previewFoto").src = URL.createObjectURL(file);

    let formData = new FormData();
    formData.append("image", file);

    let req = await fetch("/upload_image", {
        method: "POST",
        body: formData
    });

    let res = await req.json();
    console.log(res);

    if (res.success && res.url.startsWith("http")) {
        atualizarAvatar(res.url);
        document.getElementById("photo_url").value = res.url;
    } else {
        alert("Erro ao enviar foto.");
    }
});


// ============================
// SUBMIT DO FORM
// ============================
document.getElementById("formPerfil").addEventListener("submit", async (e) => {
    e.preventDefault();

    let form = new FormData(e.target);

    let req = await fetch("/atualizar_perfil", {
        method: "POST",
        body: form
    });

    let res = await req.json();

    if (res.update) {
        let msg = document.getElementById("msg");
        msg.textContent = "Perfil atualizado!";
        msg.style.color = "lightgreen";

        // Atualiza painel direito
        document.querySelector(".news-card ul li:nth-child(1) p").textContent = form.get("skills");
        document.querySelector(".news-card ul li:nth-child(2) p").textContent = form.get("experiences");
        document.querySelector(".news-card ul li:nth-child(3) p").textContent = form.get("contact");

        // ✅ ATUALIZA FOTO VISUALMENTE
        if (res.photo_url) {
            // Atualiza a imagem no perfil
            document.getElementById("previewFoto").src = res.photo_url;
            document.getElementById("photo_url").value = res.photo_url;  // Atualiza o campo hidden
        }

        setTimeout(() => closeEditModal(), 1500);
    }
});
async function buscarProjetos() {
    let termo = document.getElementById("campoBusca").value.trim();
    let box = document.getElementById("resultadoBusca");
    let listaInicial = document.getElementById("listaInicialProjetos");

    // Se limpar ou digitar pouco, volta lista original
    if (termo.length < 2) {
        box.innerHTML = "";
        listaInicial.style.display = "block";
        return;
    }

    // Esconde lista inicial
    listaInicial.style.display = "none";

    box.innerHTML = "<p style='color: gray;'>Buscando...</p>";

    let req = await fetch(`/buscar_projetos?termo=${encodeURIComponent(termo)}`);
    let res = await req.json();

    let projetos = res.projetos;

    if (!Array.isArray(projetos) || projetos.length === 0) {
        box.innerHTML = `
            <div class="project-card">
                <p style="text-align:center;color:#ccc;padding:20px;">
                    Nenhum projeto encontrado.
                </p>
            </div>`;
        return;
    }

    box.innerHTML = "";

    projetos.forEach(p => {
        box.innerHTML += `
            <div class="project-card">

                <div class="project-header">
                    <div>
                        <h4>${p.professor_nome}</h4>
                        <small>${p.professor_email}</small>
                    </div>
                </div>

                <div class="project-body">
                    <p class="proj-title">${p.title}</p>
                    <p><strong>Descrição:</strong> ${p.description}</p>
                    <p><strong>Requisitos:</strong> ${p.requirements}</p>
                </div>

                <div class="project-actions">
                    <button><i class="fas fa-envelope"></i> Entrar em contato</button>
                    <button><i class="fas fa-share"></i> Compartilhar</button>
                </div>

            </div>
        `;
    });
}
let timeoutBusca;

document.getElementById("campoBusca").addEventListener("input", () => {
    clearTimeout(timeoutBusca);

    timeoutBusca = setTimeout(() => {
        buscarProjetos();
    }, 400);
});
